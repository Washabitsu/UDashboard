import { apiClient } from './apiClient';
import type {
  MLModelCreateSchema,
  MLModelSchema,
  MLModelUpdateSchema,
} from './mlSchemas';

const ML_MODELS_BASE_PATH = '/ml_models';
const ML_JOBS_BASE_PATH = '/ml_jobs';

export const createMlModel = async <TResponse = MLModelSchema>(
  payload: MLModelCreateSchema | Record<string, unknown>,
): Promise<TResponse> => {
  const { data } = await apiClient.post<TResponse>(`${ML_MODELS_BASE_PATH}/`, payload);
  return data;
};

export const listMlModels = async <TResponse = MLModelSchema[]>(): Promise<TResponse> => {
  const { data } = await apiClient.get<TResponse>(`${ML_MODELS_BASE_PATH}/`);
  return data;
};

export const getMlModelById = async <TResponse = MLModelSchema>(modelId: string | number): Promise<TResponse> => {
  const { data } = await apiClient.get<TResponse>(`${ML_MODELS_BASE_PATH}/${modelId}`);
  return data;
};

export const updateMlModel = async <TResponse = unknown>(
  modelId: string | number,
  payload: MLModelUpdateSchema,
): Promise<TResponse> => {
  const { data } = await apiClient.put<TResponse>(`${ML_MODELS_BASE_PATH}/${modelId}`, payload);
  return data;
};

export const deleteMlModel = async <TResponse = unknown>(modelId: string | number): Promise<TResponse> => {
  const { data } = await apiClient.delete<TResponse>(`${ML_MODELS_BASE_PATH}/${modelId}`);
  return data;
};

export const initializeModelTrainingJob = async <TResponse = unknown>(
  modelId: string | number,
): Promise<TResponse> => {
  const { data } = await apiClient.post<TResponse>(`${ML_JOBS_BASE_PATH}/${modelId}/jobs/initialize`);
  return data;
};
