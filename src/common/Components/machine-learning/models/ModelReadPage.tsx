import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getApiKeyByModelId } from '@/api/apiKeyApi';
import { listAssignedDatasetsByModelId, listDatasets, normalizeModelAssignedDatasets } from '@/api/datasetApi';
import { listMlAlgorithms } from '@/api/mlAlgorithmApi';
import { getMlModelById } from '@/api/mlModelApi';
import type { ApiKeySchema, DatasetSchema, MlAlgorithmSchema } from '@/api/mlSchemas';
import { toList } from '@/api/normalize';
import { DetailList } from '@/components/common/DetailList';
import { JsonEditor } from '@/components/common/JsonEditor';
import { LoadStatus } from '@/components/common/LoadStatus';
import { Notice } from '@/components/common/Notice';
import { Panel } from '@/components/common/Panel';
import { rowLinkClassName } from '@/components/common/RowActions';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Tag } from '@/components/common/Tag';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useLoad } from '@/hooks/useLoad';
import { countLabel, formatDate, shorten } from '@/lib/format';
import { toJsonText } from '@/lib/json';

import { dataUsageLabel } from './modelOptions';
import { useTrainModel } from './useTrainModel';

// Names for the ids the model refers to. The page still works when this fails, it shows the ids then.
async function loadNames() {
  const [algorithms, datasets] = await Promise.all([listMlAlgorithms<unknown>(), listDatasets<unknown>()]);

  return {
    algorithms: toList<MlAlgorithmSchema>(algorithms, ['algorithms']),
    datasets: toList<DatasetSchema>(datasets, ['datasets']),
  };
}

export function ModelReadPage() {
  const { id = '' } = useParams<{ id: string }>();

  const loadModel = useCallback(() => getMlModelById(id), [id]);
  const loadAssignments = useCallback(
    () => listAssignedDatasetsByModelId<unknown>(id).then(normalizeModelAssignedDatasets),
    [id],
  );
  const loadApiKeys = useCallback(
    () => getApiKeyByModelId<unknown>(id).then((response) => toList<ApiKeySchema>(response, ['apiKeys'])),
    [id],
  );

  const model = useLoad(loadModel, 'Could not load the model.');
  const assignments = useLoad(loadAssignments, 'Could not load the datasets of this model.');
  const apiKeys = useLoad(loadApiKeys, 'Could not load the API keys of this model.');
  const names = useLoad(loadNames, '');
  const training = useTrainModel(model.reload);

  if (!model.data) {
    return (
      <>
        <PageHeader title="Model" back={{ to: '/machine-learning/models', label: 'Models' }} />
        <LoadStatus isLoading={model.isLoading} error={model.error} onRetry={model.reload} />
      </>
    );
  }

  const current = model.data;
  const algorithm = names.data?.algorithms.find((item) => item.id === current.ml_algorithm_id);
  const datasetLabel = (datasetId: string) =>
    names.data?.datasets.find((dataset) => dataset.id === datasetId)?.description?.trim() || `Dataset ${datasetId}`;
  const requestCount = (apiKeys.data ?? []).reduce((sum, apiKey) => sum + (apiKey.usage_count ?? 0), 0);

  return (
    <>
      <PageHeader
        title={current.name}
        meta={<StatusBadge status={current.model_status} />}
        description={current.description}
        back={{ to: '/machine-learning/models', label: 'Models' }}
        actions={
          <>
            <Button
              type="button"
              disabled={training.trainingModelId !== null}
              onClick={() => void training.train(current)}
            >
              {training.trainingModelId === current.id ? 'Starting…' : 'Train'}
            </Button>
            <Button asChild variant="outline">
              <Link to={`/machine-learning/models/${id}/edit`}>Edit</Link>
            </Button>
          </>
        }
      />

      {training.notice && (
        <Notice tone={training.notice.tone} className="mb-6">
          {training.notice.text}
        </Notice>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Panel title="Details">
            <DetailList
              items={[
                { label: 'Version', value: current.version, mono: true },
                {
                  label: 'Algorithm',
                  value: (
                    <Link to={`/machine-learning/algorithms/${current.ml_algorithm_id}`} className={rowLinkClassName}>
                      {algorithm?.name ?? `Algorithm ${current.ml_algorithm_id}`}
                    </Link>
                  ),
                },
                { label: 'Created', value: formatDate(current.created_at) },
                {
                  label: 'Trained file',
                  value: current.artifact_checksum
                    ? `Checksum ${shorten(current.artifact_checksum)}`
                    : 'None yet, the model has not been trained',
                  mono: Boolean(current.artifact_checksum),
                },
              ]}
            />
          </Panel>

          <Panel title="Settings" description="What the algorithm is run with when this model is trained.">
            <JsonEditor id="model-config" label="Settings of the model" value={toJsonText(current.ml_algorithm_config)} readOnly />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel
            title="Datasets"
            description="Training needs one dataset assigned for training."
            actions={
              <Button asChild size="sm" variant="outline">
                <Link to={`/machine-learning/models/${id}/datasets`}>Manage</Link>
              </Button>
            }
            bodyClassName="p-0"
          >
            {assignments.error && <Notice className="m-4">{assignments.error}</Notice>}
            {assignments.data?.length === 0 && (
              <p className="px-5 py-4 text-sm text-muted-foreground">No dataset is assigned yet.</p>
            )}
            <ul className="m-0 list-none divide-y p-0">
              {(assignments.data ?? []).map((assignment) => (
                <li
                  key={`${assignment.dataset_id}-${assignment.data_usage}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                >
                  <Link to={`/machine-learning/datasets/${assignment.dataset_id}`} className={rowLinkClassName}>
                    {datasetLabel(assignment.dataset_id)}
                  </Link>
                  <Tag>{dataUsageLabel(assignment.data_usage)}</Tag>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="API keys"
            description={
              apiKeys.data && apiKeys.data.length > 0
                ? `${countLabel(requestCount, 'request')} so far with ${countLabel(apiKeys.data.length, 'key')}.`
                : 'Other software calls this model with a key.'
            }
            actions={
              <Button asChild size="sm" variant="outline">
                <Link to={`/machine-learning/api-keys/create?modelId=${id}`}>New key</Link>
              </Button>
            }
            bodyClassName="p-0"
          >
            {apiKeys.error && <Notice className="m-4">{apiKeys.error}</Notice>}
            {apiKeys.data?.length === 0 && (
              <p className="px-5 py-4 text-sm text-muted-foreground">This model has no API key yet.</p>
            )}
            <ul className="m-0 list-none divide-y p-0">
              {(apiKeys.data ?? []).map((apiKey) => (
                <li key={apiKey.id} className="px-5 py-3 text-sm">
                  <Link to={`/machine-learning/api-keys/${apiKey.id}`} className={rowLinkClassName}>
                    {apiKey.name || `Key ${apiKey.id}`}
                  </Link>
                  <p className="mt-0.5 text-muted-foreground">
                    {countLabel(apiKey.usage_count ?? 0, 'request')}.{' '}
                    {apiKey.last_used_at ? `Last used ${formatDate(apiKey.last_used_at)}` : 'Never used'}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
