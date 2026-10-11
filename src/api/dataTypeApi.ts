import { apiClient } from './apiClient';
import type {
  DataTypeCreateSchema,
  DataTypeSchema,
  DataTypeUpdateSchema,
  ListDataTypesResponse,
} from './mlSchemas';

const DATA_TYPES_BASE_PATH = '/data_types';

export const createDataType = async <TResponse = DataTypeSchema>(
  payload: DataTypeCreateSchema | Record<string, unknown>,
): Promise<TResponse> => {
  const { data } = await apiClient.post<TResponse>(`${DATA_TYPES_BASE_PATH}/`, payload);
  return data;
};

export const listDataTypes = async <TResponse = ListDataTypesResponse>(): Promise<TResponse> => {
  const { data } = await apiClient.get<TResponse>(`${DATA_TYPES_BASE_PATH}/`);
  return data;
};

export const getDataTypeById = async <TResponse = DataTypeSchema>(
  dataTypeId: string | number,
): Promise<TResponse> => {
  const { data } = await apiClient.get<TResponse>(`${DATA_TYPES_BASE_PATH}/${dataTypeId}`);
  return data;
};

export const updateDataType = async <TResponse = unknown>(
  dataTypeId: string | number,
  payload: DataTypeUpdateSchema | Record<string, unknown>,
): Promise<TResponse> => {
  const { data } = await apiClient.put<TResponse>(`${DATA_TYPES_BASE_PATH}/${dataTypeId}`, payload);
  return data;
};

export const deleteDataType = async <TResponse = unknown>(
  dataTypeId: string | number,
): Promise<TResponse> => {
  const { data } = await apiClient.delete<TResponse>(`${DATA_TYPES_BASE_PATH}/${dataTypeId}`);
  return data;
};
