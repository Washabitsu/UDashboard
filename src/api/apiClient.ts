import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

// Every request goes to our own origin, where Portio (the BFF) answers:
//   /bff      login, logout, "who am I"
//   /api/ml   forwarded to OrchestrML with the user's access token added on the server
// The browser only has a session cookie it can't read. It never sees a token.
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api/ml',
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

const bffClient: AxiosInstance = axios.create({
  baseURL: '/bff',
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

let onUnauthorized: (() => void) | null = null;
let isHandlingUnauthorized = false;

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

// CSRF protection: Portio only accepts a request that changes something (POST, PUT, PATCH, DELETE)
// when it carries the token from /bff/csrf-token in the X-XSRF-TOKEN header.
// Another website can make the browser send our cookie, but it can't read this token.
const CSRF_HEADER = 'X-XSRF-TOKEN';
const SAFE_METHODS = ['get', 'head', 'options'];

type CsrfRequestConfig = InternalAxiosRequestConfig & { csrfRetried?: boolean };

let csrfToken: Promise<string> | null = null;

const getCsrfToken = (): Promise<string> => {
  if (!csrfToken) {
    csrfToken = bffClient
      .get<{ token: string }>('/csrf-token')
      .then(({ data }) => data.token)
      .catch((error) => {
        csrfToken = null;
        throw error;
      });
  }

  return csrfToken;
};

const addCsrfToken = async (config: InternalAxiosRequestConfig) => {
  const method = (config.method ?? 'get').toLowerCase();

  if (!SAFE_METHODS.includes(method)) {
    config.headers.set(CSRF_HEADER, await getCsrfToken());
  }

  return config;
};

// The token stops working when Portio's keys change (e.g. after a restart without stored keys).
// Portio answers 400 then: get a new token and send the request one more time.
const retryWithNewCsrfToken = (client: AxiosInstance) => (error: unknown) => {
  if (axios.isAxiosError(error) && error.config) {
    const config = error.config as CsrfRequestConfig;
    const body = typeof error.response?.data === 'string' ? error.response.data : '';

    if (error.response?.status === 400 && body.includes('CSRF') && !config.csrfRetried) {
      config.csrfRetried = true;
      csrfToken = null;
      return client.request(config);
    }
  }

  return Promise.reject(error);
};

apiClient.interceptors.request.use(addCsrfToken);
bffClient.interceptors.request.use(addCsrfToken);
apiClient.interceptors.response.use((response) => response, retryWithNewCsrfToken(apiClient));
bffClient.interceptors.response.use((response) => response, retryWithNewCsrfToken(bffClient));

// 401 from a service usually means the session is gone (expired or logged out somewhere else).
// Ask Portio before leaving: if it says nobody is logged in, go to the login page.
// If the session is still there, the service itself refused the request. Going to the login page would
// not help then (the app would come straight back and fail again), so the error is left to the page.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401 && !isHandlingUnauthorized) {
      isHandlingUnauthorized = true;

      try {
        const sessionIsGone = await bffClient.get('/user').then(
          () => false,
          (userError) => axios.isAxiosError(userError) && userError.response?.status === 401,
        );

        if (sessionIsGone) {
          onUnauthorized?.();

          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.assign('/login');
          }
        }
      } finally {
        isHandlingUnauthorized = false;
      }
    }

    return Promise.reject(error);
  },
);

export { apiClient, bffClient };
