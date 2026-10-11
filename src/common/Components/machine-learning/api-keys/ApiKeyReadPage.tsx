import { useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { getApiKeyById } from '@/api/apiKeyApi';
import type { ApiKeyIpAddressSchema } from '@/api/mlSchemas';
import { DataTable, type Column } from '@/components/common/DataTable';
import { DetailList } from '@/components/common/DetailList';
import { LoadStatus } from '@/components/common/LoadStatus';
import { Panel } from '@/components/common/Panel';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLoad } from '@/hooks/useLoad';
import { formatDate } from '@/lib/format';

// How many of the latest calls the page lists
const SHOWN_CALLS = 20;

const callColumns: Column<ApiKeyIpAddressSchema>[] = [
  { header: 'Address', cell: (call) => <span className="font-mono text-[0.8125rem]">{call.ip_address}</span> },
  { header: 'When', cell: (call) => formatDate(call.created_at), className: 'whitespace-nowrap' },
];

export function ApiKeyReadPage() {
  const { id = '' } = useParams<{ id: string }>();

  const load = useCallback(() => getApiKeyById(id), [id]);
  const { data: apiKey, error, isLoading, reload } = useLoad(load, 'Could not load the API key.');

  if (!apiKey) {
    return (
      <>
        <PageHeader title="API key" back={{ to: '/machine-learning/api-keys', label: 'API keys' }} />
        <LoadStatus isLoading={isLoading} error={error} onRetry={reload} />
      </>
    );
  }

  // The API records the address of every call made with the key, and of the browser that created it
  const calls = [...(apiKey.ip_addresses ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={apiKey.name || `Key ${apiKey.id}`}
        back={{ to: '/machine-learning/api-keys', label: 'API keys' }}
      />

      <div className="space-y-6">
        <Panel title="Details">
          <DetailList
            items={[
              { label: 'Requests', value: apiKey.usage_count ?? 0 },
              { label: 'Last used', value: formatDate(apiKey.last_used_at) },
              { label: 'Created', value: formatDate(apiKey.created_at) },
              {
                label: 'Key',
                value: 'Shown once, when the key was created. Only a hash of it is stored, so it can’t be shown again.',
              },
            ]}
          />
        </Panel>

        <Panel
          title="Where it was used from"
          description={
            calls.length > SHOWN_CALLS ? `The latest ${SHOWN_CALLS} of ${calls.length} recorded addresses.` : undefined
          }
          bodyClassName="p-0"
        >
          <DataTable
            caption="Addresses this key was used from"
            columns={callColumns}
            rows={calls.slice(0, SHOWN_CALLS)}
            getRowKey={(call) => call.id}
            empty="No address is recorded for this key."
          />
        </Panel>
      </div>
    </div>
  );
}
