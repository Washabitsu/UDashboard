import { useCallback, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  assignDatasetToModel,
  listAssignedDatasetsByModelId,
  listDatasets,
  normalizeModelAssignedDatasets,
  unassignDatasetFromModel,
} from '@/api/datasetApi';
import { getRequestErrorMessage } from '@/api/errorMessage';
import { getMlModelById } from '@/api/mlModelApi';
import type { DataUsage, DatasetSchema, ModelAssignedDatasetSchema } from '@/api/mlSchemas';
import { toList } from '@/api/normalize';
import { DataTable, type Column } from '@/components/common/DataTable';
import { Field } from '@/components/common/Field';
import { LoadStatus } from '@/components/common/LoadStatus';
import { Notice } from '@/components/common/Notice';
import { Panel } from '@/components/common/Panel';
import { rowLinkClassName } from '@/components/common/RowActions';
import { Tag } from '@/components/common/Tag';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { useLoad } from '@/hooks/useLoad';

import { DATA_USAGE_OPTIONS, dataUsageLabel } from './modelOptions';

type PageNotice = {
  tone: 'success' | 'error';
  text: string;
};

function datasetLabel(dataset: DatasetSchema | undefined, datasetId: string): string {
  return dataset?.description?.trim() || `Dataset ${datasetId}`;
}

// Which datasets a model uses, and for what. Training reads the dataset assigned for "Training".
export function ModelDatasetAssignmentPage() {
  const { id = '' } = useParams<{ id: string }>();

  const load = useCallback(async () => {
    const [model, assignments, datasets] = await Promise.all([
      getMlModelById(id),
      listAssignedDatasetsByModelId<unknown>(id),
      listDatasets<unknown>(),
    ]);

    return {
      model,
      assignments: normalizeModelAssignedDatasets(assignments),
      datasets: toList<DatasetSchema>(datasets, ['datasets']),
    };
  }, [id]);
  const { data, error, isLoading, reload } = useLoad(load, 'Could not load the datasets of this model.');

  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [dataUsage, setDataUsage] = useState<DataUsage>('TRAINING');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<PageNotice | null>(null);

  const datasets = data?.datasets ?? [];
  // Nothing picked yet means the first dataset of the list
  const datasetId = selectedDatasetId || datasets.at(0)?.id || '';

  // Runs "assign" or "remove", shows what the API answered and loads the list again
  const change = async (request: () => Promise<{ message?: string }>, doneMessage: string, failedMessage: string) => {
    setNotice(null);
    setIsSubmitting(true);

    try {
      const response = await request();
      setNotice({ tone: 'success', text: response.message || doneMessage });
      reload();
    } catch (requestError) {
      setNotice({ tone: 'error', text: getRequestErrorMessage(requestError, failedMessage) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = (event: FormEvent) => {
    event.preventDefault();

    if (!datasetId) {
      setNotice({ tone: 'error', text: 'Pick a dataset first.' });
      return;
    }

    void change(
      () => assignDatasetToModel(id, { dataset_id: datasetId, data_usage: dataUsage }),
      'Dataset assigned.',
      'Could not assign the dataset.',
    );
  };

  const handleRemove = (assignment: ModelAssignedDatasetSchema) => {
    void change(
      () => unassignDatasetFromModel(id, { dataset_id: assignment.dataset_id, data_usage: assignment.data_usage }),
      'Dataset removed from the model.',
      'Could not remove the dataset.',
    );
  };

  const columns: Column<ModelAssignedDatasetSchema>[] = [
    {
      header: 'Dataset',
      cell: (assignment) => (
        <Link to={`/machine-learning/datasets/${assignment.dataset_id}`} className={rowLinkClassName}>
          {datasetLabel(
            datasets.find((dataset) => dataset.id === assignment.dataset_id),
            assignment.dataset_id,
          )}
        </Link>
      ),
    },
    { header: 'Used for', cell: (assignment) => <Tag>{dataUsageLabel(assignment.data_usage)}</Tag> },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (assignment) => (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10"
          disabled={isSubmitting}
          onClick={() => handleRemove(assignment)}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={data ? `Datasets of ${data.model.name}` : 'Datasets of the model'}
        description="A model is trained on the dataset assigned for training."
        back={{ to: `/machine-learning/models/${id}`, label: 'Back to the model' }}
      />

      {!data ? (
        <LoadStatus isLoading={isLoading} error={error} onRetry={reload} />
      ) : (
        <div className="space-y-6">
          {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}

          <Panel title="Assigned" bodyClassName="p-0">
            <DataTable
              caption="Datasets assigned to this model"
              columns={columns}
              rows={data.assignments}
              getRowKey={(assignment) => `${assignment.dataset_id}-${assignment.data_usage}`}
              empty="No dataset is assigned yet. Assign one below."
            />
          </Panel>

          <Panel title="Assign a dataset">
            {datasets.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                There is no dataset yet.{' '}
                <Link to="/machine-learning/datasets/create" className="font-medium text-primary underline">
                  Upload a dataset
                </Link>{' '}
                first.
              </p>
            ) : (
              <form onSubmit={handleAssign} className="grid items-end gap-4 sm:grid-cols-[1fr_12rem_auto]">
                <Field label="Dataset" htmlFor="assignment-dataset">
                  <Select
                    id="assignment-dataset"
                    value={datasetId}
                    onChange={(event) => setSelectedDatasetId(event.target.value)}
                  >
                    {datasets.map((dataset) => (
                      <option key={dataset.id} value={dataset.id}>
                        {datasetLabel(dataset, dataset.id)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Used for" htmlFor="assignment-usage">
                  <Select
                    id="assignment-usage"
                    value={dataUsage}
                    onChange={(event) => setDataUsage(event.target.value as DataUsage)}
                  >
                    {DATA_USAGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Button type="submit" disabled={isSubmitting}>
                  Assign
                </Button>
              </form>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
