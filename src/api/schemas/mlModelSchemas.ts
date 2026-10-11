// The same values as ModelStatus in OrchestrML. The training worker sets TRAINING, then READY or FAILED.
export type ModelStatus = 'DRAFT' | 'TRAINING' | 'READY' | 'FAILED' | 'ARCHIVED';

// What a dataset is used for by a model (DataUsage in OrchestrML)
export type DataUsage = 'TRAINING' | 'VALIDATION' | 'TESTING';

export interface MLModelCreateSchema {
  name: string;
  version: string;
  description?: string;
  ml_algorithm_id: string | number;
  ml_algorithm_config: Record<string, unknown>;
  model_status?: ModelStatus;
}

export interface MLModelUpdateSchema {
  name?: string;
  version?: string;
  description?: string;
  ml_algorithm_id?: string | number;
  ml_algorithm_config?: Record<string, unknown>;
  model_status?: ModelStatus;
}

export interface MLModelSchema {
  id: string;
  name: string;
  version: string;
  description?: string;
  ml_algorithm_id: string;
  ml_algorithm_config: Record<string, unknown>;
  model_status: ModelStatus;
  artifact_path?: string;
  artifact_checksum?: string;
  created_at: string;
}

export interface ModelDatasetAssignmentCreateSchema {
  dataset_id: string | number;
  data_usage: string;
}

export interface ModelDatasetUnassignmentSchema {
  dataset_id: string | number;
  data_usage: string;
}

export interface ModelDatasetAssignmentSchema {
  model_id: string;
  dataset_id: string;
  data_usage: string;
  message: string;
}

export interface ModelAssignedDatasetSchema {
  dataset_id: string;
  data_usage: string;
}

export type ListModelAssignedDatasetsResponse =
  | { datasets: ModelAssignedDatasetSchema[] }
  | { assignments: ModelAssignedDatasetSchema[] }
  | ModelAssignedDatasetSchema[];
