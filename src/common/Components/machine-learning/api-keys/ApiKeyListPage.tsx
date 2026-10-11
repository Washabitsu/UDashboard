import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { deleteApiKey, listApiKeys } from '@/api/apiKeyApi';
import type { ApiKeySchema } from '@/api/mlSchemas';
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

const loadApiKeys = () => listApiKeys<unknown>().then((response) => toList<ApiKeySchema>(response, ['apiKeys']));

export function ApiKeyListPage() {
  const { data, error, isLoading, reload } = useLoad(loadApiKeys, 'Could not load the API keys.');
  const [search, setSearch] = useState('');
  const deletion = useDeleteDialog<ApiKeySchema>((apiKey) => deleteApiKey(apiKey.id), reload);

  const apiKeys = data ?? [];
  const shownApiKeys = apiKeys.filter((apiKey) => apiKey.name.toLowerCase().includes(search.trim().toLowerCase()));

  const columns: Column<ApiKeySchema>[] = [
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
    { header: 'Created', cell: (apiKey) => formatDate(apiKey.created_at), className: 'whitespace-nowrap' },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (apiKey) => <RowActions onDelete={() => deletion.ask(apiKey)} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="API keys"
        description="A key lets other software ask one of your models for predictions, without a login."
        actions={
          <Button asChild>
            <Link to="/machine-learning/api-keys/create">
              <Plus />
              New API key
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
          searchLabel="Search API keys"
          summary={listSummary(shownApiKeys.length, apiKeys.length, 'API key')}
        >
          <DataTable
            caption="API keys"
            columns={columns}
            rows={shownApiKeys}
            getRowKey={(apiKey) => apiKey.id}
            empty={
              apiKeys.length === 0
                ? 'No API keys yet. Create one with “New API key”.'
                : `No API key matches “${search.trim()}”.`
            }
          />
        </ListPanel>
      )}

      <ConfirmDeleteDialog
        open={deletion.item !== null}
        title={`Delete ${deletion.item?.name || 'API key'}?`}
        description="Software that uses this key is refused from now on. This can’t be undone."
        confirmLabel="Delete API key"
        isSubmitting={deletion.isDeleting}
        errorMessage={deletion.error}
        onConfirm={() => void deletion.confirm()}
        onCancel={deletion.cancel}
      />
    </>
  );
}
