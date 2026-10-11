import type {
  ColumnDtype,
  ColumnFeatureType,
  ColumnIntDtype,
  ColumnNormalizationRule,
  ColumnTransformation,
  NormalizationSchema,
  ReplaceTransformation,
} from '@/api/mlSchemas';

// How one column of a dataset is prepared before training. The API stores this as "normalization_schema".
// This file turns that schema into the fields of the form and back.

export type TransformationOption = 'strip' | 'lower';

export type ReplacementPair = {
  from: string;
  to: string;
};

// One column as the form holds it: every field is there, also the ones the API only wants for some types
export type ColumnRuleForm = {
  name: string;
  drop: boolean;
  dtype: ColumnDtype;
  feature_type: ColumnFeatureType;
  fillna: string;
  int_dtype: ColumnIntDtype;
  transformations: TransformationOption[];
  replacements: ReplacementPair[];
};

// The values the API accepts, with the words shown for them
export const DTYPE_OPTIONS: { value: ColumnDtype; label: string }[] = [
  { value: 'str', label: 'Text' },
  { value: 'numeric', label: 'Number' },
];

export const FEATURE_TYPE_OPTIONS: { value: ColumnFeatureType; label: string }[] = [
  { value: 'categorical_feature', label: 'Category' },
  { value: 'text_feature', label: 'Free text' },
  { value: 'numerical_feature', label: 'Number' },
];

export const TRANSFORMATION_OPTIONS: { value: TransformationOption; label: string }[] = [
  { value: 'strip', label: 'Trim spaces' },
  { value: 'lower', label: 'Lower case' },
];

export function optionLabel<T extends string>(options: { value: T; label: string }[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function createDefaultRule(columnName: string): ColumnRuleForm {
  return {
    name: columnName,
    drop: false,
    dtype: 'str',
    feature_type: 'categorical_feature',
    fillna: 'unknown',
    int_dtype: 'int64',
    transformations: [],
    replacements: [],
  };
}

function isReplaceTransformation(value: ColumnTransformation): value is ReplaceTransformation {
  return typeof value === 'object' && value !== null && 'replace' in value;
}

// Schema from the API -> fields of the form
export function rulesFromNormalizationSchema(schema: NormalizationSchema | undefined): ColumnRuleForm[] {
  if (!schema || !Array.isArray(schema.rules)) {
    return [];
  }

  return schema.rules.map((rule) => {
    const allTransformations = Array.isArray(rule.transformations) ? rule.transformations : [];

    return {
      name: rule.name,
      drop: Boolean(rule.drop),
      dtype: rule.dtype === 'numeric' ? 'numeric' : 'str',
      feature_type: FEATURE_TYPE_OPTIONS.some((option) => option.value === rule.feature_type)
        ? rule.feature_type
        : 'categorical_feature',
      fillna: rule.fillna === undefined || rule.fillna === null ? '' : String(rule.fillna),
      int_dtype: rule.int_dtype === 'int32' ? 'int32' : 'int64',
      transformations: allTransformations.filter(
        (item): item is TransformationOption => item === 'strip' || item === 'lower',
      ),
      // { replace: { old: 'new' } } becomes one row of the form per pair
      replacements: allTransformations
        .filter(isReplaceTransformation)
        .flatMap((item) => Object.entries(item.replace).map(([from, to]) => ({ from, to: String(to) }))),
    };
  });
}

// Fields of the form -> schema for the API
export function buildNormalizationSchema(rules: ColumnRuleForm[]): NormalizationSchema {
  const normalizedRules: ColumnNormalizationRule[] = rules.map((rule) => {
    const trimmedFillna = rule.fillna.trim();

    // A number column has an integer size and no text clean-up
    if (rule.dtype === 'numeric') {
      let fillna: string | number = trimmedFillna === '' ? 0 : trimmedFillna;
      if (typeof fillna === 'string' && !Number.isNaN(Number(fillna))) {
        fillna = Number(fillna);
      }

      return {
        name: rule.name,
        fillna,
        dtype: rule.dtype,
        drop: rule.drop,
        feature_type: rule.feature_type,
        int_dtype: rule.int_dtype,
      };
    }

    const transformations: ColumnTransformation[] = [...rule.transformations];
    rule.replacements
      .filter((pair) => pair.from !== '')
      .forEach((pair) => {
        transformations.push({ replace: { [pair.from]: pair.to } });
      });

    return {
      name: rule.name,
      fillna: trimmedFillna === '' ? 'unknown' : rule.fillna,
      dtype: rule.dtype,
      drop: rule.drop,
      feature_type: rule.feature_type,
      transformations,
    };
  });

  return { rules: normalizedRules };
}

// Reads the column names from the first line of a CSV file.
// A name may be in double quotes, and may then contain a comma or a doubled quote ("").
// Names are kept exactly as written, spaces included: the API finds a column by its exact name.
export async function parseCsvHeader(file: File): Promise<string[]> {
  // The first 64 KB are enough for a header line, the whole file is not read into memory
  const text = await file.slice(0, 64 * 1024).text();
  const firstLine = text.split(/\r?\n/).find((line) => line.trim().length > 0);
  if (!firstLine) {
    return [];
  }

  const headers: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < firstLine.length; index += 1) {
    const character = firstLine[index];

    if (character === '"') {
      if (insideQuotes && firstLine[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === ',' && !insideQuotes) {
      headers.push(current);
      current = '';
      continue;
    }

    current += character;
  }

  headers.push(current);

  return headers.filter((header) => header.trim().length > 0);
}
