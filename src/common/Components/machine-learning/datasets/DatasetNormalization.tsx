import type { ColumnDtype, ColumnFeatureType, ColumnIntDtype } from '@/api/mlSchemas';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import {
  DTYPE_OPTIONS,
  FEATURE_TYPE_OPTIONS,
  TRANSFORMATION_OPTIONS,
  type ColumnRuleForm,
  type ReplacementPair,
  type TransformationOption,
} from './normalizationRules';

type ColumnNormalizationFormProps = {
  rules: ColumnRuleForm[];
  onChange: (rules: ColumnRuleForm[]) => void;
};

const labelClassName = 'mb-1 block text-xs text-muted-foreground';

// One block per column of the dataset: what the column is and how it is cleaned before training.
// The form does not keep its own state, every change goes to the page through onChange.
export function ColumnNormalizationForm({ rules, onChange }: ColumnNormalizationFormProps) {
  const updateRule = (index: number, updates: Partial<ColumnRuleForm>) => {
    onChange(rules.map((rule, ruleIndex) => (ruleIndex === index ? { ...rule, ...updates } : rule)));
  };

  const changeDtype = (index: number, nextDtype: ColumnDtype) => {
    const rule = rules[index];
    const updates: Partial<ColumnRuleForm> = { dtype: nextDtype };

    // Swap the fill value too, unless the user typed one of their own
    const isDefaultFillna = rule.fillna.trim() === '' || rule.fillna === 'unknown' || rule.fillna === '0';
    if (isDefaultFillna) {
      updates.fillna = nextDtype === 'numeric' ? '0' : 'unknown';
    }

    updateRule(index, updates);
  };

  const toggleTransformation = (index: number, option: TransformationOption) => {
    const current = rules[index].transformations;

    updateRule(index, {
      transformations: current.includes(option) ? current.filter((item) => item !== option) : [...current, option],
    });
  };

  const updateReplacement = (index: number, pairIndex: number, updates: Partial<ReplacementPair>) => {
    updateRule(index, {
      replacements: rules[index].replacements.map((pair, currentIndex) =>
        currentIndex === pairIndex ? { ...pair, ...updates } : pair,
      ),
    });
  };

  if (rules.length === 0) {
    return (
      <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
        The columns appear here once a CSV file is chosen.
      </p>
    );
  }

  return (
    <ul className="m-0 list-none divide-y rounded-md border p-0">
      {rules.map((rule, index) => {
        const isNumeric = rule.dtype === 'numeric';
        const fieldId = (field: string) => `column-${index}-${field}`;

        return (
          <li key={`${rule.name}-${index}`} className={cn('p-4', rule.drop && 'bg-muted/50')}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className={cn('font-mono text-sm font-medium break-all', rule.drop && 'text-muted-foreground line-through')}>
                {rule.name}
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-(--forest)"
                  checked={rule.drop}
                  onChange={(event) => updateRule(index, { drop: event.target.checked })}
                />
                Leave this column out
              </label>
            </div>

            {/* A column that is left out needs no further settings */}
            {!rule.drop && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label htmlFor={fieldId('dtype')} className={labelClassName}>
                    Type
                  </label>
                  <Select
                    id={fieldId('dtype')}
                    value={rule.dtype}
                    onChange={(event) => changeDtype(index, event.target.value as ColumnDtype)}
                  >
                    {DTYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label htmlFor={fieldId('feature')} className={labelClassName}>
                    Used as
                  </label>
                  <Select
                    id={fieldId('feature')}
                    value={rule.feature_type}
                    onChange={(event) => updateRule(index, { feature_type: event.target.value as ColumnFeatureType })}
                  >
                    {FEATURE_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label htmlFor={fieldId('fillna')} className={labelClassName}>
                    Empty cells become
                  </label>
                  <Input
                    id={fieldId('fillna')}
                    value={rule.fillna}
                    placeholder={isNumeric ? '0' : 'unknown'}
                    onChange={(event) => updateRule(index, { fillna: event.target.value })}
                  />
                </div>

                {isNumeric ? (
                  <div>
                    <label htmlFor={fieldId('int')} className={labelClassName}>
                      Integer size
                    </label>
                    <Select
                      id={fieldId('int')}
                      value={rule.int_dtype}
                      onChange={(event) => updateRule(index, { int_dtype: event.target.value as ColumnIntDtype })}
                    >
                      <option value="int64">int64</option>
                      <option value="int32">int32</option>
                    </Select>
                  </div>
                ) : (
                  <fieldset className="m-0 min-w-0 border-0 p-0">
                    <legend className={labelClassName}>Clean up</legend>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
                      {TRANSFORMATION_OPTIONS.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 text-sm whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="size-4 accent-(--forest)"
                            checked={rule.transformations.includes(option.value)}
                            onChange={() => toggleTransformation(index, option.value)}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
              </div>
            )}

            {!rule.drop && !isNumeric && (
              <div className="mt-3 space-y-2">
                {rule.replacements.map((pair, pairIndex) => (
                  <div key={pairIndex} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Replace</span>
                    <Input
                      aria-label={`Value to replace in ${rule.name}`}
                      className="w-40"
                      value={pair.from}
                      placeholder="old value"
                      onChange={(event) => updateReplacement(index, pairIndex, { from: event.target.value })}
                    />
                    <span className="text-muted-foreground">with</span>
                    <Input
                      aria-label={`New value in ${rule.name}`}
                      className="w-40"
                      value={pair.to}
                      placeholder="new value"
                      onChange={(event) => updateReplacement(index, pairIndex, { to: event.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateRule(index, {
                          replacements: rule.replacements.filter((_, currentIndex) => currentIndex !== pairIndex),
                        })
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto px-0"
                  onClick={() => updateRule(index, { replacements: [...rule.replacements, { from: '', to: '' }] })}
                >
                  Replace a value
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
