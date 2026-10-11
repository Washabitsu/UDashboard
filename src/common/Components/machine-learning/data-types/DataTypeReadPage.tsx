import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getDataTypeById } from '@/api/dataTypeApi';
import { DetailList } from '@/components/common/DetailList';
import { LoadStatus } from '@/components/common/LoadStatus';
import { Panel } from '@/components/common/Panel';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useLoad } from '@/hooks/useLoad';

export function DataTypeReadPage() {
  const { id = '' } = useParams<{ id: string }>();

  const load = useCallback(() => getDataTypeById(id), [id]);
  const { data: dataType, error, isLoading, reload } = useLoad(load, 'Could not load the file type.');

  if (!dataType) {
    return (
      <>
        <PageHeader title="File type" back={{ to: '/machine-learning/data-types', label: 'File types' }} />
        <LoadStatus isLoading={isLoading} error={error} onRetry={reload} />
      </>
    );
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={dataType.name}
        back={{ to: '/machine-learning/data-types', label: 'File types' }}
        actions={
          <Button asChild variant="outline">
            <Link to={`/machine-learning/data-types/${id}/edit`}>Edit</Link>
          </Button>
        }
      />

      <Panel title="Details">
        <DetailList
          items={[
            { label: 'Extension', value: dataType.name, mono: true },
            { label: 'Description', value: dataType.description },
          ]}
        />
      </Panel>
    </div>
  );
}
