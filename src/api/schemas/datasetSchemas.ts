export interface ReplaceTransformation {
  replace: Record<string, string>;
}

export type ColumnTransformation = 'strip' | 'lower' | ReplaceTransformation;

export type ColumnDtype = 'str' | 'numeric';

export type ColumnFeatureType = 'categorical_feature' | 'text_feature' | 'numerical_feature';

export type ColumnIntDtype = 'int64' | 'int32';

export interface ColumnNormalizationRule {
  name: string;
  fillna: string | number;
  dtype: ColumnDtype;
  drop: boolean;
  feature_type: ColumnFeatureType;
  transformations?: ColumnTransformation[];
  int_dtype?: ColumnIntDtype;
}

export interface NormalizationSchema {
  rules: ColumnNormalizationRule[];
}

export interface DatasetUpdateSchema {
  description?: string;
  normalization_schema?: NormalizationSchema;
}

export interface DatasetSchema {
  id: string;
  data_checksum: string;
  created_at: string;
  description?: string;
  data_type_id: string;
  normalization_schema?: NormalizationSchema;
}
