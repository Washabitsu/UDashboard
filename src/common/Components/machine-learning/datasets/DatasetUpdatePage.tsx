import { useCallback, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { getDatasetById, updateDataset } from '@/api/datasetApi';
import { getRequestErrorMessage } from '@/api/errorMessage';
import type { DatasetSchema } from '@/api/mlSchemas';
import { Field } from '@/components/common/Field';
import { FormActions } from '@/components/common/FormActions';
import { LoadStatus } from '@/components/common/LoadStatus';
import { Notice } from '@/components/common/Notice';
import { Panel } from '@/components/common/Panel';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLoad } from '@/hooks/useLoad';

import { ColumnNormalizationForm } from './DatasetNormalization';
import { buildNormalizationSchema, rulesFromNormalizationSchema } from './normalizationRules';

export function DatasetUpdatePage() {
  const { id = '' } = useParams<{ id: string }>();

  const load = useCallback(() => getDatasetById(id), [id]);
  const { data: dataset, error, isLoading, reload } = useLoad(load, 'Could not load the dataset.');

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Edit dataset"
        description="The file itself can’t be replaced. Upload a new dataset for other data."
        back={{ to: `/machine-learning/datasets/${id}`, label: 'Back to the dataset' }}
      />

      {!dataset ? (
        <LoadStatus isLoading={isLoading} error={error} onRetry={reload} />
      ) : (
        <DatasetEditForm dataset={dataset} />
      )}
    </div>
  );
}

// Shown once the dataset is loaded, so its fields can start with the saved values
function DatasetEditForm({ dataset }: { dataset: DatasetSchema }) {
  const navigate = useNavigate();
  const [description, setDescription] = useState(dataset.description ?? '');
  const [normalizationRules, setNormalizationRules] = useState(() =>
    rulesFromNormalizationSchema(dataset.normalization_schema),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await updateDataset(dataset.id, {
        description: description.trim(),
        normalization_schema: normalizationRules.length > 0 ? buildNormalizationSchema(normalizationRules) : undefined,
      });
      navigate(`/machine-learning/datasets/${dataset.id}`);
    } catch (error) {
      setErrorMessage(getRequestErrorMessage(error, 'Could not save the dataset.'));
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Panel>
        <Field label="Description" htmlFor="dataset-description" optional>
          <Input
            id="dataset-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
      </Panel>

      <Panel title="Columns" description="How each column is read before training.">
        {normalizationRules.length === 0 ? (
          <p className="text-sm text-muted-foreground">This dataset was uploaded without column rules.</p>
        ) : (
          <ColumnNormalizationForm rules={normalizationRules} onChange={setNormalizationRules} />
        )}
      </Panel>

      {errorMessage && <Notice>{errorMessage}</Notice>}

      <FormActions>
        <Button type="submit" disabled={isSubmitting}>
          Save changes
        </Button>
        <Button asChild variant="outline">
          <Link to={`/machine-learning/datasets/${dataset.id}`}>Cancel</Link>
        </Button>
      </FormActions>
    </form>
  );
}
