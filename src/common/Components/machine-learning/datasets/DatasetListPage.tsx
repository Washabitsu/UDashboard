import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { deleteDataset, listDatasets } from '@/api/datasetApi';
import { listDataTypes } from '@/api/dataTypeApi';
import type { DataTypeSchema, DatasetSchema } from '@/api/mlSchemas';
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
import { formatDate, listSummary, shorten } from '@/lib/format';

// The datasets, and the file types to show ".csv" instead of an id
async function loadDatasets() {
  const [datasets, dataTypes] = await Promise.all([listDatasets<unknown>(), listDataTypes<unknown>()]);

  return {
    datasets: toList<DatasetSchema>(datasets, ['datasets']),
    dataTypes: toList<DataTypeSchema>(dataTypes, ['data_types', 'dataTypes']),
  };
}

export function DatasetListPage() {
  const { data, error, isLoading, reload } = useLoad(loadDatasets, 'Could not load the datasets.');
  const [search, setSearch] = useState('');
  const deletion = useDeleteDialog<DatasetSchema>((dataset) => deleteDataset(dataset.id), reload);

  const datasets = data?.datasets ?? [];
  const dataTypeNames = new Map(data?.dataTypes.map((dataType) => [dataType.id, dataType.name]));
  const shownDatasets = datasets.filter((dataset) =>
    `${dataset.description ?? ''} ${dataset.data_checksum}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const columns: Column<DatasetSchema>[] = [
    {
      header: 'Description',
      cell: (dataset) => (
        <Link to={`/machine-learning/datasets/${dataset.id}`} className={rowLinkClassName}>
          {dataset.description?.trim() || `Dataset ${dataset.id}`}
        </Link>
      ),
    },
    {
      header: 'File type',
      cell: (dataset) => (
        <span className="font-mono text-[0.8125rem]">{dataTypeNames.get(dataset.data_type_id) ?? '—'}</span>
      ),
    },
    {
      header: 'Checksum',
      cell: (dataset) => (
        <span className="font-mono text-[0.8125rem]" title={dataset.data_checksum}>
          {shorten(dataset.data_checksum)}
        </span>
      ),
    },
    { header: 'Uploaded', cell: (dataset) => formatDate(dataset.created_at), className: 'whitespace-nowrap' },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (dataset) => (
        <RowActions editTo={`/machine-learning/datasets/${dataset.id}/edit`} onDelete={() => deletion.ask(dataset)} />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Datasets"
        description="The files your models learn from, each with rules for how its columns are read."
        actions={
          <Button asChild>
            <Link to="/machine-learning/datasets/create">
              <Plus />
              Upload dataset
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
          searchLabel="Search datasets"
          summary={listSummary(shownDatasets.length, datasets.length, 'dataset')}
        >
          <DataTable
            caption="Datasets"
            columns={columns}
            rows={shownDatasets}
            getRowKey={(dataset) => dataset.id}
            empty={
              datasets.length === 0
                ? 'No datasets yet. Upload a CSV file with “Upload dataset”.'
                : `No dataset matches “${search.trim()}”.`
            }
          />
        </ListPanel>
      )}

      <ConfirmDeleteDialog
        open={deletion.item !== null}
        title="Delete this dataset?"
        description="The dataset and its file are permanently deleted."
        confirmLabel="Delete dataset"
        isSubmitting={deletion.isDeleting}
        errorMessage={deletion.error}
        onConfirm={() => void deletion.confirm()}
        onCancel={deletion.cancel}
      />
    </>
  );
}
