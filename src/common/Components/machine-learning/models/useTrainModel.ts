import { useState } from 'react';

import { getRequestErrorMessage } from '@/api/errorMessage';
import { initializeModelTrainingJob } from '@/api/mlModelApi';

type TrainNotice = {
  tone: 'success' | 'error';
  text: string;
};

// The "Train" button. Starting a training only puts a job on the queue:
// a worker picks it up and sets the model to Training, then to Ready or Failed.
export function useTrainModel(onQueued?: () => void) {
  const [trainingModelId, setTrainingModelId] = useState<string | null>(null);
  const [notice, setNotice] = useState<TrainNotice | null>(null);

  const train = async (model: { id: string; name: string }) => {
    // One at a time: the Train buttons are disabled while trainingModelId is set, this is the second lock
    if (trainingModelId !== null) {
      return;
    }

    setNotice(null);
    setTrainingModelId(model.id);

    try {
      await initializeModelTrainingJob(model.id);
      setNotice({
        tone: 'success',
        text: `Training of ${model.name} is queued. Reload the page in a moment to see the new status.`,
      });
      onQueued?.();
    } catch (error) {
      setNotice({ tone: 'error', text: getRequestErrorMessage(error, 'Could not start the training.') });
    } finally {
      setTrainingModelId(null);
    }
  };

  return { trainingModelId, notice, train };
}
