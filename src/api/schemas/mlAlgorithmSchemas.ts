export interface MlAlgorithmCreateSchema {
  name: string;
  queue_name: string;
  prediction_queue_name: string;
  config_schema: Record<string, unknown>;
  description?: string;
}

export interface MlAlgorithmUpdateSchema {
  name?: string;
  queue_name?: string;
  prediction_queue_name?: string;
  config_schema?: Record<string, unknown>;
  description?: string;
}

export interface MlAlgorithmSchema {
  id: string;
  name: string;
  queue_name: string;
  prediction_queue_name: string;
  config_schema: Record<string, unknown>;
  description?: string;
  created_at?: string;
}

export type ListMlAlgorithmsResponse = { algorithms: MlAlgorithmSchema[] } | MlAlgorithmSchema[];
