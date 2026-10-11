import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getMlAlgorithmById } from '@/api/mlAlgorithmApi';
import { DetailList } from '@/components/common/DetailList';
import { JsonEditor } from '@/components/common/JsonEditor';
import { LoadStatus } from '@/components/common/LoadStatus';
import { Panel } from '@/components/common/Panel';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useLoad } from '@/hooks/useLoad';
import { formatDate } from '@/lib/format';
import { toJsonText } from '@/lib/json';

export function AlgorithmReadPage() {
  const { id = '' } = useParams<{ id: string }>();

  const load = useCallback(() => getMlAlgorithmById(id), [id]);
  const { data: algorithm, error, isLoading, reload } = useLoad(load, 'Could not load the algorithm.');

  if (!algorithm) {
    return (
      <>
        <PageHeader title="Algorithm" back={{ to: '/machine-learning/algorithms', label: 'Algorithms' }} />
        <LoadStatus isLoading={isLoading} error={error} onRetry={reload} />
      </>
    );
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={algorithm.name}
        description={algorithm.description}
        back={{ to: '/machine-learning/algorithms', label: 'Algorithms' }}
        actions={
          <Button asChild variant="outline">
            <Link to={`/machine-learning/algorithms/${id}/edit`}>Edit</Link>
          </Button>
        }
      />

      <div className="space-y-6">
        <Panel title="Details">
          <DetailList
            items={[
              { label: 'Training queue', value: algorithm.queue_name, mono: true },
              { label: 'Prediction queue', value: algorithm.prediction_queue_name, mono: true },
              { label: 'Created', value: formatDate(algorithm.created_at, '') },
            ]}
          />
        </Panel>

        <Panel title="Settings" description="The keys every model of this algorithm has to set.">
          <JsonEditor id="algorithm-config" label="Settings of the algorithm" value={toJsonText(algorithm.config_schema)} readOnly />
        </Panel>
      </div>
    </div>
  );
}
