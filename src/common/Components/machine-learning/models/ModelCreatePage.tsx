import { useNavigate } from 'react-router-dom';

import { listMlAlgorithms } from '@/api/mlAlgorithmApi';
import { createMlModel } from '@/api/mlModelApi';
import type { MlAlgorithmSchema } from '@/api/mlSchemas';
import { toList } from '@/api/normalize';
import { LoadStatus } from '@/components/common/LoadStatus';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLoad } from '@/hooks/useLoad';

import { ModelForm, type ModelFormValues } from './ModelForm';

const loadAlgorithms = () =>
  listMlAlgorithms<unknown>().then((response) => toList<MlAlgorithmSchema>(response, ['algorithms']));

export function ModelCreatePage() {
  const navigate = useNavigate();
  const { data: algorithms, error, isLoading, reload } = useLoad(loadAlgorithms, 'Could not load the algorithms.');

  // After the model exists, go to its page or straight to the page where datasets are assigned
  const createAndOpen = (page: '' | '/datasets') => async (values: ModelFormValues) => {
    const created = await createMlModel(values);
    navigate(`/machine-learning/models/${created.id}${page}`);
  };

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="New model"
        description="Pick an algorithm and its settings. Training comes after a dataset is assigned."
        back={{ to: '/machine-learning/models', label: 'Models' }}
      />

      {!algorithms ? (
        <LoadStatus isLoading={isLoading} error={error} onRetry={reload} />
      ) : (
        <ModelForm
          algorithms={algorithms}
          cancelTo="/machine-learning/models"
          actions={[
            { label: 'Create model', save: createAndOpen('') },
            { label: 'Create and assign datasets', save: createAndOpen('/datasets') },
          ]}
        />
      )}
    </div>
  );
}
