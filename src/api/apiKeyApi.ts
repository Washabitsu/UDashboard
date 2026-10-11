import { apiClient } from './apiClient';
import type {
  ApiKeyCreateSchema,
  ApiKeySchema,
  ListApiKeysResponse,
} from './mlSchemas';

const API_KEYS_BASE_PATH = '/api_keys';

export const createApiKey = async <TResponse = ApiKeySchema>(
  payload: ApiKeyCreateSchema | Record<string, unknown>,
): Promise<TResponse> => {
  const { data } = await apiClient.post<TResponse>(`${API_KEYS_BASE_PATH}/`, payload);
  return data;
};

export const listApiKeys = async <TResponse = ListApiKeysResponse>(): Promise<TResponse> => {
  const { data } = await apiClient.get<TResponse>(`${API_KEYS_BASE_PATH}/`);
  return data;
};

export const getApiKeyById = async <TResponse = ApiKeySchema>(
  apiKeyId: string | number,
): Promise<TResponse> => {
  const { data } = await apiClient.get<TResponse>(`${API_KEYS_BASE_PATH}/${apiKeyId}`);
  return data;
};

export const getApiKeyByModelId = async <TResponse = ListApiKeysResponse>(
  modelId: string | number,
): Promise<TResponse> => {
  const { data } = await apiClient.get<TResponse>(`${API_KEYS_BASE_PATH}/model/${modelId}`);
  return data;
};

export const deleteApiKey = async <TResponse = unknown>(
  apiKeyId: string | number,
): Promise<TResponse> => {
  const { data } = await apiClient.delete<TResponse>(`${API_KEYS_BASE_PATH}/${apiKeyId}`);
  return data;
};
