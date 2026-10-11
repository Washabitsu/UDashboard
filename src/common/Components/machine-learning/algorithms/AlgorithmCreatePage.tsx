import { useNavigate } from 'react-router-dom';

import { createMlAlgorithm } from '@/api/mlAlgorithmApi';
import { PageHeader } from '@/components/layout/PageHeader';

import { AlgorithmForm, type AlgorithmFormValues } from './AlgorithmForm';

export function AlgorithmCreatePage() {
  const navigate = useNavigate();

  const save = async (values: AlgorithmFormValues) => {
    const created = await createMlAlgorithm(values);
    navigate(`/machine-learning/algorithms/${created.id}`);
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="New algorithm"
        description="Describe an algorithm that a worker of yours can run."
        back={{ to: '/machine-learning/algorithms', label: 'Algorithms' }}
      />
      <AlgorithmForm submitLabel="Create algorithm" save={save} cancelTo="/machine-learning/algorithms" />
    </div>
  );
}
