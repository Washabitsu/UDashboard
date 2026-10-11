import axios from 'axios';

import { apiClient } from './apiClient';
import type {
  DatasetSchema,
  DatasetUpdateSchema,
  ListModelAssignedDatasetsResponse,
  ModelAssignedDatasetSchema,
  ModelDatasetAssignmentCreateSchema,
  ModelDatasetAssignmentSchema,
  ModelDatasetUnassignmentSchema,
  NormalizationSchema,
} from './mlSchemas';

const DATASETS_BASE_PATH = '/datasets';
const DATA_ASSIGNMENT_BASE_PATH = '/datasets_assignment';

type CreateDatasetParams = {
  file: Blob;
  dataTypeId?: string | number;
  data_type_id?: string | number;
  description?: string;
  normalization_schema?: NormalizationSchema;
};

export const createDataset = async <TResponse = DatasetSchema>({
  file,
  dataTypeId,
  data_type_id,
  description,
  normalization_schema,
}: CreateDatasetParams): Promise<TResponse> => {
  const resolvedDataTypeId = data_type_id ?? dataTypeId;
  if (resolvedDataTypeId === undefined || resolvedDataTypeId === null || resolvedDataTypeId === '') {
    throw new Error('data_type_id is required');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('data_type_id', String(resolvedDataTypeId));

  if (description) {
    formData.append('description', description);
  }

  if (normalization_schema) {
    formData.append('normalization_schema', JSON.stringify(normalization_schema));
  }

  const { data } = await apiClient.post<TResponse>(`${DATASETS_BASE_PATH}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    // A large file takes longer than the 15 seconds every other request gets
    timeout: 0,
  });

  return data;
};

export const listDatasets = async <TResponse = DatasetSchema[]>(): Promise<TResponse> => {
  const { data } = await apiClient.get<TResponse>(`${DATASETS_BASE_PATH}/`);
  return data;
};

export const getDatasetById = async <TResponse = DatasetSchema>(
  datasetId: string | number,
): Promise<TResponse> => {
  const { data } = await apiClient.get<TResponse>(`${DATASETS_BASE_PATH}/${datasetId}`);
  return data;
};

export const downloadDatasetFile = async (datasetId: string): Promise<Blob> => {
  try {
    const { data } = await apiClient.get<Blob>(`${DATASETS_BASE_PATH}/files/${datasetId}`, {
      responseType: 'blob',
      timeout: 0,
    });
    return data;
  } catch (error) {
    // The answer was asked for as a file, so an error from the API ({ "detail": ... }) arrives as a file too.
    // Turn it back into an object, so the message can be shown like any other.
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      error.response.data = await error.response.data
        .text()
        .then((text) => JSON.parse(text))
        .catch(() => null);
    }
    throw error;
  }
};

export const updateDataset = async <TResponse = unknown>(
  datasetId: string | number,
  payload: DatasetUpdateSchema,
): Promise<TResponse> => {
  const { data } = await apiClient.put<TResponse>(`${DATASETS_BASE_PATH}/${datasetId}`, payload);
  return data;
};

export const deleteDataset = async <TResponse = unknown>(
  datasetId: string | number,
): Promise<TResponse> => {
  const { data } = await apiClient.delete<TResponse>(`${DATASETS_BASE_PATH}/${datasetId}`);
  return data;
};

export const assignDatasetToModel = async <TResponse = ModelDatasetAssignmentSchema>(
  modelId: string | number,
  payload: ModelDatasetAssignmentCreateSchema,
): Promise<TResponse> => {
  const { data } = await apiClient.post<TResponse>(`${DATA_ASSIGNMENT_BASE_PATH}/${modelId}/assign`, payload);
  return data;
};

export const unassignDatasetFromModel = async <TResponse = { message: string }>(
  modelId: string | number,
  payload: ModelDatasetUnassignmentSchema,
): Promise<TResponse> => {
  const { data } = await apiClient.post<TResponse>(`${DATA_ASSIGNMENT_BASE_PATH}/${modelId}/unassign`, payload);
  return data;
};

export const listAssignedDatasetsByModelId = async <TResponse = ListModelAssignedDatasetsResponse>(
  modelId: string | number,
): Promise<TResponse> => {
  const { data } = await apiClient.get<TResponse>(`${DATA_ASSIGNMENT_BASE_PATH}/${modelId}/`);
  return data;
};

export function normalizeModelAssignedDatasets(response: unknown): ModelAssignedDatasetSchema[] {
  if (Array.isArray(response)) {
    return response as ModelAssignedDatasetSchema[];
  }

  if (!response || typeof response !== 'object') {
    return [];
  }

  const record = response as Record<string, unknown>;
  if (Array.isArray(record.datasets)) {
    return record.datasets as ModelAssignedDatasetSchema[];
  }

  if (Array.isArray(record.assignments)) {
    return record.assignments as ModelAssignedDatasetSchema[];
  }

  return [];
}
