import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { listApiKeys } from '@/api/apiKeyApi';
import { listDatasets } from '@/api/datasetApi';
import { listDataTypes } from '@/api/dataTypeApi';
import { listMlAlgorithms } from '@/api/mlAlgorithmApi';
import { listMlModels } from '@/api/mlModelApi';
import type { ApiKeySchema, DataTypeSchema, DatasetSchema, MLModelSchema, MlAlgorithmSchema } from '@/api/mlSchemas';
import { toList } from '@/api/normalize';
import { DataTable, type Column } from '@/components/common/DataTable';
import { LoadStatus } from '@/components/common/LoadStatus';
import { Notice } from '@/components/common/Notice';
import { Panel } from '@/components/common/Panel';
import { rowLinkClassName } from '@/components/common/RowActions';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useLoad } from '@/hooks/useLoad';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

import { useTrainModel } from './machine-learning/models/useTrainModel';

// How many models and API keys the overview lists. The rest is on their own pages.
const LATEST_COUNT = 5;

async function loadOverview() {
  const [dataTypes, datasets, algorithms, models, apiKeys] = await Promise.all([
    listDataTypes<unknown>(),
    listDatasets<unknown>(),
    listMlAlgorithms<unknown>(),
    listMlModels<unknown>(),
    listApiKeys<unknown>(),
  ]);

  return {
    dataTypes: toList<DataTypeSchema>(dataTypes, ['data_types', 'dataTypes']),
    datasets: toList<DatasetSchema>(datasets, ['datasets']),
    algorithms: toList<MlAlgorithmSchema>(algorithms, ['algorithms']),
    models: toList<MLModelSchema>(models, ['models']),
    apiKeys: toList<ApiKeySchema>(apiKeys, ['apiKeys']),
  };
}

function newestFirst<T extends { created_at: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// The address the key was used from most recently
function lastAddress(apiKey: ApiKeySchema): string {
  return newestFirst(apiKey.ip_addresses ?? []).at(0)?.ip_address ?? '—';
}

function MachineLearningDashboard() {
  const { data, error, isLoading, reload } = useLoad(loadOverview, 'Could not load the overview.');
  const training = useTrainModel(reload);

  if (!data) {
    return (
      <>
        <PageHeader title="Overview" />
        <LoadStatus isLoading={isLoading} error={error} onRetry={reload} />
      </>
    );
  }

  // The order things have to exist in: a dataset needs a file type, a model needs an algorithm,
  // training needs a dataset, an API key needs a model.
  const steps = [
    {
      label: 'File types',
      count: data.dataTypes.length,
      link: '/machine-learning/data-types',
      text: 'Which kinds of file a dataset may be.',
      addLabel: 'Add a file type',
    },
    {
      label: 'Datasets',
      count: data.datasets.length,
      link: '/machine-learning/datasets',
      text: 'The files your models learn from.',
      addLabel: 'Upload a dataset',
    },
    {
      label: 'Algorithms',
      count: data.algorithms.length,
      link: '/machine-learning/algorithms',
      text: 'How a model is trained and by which worker.',
      addLabel: 'Add an algorithm',
    },
    {
      label: 'Models',
      count: data.models.length,
      link: '/machine-learning/models',
      text: 'An algorithm with settings, trained on a dataset.',
      addLabel: 'Create a model',
    },
    {
      label: 'API keys',
      count: data.apiKeys.length,
      link: '/machine-learning/api-keys',
      text: 'Let other software ask a model for predictions.',
      addLabel: 'Create an API key',
    },
  ];
  // The first step with nothing in it is what to do next. -1 when every step has something.
  const nextStepIndex = steps.findIndex((step) => step.count === 0);

  const algorithmNames = new Map(data.algorithms.map((algorithm) => [algorithm.id, algorithm.name]));

  const modelColumns: Column<MLModelSchema>[] = [
    {
      header: 'Name',
      cell: (model) => (
        <Link to={`/machine-learning/models/${model.id}`} className={rowLinkClassName}>
          {model.name}
        </Link>
      ),
    },
    { header: 'Version', cell: (model) => <span className="font-mono text-[0.8125rem]">{model.version}</span> },
    { header: 'Status', cell: (model) => <StatusBadge status={model.model_status} /> },
    { header: 'Algorithm', cell: (model) => algorithmNames.get(model.ml_algorithm_id) ?? '—' },
    { header: 'Created', cell: (model) => formatDate(model.created_at), className: 'whitespace-nowrap' },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (model) => (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={training.trainingModelId !== null}
          onClick={() => void training.train(model)}
        >
          {training.trainingModelId === model.id ? 'Starting…' : 'Train'}
        </Button>
      ),
    },
  ];

  const apiKeyColumns: Column<ApiKeySchema>[] = [
    {
      header: 'Name',
      cell: (apiKey) => (
        <Link to={`/machine-learning/api-keys/${apiKey.id}`} className={rowLinkClassName}>
          {apiKey.name || `Key ${apiKey.id}`}
        </Link>
      ),
    },
    { header: 'Requests', cell: (apiKey) => apiKey.usage_count ?? 0, className: 'tabular-nums' },
    { header: 'Last used', cell: (apiKey) => formatDate(apiKey.last_used_at), className: 'whitespace-nowrap' },
    {
      header: 'Last address',
      cell: (apiKey) => <span className="font-mono text-[0.8125rem]">{lastAddress(apiKey)}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Overview"
        description="From a file to a model that other software can call."
        actions={
          <Button asChild>
            <Link to="/machine-learning/models/create">
              <Plus />
              New model
            </Link>
          </Button>
        }
      />

      <div className="space-y-6">
        <section aria-label="Setup" className="rounded-lg border bg-card">
          <ol className="m-0 grid list-none p-0 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => {
              const isNext = index === nextStepIndex;

              return (
                <li
                  key={step.label}
                  className={cn(
                    'relative border-b p-5 last:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0',
                    // The amber line marks the one step that needs attention
                    isNext && 'shadow-[inset_0_3px_0_var(--signal)]',
                  )}
                >
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex size-5 items-center justify-center rounded-full border font-mono text-xs">
                      {index + 1}
                    </span>
                    <Link to={step.link} className="font-medium text-foreground after:absolute after:inset-0">
                      {step.label}
                    </Link>
                  </p>
                  <p className="mt-3 text-3xl font-semibold tabular-nums">{step.count}</p>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">{step.text}</p>
                  {isNext && (
                    <Link
                      to={`${step.link}/create`}
                      className="relative mt-3 inline-block text-sm font-medium text-primary underline underline-offset-4"
                    >
                      Next: {step.addLabel.toLowerCase()}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        {training.notice && <Notice tone={training.notice.tone}>{training.notice.text}</Notice>}

        <Panel
          title="Latest models"
          actions={
            <Button asChild size="sm" variant="outline">
              <Link to="/machine-learning/models">All models</Link>
            </Button>
          }
          bodyClassName="p-0"
        >
          <DataTable
            caption="Latest models"
            columns={modelColumns}
            rows={newestFirst(data.models).slice(0, LATEST_COUNT)}
            getRowKey={(model) => model.id}
            empty="No models yet."
          />
        </Panel>

        <Panel
          title="API key use"
          description="Which keys are called, and from where."
          actions={
            <Button asChild size="sm" variant="outline">
              <Link to="/machine-learning/api-keys">All API keys</Link>
            </Button>
          }
          bodyClassName="p-0"
        >
          <DataTable
            caption="API key use"
            columns={apiKeyColumns}
            rows={[...data.apiKeys].sort((a, b) => (b.usage_count ?? 0) - (a.usage_count ?? 0)).slice(0, LATEST_COUNT)}
            getRowKey={(apiKey) => apiKey.id}
            empty="No API keys yet."
          />
        </Panel>
      </div>
    </>
  );
}

export default MachineLearningDashboard;
