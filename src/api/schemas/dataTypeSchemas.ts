// A data type is a kind of file a dataset may be. Its name is the file extension, e.g. ".csv".
export interface DataTypeCreateSchema {
  name: string;
  description?: string;
}

// Only the description can be changed
export interface DataTypeUpdateSchema {
  description?: string;
}

export interface DataTypeSchema {
  id: string;
  name: string;
  description?: string;
}

export type ListDataTypesResponse = { data_types: DataTypeSchema[] } | DataTypeSchema[];
