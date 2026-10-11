import { apiClient } from './apiClient';
import type {
  ListMlAlgorithmsResponse,
  MlAlgorithmCreateSchema,
  MlAlgorithmSchema,
  MlAlgorithmUpdateSchema,
} from './mlSchemas';

const ML_ALGORITHMS_BASE_PATH = '/ml_algorithms';

export const createMlAlgorithm = async <TResponse = MlAlgorithmSchema>(
  payload: MlAlgorithmCreateSchema | Record<string, unknown>,
): Promise<TResponse> => {
  const { data } = await apiClient.post<TResponse>(`${ML_ALGORITHMS_BASE_PATH}/`, payload);
  return data;
};

export const listMlAlgorithms = async <TResponse = ListMlAlgorithmsResponse>(): Promise<TResponse> => {
  const { data } = await apiClient.get<TResponse>(`${ML_ALGORITHMS_BASE_PATH}/`);
  return data;
};

export const getMlAlgorithmById = async <TResponse = MlAlgorithmSchema>(
  algorithmId: string | number,
): Promise<TResponse> => {
  const { data } = await apiClient.get<TResponse>(`${ML_ALGORITHMS_BASE_PATH}/${algorithmId}`);
  return data;
};

export const updateMlAlgorithm = async <TResponse = unknown>(
  algorithmId: string | number,
  payload: MlAlgorithmUpdateSchema | Record<string, unknown>,
): Promise<TResponse> => {
  const { data } = await apiClient.put<TResponse>(`${ML_ALGORITHMS_BASE_PATH}/${algorithmId}`, payload);
  return data;
};

export const deleteMlAlgorithm = async <TResponse = unknown>(
  algorithmId: string | number,
): Promise<TResponse> => {
  const { data } = await apiClient.delete<TResponse>(`${ML_ALGORITHMS_BASE_PATH}/${algorithmId}`);
  return data;
};
