import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { deleteDataType, listDataTypes } from '@/api/dataTypeApi';
import type { DataTypeSchema } from '@/api/mlSchemas';
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
import { listSummary } from '@/lib/format';

const loadDataTypes = () =>
  listDataTypes<unknown>().then((response) => toList<DataTypeSchema>(response, ['data_types', 'dataTypes']));

// "File types" on screen, "data types" in the API and in the address
export function DataTypeListPage() {
  const { data, error, isLoading, reload } = useLoad(loadDataTypes, 'Could not load the file types.');
  const [search, setSearch] = useState('');
  const deletion = useDeleteDialog<DataTypeSchema>((dataType) => deleteDataType(dataType.id), reload);

  const dataTypes = data ?? [];
  const shownDataTypes = dataTypes.filter((dataType) =>
    `${dataType.name} ${dataType.description ?? ''}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const columns: Column<DataTypeSchema>[] = [
    {
      header: 'Extension',
      cell: (dataType) => (
        <Link to={`/machine-learning/data-types/${dataType.id}`} className={`${rowLinkClassName} font-mono`}>
          {dataType.name}
        </Link>
      ),
    },
    { header: 'Description', cell: (dataType) => dataType.description || '—' },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (dataType) => (
        <RowActions
          editTo={`/machine-learning/data-types/${dataType.id}/edit`}
          onDelete={() => deletion.ask(dataType)}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="File types"
        description="The kinds of file a dataset may be. A dataset is uploaded as one of these."
        actions={
          <Button asChild>
            <Link to="/machine-learning/data-types/create">
              <Plus />
              New file type
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
          searchLabel="Search file types"
          summary={listSummary(shownDataTypes.length, dataTypes.length, 'file type')}
        >
          <DataTable
            caption="File types"
            columns={columns}
            rows={shownDataTypes}
            getRowKey={(dataType) => dataType.id}
            empty={
              dataTypes.length === 0
                ? 'No file types yet. Add .csv with “New file type”.'
                : `No file type matches “${search.trim()}”.`
            }
          />
        </ListPanel>
      )}

      <ConfirmDeleteDialog
        open={deletion.item !== null}
        title={`Delete ${deletion.item?.name ?? 'file type'}?`}
        description="This permanently deletes the file type."
        confirmLabel="Delete file type"
        isSubmitting={deletion.isDeleting}
        errorMessage={deletion.error}
        onConfirm={() => void deletion.confirm()}
        onCancel={deletion.cancel}
      />
    </>
  );
}
