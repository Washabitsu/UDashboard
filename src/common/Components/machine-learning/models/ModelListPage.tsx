import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { listMlAlgorithms } from '@/api/mlAlgorithmApi';
import { deleteMlModel, listMlModels } from '@/api/mlModelApi';
import type { MLModelSchema, MlAlgorithmSchema } from '@/api/mlSchemas';
import { toList } from '@/api/normalize';
import { ConfirmDeleteDialog } from '@/common/Components/machine-learning/ConfirmDeleteDialog';
import { DataTable, type Column } from '@/components/common/DataTable';
import { ListPanel } from '@/components/common/ListPanel';
import { LoadStatus } from '@/components/common/LoadStatus';
import { Notice } from '@/components/common/Notice';
import { RowActions, rowLinkClassName } from '@/components/common/RowActions';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useDeleteDialog } from '@/hooks/useDeleteDialog';
import { useLoad } from '@/hooks/useLoad';
import { formatDate, listSummary } from '@/lib/format';

import { useTrainModel } from './useTrainModel';

// The models, and the algorithms to show a name instead of an id
async function loadModels() {
  const [models, algorithms] = await Promise.all([listMlModels<unknown>(), listMlAlgorithms<unknown>()]);

  return {
    models: toList<MLModelSchema>(models, ['models']),
    algorithms: toList<MlAlgorithmSchema>(algorithms, ['algorithms']),
  };
}

export function ModelListPage() {
  const { data, error, isLoading, reload } = useLoad(loadModels, 'Could not load the models.');
  const [search, setSearch] = useState('');
  const deletion = useDeleteDialog<MLModelSchema>((model) => deleteMlModel(model.id), reload);
  const training = useTrainModel(reload);

  const models = data?.models ?? [];
  const algorithmNames = new Map(data?.algorithms.map((algorithm) => [algorithm.id, algorithm.name]));
  const shownModels = models.filter((model) =>
    `${model.name} ${model.version} ${model.model_status}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const columns: Column<MLModelSchema>[] = [
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
        <RowActions editTo={`/machine-learning/models/${model.id}/edit`} onDelete={() => deletion.ask(model)}>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={training.trainingModelId !== null}
            onClick={() => void training.train(model)}
          >
            {training.trainingModelId === model.id ? 'Starting…' : 'Train'}
          </Button>
        </RowActions>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Models"
        description="A model is an algorithm with its settings, trained on one of your datasets."
        actions={
          <Button asChild>
            <Link to="/machine-learning/models/create">
              <Plus />
              New model
            </Link>
          </Button>
        }
      />

      {training.notice && (
        <Notice tone={training.notice.tone} className="mb-4">
          {training.notice.text}
        </Notice>
      )}

      {!data ? (
        <LoadStatus isLoading={isLoading} error={error} onRetry={reload} />
      ) : (
        <ListPanel
          search={search}
          onSearchChange={setSearch}
          searchLabel="Search models"
          summary={listSummary(shownModels.length, models.length, 'model')}
        >
          <DataTable
            caption="Models"
            columns={columns}
            rows={shownModels}
            getRowKey={(model) => model.id}
            empty={
              models.length === 0
                ? 'No models yet. Create one with “New model”.'
                : `No model matches “${search.trim()}”.`
            }
          />
        </ListPanel>
      )}

      <ConfirmDeleteDialog
        open={deletion.item !== null}
        title={`Delete ${deletion.item?.name ?? 'model'}?`}
        description="This permanently deletes the model."
        confirmLabel="Delete model"
        isSubmitting={deletion.isDeleting}
        errorMessage={deletion.error}
        onConfirm={() => void deletion.confirm()}
        onCancel={deletion.cancel}
      />
    </>
  );
}
