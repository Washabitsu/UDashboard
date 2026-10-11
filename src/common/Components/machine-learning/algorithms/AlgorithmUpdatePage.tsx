import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getMlAlgorithmById, updateMlAlgorithm } from '@/api/mlAlgorithmApi';
import { LoadStatus } from '@/components/common/LoadStatus';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLoad } from '@/hooks/useLoad';

import { AlgorithmForm, type AlgorithmFormValues } from './AlgorithmForm';

export function AlgorithmUpdatePage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const load = useCallback(() => getMlAlgorithmById(id), [id]);
  const { data: algorithm, error, isLoading, reload } = useLoad(load, 'Could not load the algorithm.');

  const save = async (values: AlgorithmFormValues) => {
    await updateMlAlgorithm(id, values);
    navigate(`/machine-learning/algorithms/${id}`);
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={algorithm ? `Edit ${algorithm.name}` : 'Edit algorithm'}
        back={{ to: `/machine-learning/algorithms/${id}`, label: 'Back to the algorithm' }}
      />

      {!algorithm ? (
        <LoadStatus isLoading={isLoading} error={error} onRetry={reload} />
      ) : (
        <AlgorithmForm
          algorithm={algorithm}
          submitLabel="Save changes"
          save={save}
          cancelTo={`/machine-learning/algorithms/${id}`}
        />
      )}
    </div>
  );
}
