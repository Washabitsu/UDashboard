import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { listMlAlgorithms } from '@/api/mlAlgorithmApi';
import { getMlModelById, updateMlModel } from '@/api/mlModelApi';
import type { MlAlgorithmSchema } from '@/api/mlSchemas';
import { toList } from '@/api/normalize';
import { LoadStatus } from '@/components/common/LoadStatus';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLoad } from '@/hooks/useLoad';

import { ModelForm, type ModelFormValues } from './ModelForm';

export function ModelUpdatePage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    const [model, algorithms] = await Promise.all([getMlModelById(id), listMlAlgorithms<unknown>()]);

    return { model, algorithms: toList<MlAlgorithmSchema>(algorithms, ['algorithms']) };
  }, [id]);
  const { data, error, isLoading, reload } = useLoad(load, 'Could not load the model.');

  const save = async (values: ModelFormValues) => {
    await updateMlModel(id, values);
    navigate(`/machine-learning/models/${id}`);
  };

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={data ? `Edit ${data.model.name}` : 'Edit model'}
        back={{ to: `/machine-learning/models/${id}`, label: 'Back to the model' }}
      />

      {!data ? (
        <LoadStatus isLoading={isLoading} error={error} onRetry={reload} />
      ) : (
        // The form copies the model into its fields once, when it is first shown
        <ModelForm
          model={data.model}
          algorithms={data.algorithms}
          cancelTo={`/machine-learning/models/${id}`}
          actions={[{ label: 'Save changes', save }]}
        />
      )}
    </div>
  );
}
