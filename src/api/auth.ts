import axios from 'axios';

import { bffClient } from './apiClient';

export type CurrentUser = {
  username: string;
  email: string | null;
  role: string | null;
};

type UserResponse = {
  username?: string | null;
  email?: string | null;
  role?: string | null;
};

// "Who am I?" - asked once when the app starts. null means nobody is logged in.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const { data } = await bffClient.get<UserResponse>('/user');

    return {
      username: data.username ?? data.email ?? 'User',
      email: data.email ?? null,
      role: data.role ?? null,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }

    throw error;
  }
}

// Login is not a form in this app. The browser goes to Portio, which runs the login with Projectio
// and Google and brings the user back with a session cookie.
export function login(returnUrl = '/'): void {
  window.location.assign(`/bff/login?returnUrl=${encodeURIComponent(returnUrl)}`);
}

export async function logout(): Promise<void> {
  try {
    await bffClient.post('/logout');
  } finally {
    // Full page load, so nothing of the old session stays in memory
    window.location.assign('/login');
  }
}
