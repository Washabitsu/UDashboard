import type { DataUsage, ModelStatus } from '@/api/mlSchemas';

// The values the API accepts, with the words shown for them
export const MODEL_STATUS_OPTIONS: { value: ModelStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'TRAINING', label: 'Training' },
  { value: 'READY', label: 'Ready' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export const DATA_USAGE_OPTIONS: { value: DataUsage; label: string }[] = [
  { value: 'TRAINING', label: 'Training' },
  { value: 'VALIDATION', label: 'Validation' },
  { value: 'TESTING', label: 'Testing' },
];

export function dataUsageLabel(value: string): string {
  return DATA_USAGE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}
