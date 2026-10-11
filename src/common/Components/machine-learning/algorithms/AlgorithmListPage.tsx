import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { deleteMlAlgorithm, listMlAlgorithms } from '@/api/mlAlgorithmApi';
import type { MlAlgorithmSchema } from '@/api/mlSchemas';
import { toList } from '@/api/normalize';
import { ConfirmDeleteDialog } from '@/common/Components/machine-learning/ConfirmDeleteDialog';
import { DataTable, type Column } from '@/components/common/DataTable';
import { ListPanel } from '@/components/common/ListPanel';
import { LoadStatus } from '@/components/common/LoadStatus';
import { RowActions, rowLinkClassName } from '@/components/common/RowActions';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useDeleteDialog } from '@/hooks/useDeleteDialog';
import { useLoad } from '@/hooks/useLoad';
import { formatDate, listSummary } from '@/lib/format';

const loadAlgorithms = () =>
  listMlAlgorithms<unknown>().then((response) => toList<MlAlgorithmSchema>(response, ['algorithms']));

export function AlgorithmListPage() {
  const { data, error, isLoading, reload } = useLoad(loadAlgorithms, 'Could not load the algorithms.');
  const [search, setSearch] = useState('');
  const deletion = useDeleteDialog<MlAlgorithmSchema>((algorithm) => deleteMlAlgorithm(algorithm.id), reload);

  const algorithms = data ?? [];
  const shownAlgorithms = algorithms.filter((algorithm) =>
    `${algorithm.name} ${algorithm.queue_name} ${algorithm.description ?? ''}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  const columns: Column<MlAlgorithmSchema>[] = [
    {
      header: 'Name',
      cell: (algorithm) => (
        <Link to={`/machine-learning/algorithms/${algorithm.id}`} className={rowLinkClassName}>
          {algorithm.name}
        </Link>
      ),
    },
    {
      header: 'Training queue',
      cell: (algorithm) => <span className="font-mono text-[0.8125rem]">{algorithm.queue_name}</span>,
    },
    {
      header: 'Prediction queue',
      cell: (algorithm) => <span className="font-mono text-[0.8125rem]">{algorithm.prediction_queue_name || '—'}</span>,
    },
    { header: 'Created', cell: (algorithm) => formatDate(algorithm.created_at, '—'), className: 'whitespace-nowrap' },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (algorithm) => (
        <RowActions
          editTo={`/machine-learning/algorithms/${algorithm.id}/edit`}
          onDelete={() => deletion.ask(algorithm)}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Algorithms"
        description="An algorithm names the queues its workers listen on and the settings a model can have."
        actions={
          <Button asChild>
            <Link to="/machine-learning/algorithms/create">
              <Plus />
              New algorithm
            </Link>
          </Button>
        }
      />

      {!data ? (
        <LoadStatus isLoading={isLoading} error={error} onRetry={reload} />
      ) : (
        <ListPanel
          search={search}
          onSearchChange={setSearch}
          searchLabel="Search algorithms"
          summary={listSummary(shownAlgorithms.length, algorithms.length, 'algorithm')}
        >
          <DataTable
            caption="Algorithms"
            columns={columns}
            rows={shownAlgorithms}
            getRowKey={(algorithm) => algorithm.id}
            empty={
              algorithms.length === 0
                ? 'No algorithms yet. Add one with “New algorithm”.'
                : `No algorithm matches “${search.trim()}”.`
            }
          />
        </ListPanel>
      )}

      <ConfirmDeleteDialog
        open={deletion.item !== null}
        title={`Delete ${deletion.item?.name ?? 'algorithm'}?`}
        description="This permanently deletes the algorithm."
        confirmLabel="Delete algorithm"
        isSubmitting={deletion.isDeleting}
        errorMessage={deletion.error}
        onConfirm={() => void deletion.confirm()}
        onCancel={deletion.cancel}
      />
    </>
  );
}
