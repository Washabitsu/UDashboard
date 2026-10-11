import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { getRequestErrorMessage } from '@/api/errorMessage';
import type { MlAlgorithmSchema } from '@/api/mlSchemas';
import { Field } from '@/components/common/Field';
import { FormActions } from '@/components/common/FormActions';
import { JsonEditor } from '@/components/common/JsonEditor';
import { Notice } from '@/components/common/Notice';
import { Panel } from '@/components/common/Panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseJsonObject, toJsonText } from '@/lib/json';

export type AlgorithmFormValues = {
  name: string;
  queue_name: string;
  prediction_queue_name: string;
  config_schema: Record<string, unknown>;
  description?: string;
};

type AlgorithmFormProps = {
  // The algorithm that is edited. Left out when a new one is created.
  algorithm?: MlAlgorithmSchema;
  submitLabel: string;
  // Sends the values to the API and moves on to the next page. An error it throws is shown in the form.
  save: (values: AlgorithmFormValues) => Promise<void>;
  cancelTo: string;
};

// The settings a new algorithm starts with: the ones the Isolation Forest worker understands
const EXAMPLE_CONFIG = { n_estimators: 100, contamination: 0.05, random_state: 42 };

// The form behind "New algorithm" and "Edit algorithm"
export function AlgorithmForm({ algorithm, submitLabel, save, cancelTo }: AlgorithmFormProps) {
  const isNew = !algorithm;

  const [name, setName] = useState(algorithm?.name ?? '');
  const [queueName, setQueueName] = useState(algorithm?.queue_name ?? '');
  const [predictionQueueName, setPredictionQueueName] = useState(algorithm?.prediction_queue_name ?? '');
  const [description, setDescription] = useState(algorithm?.description ?? '');
  const [configText, setConfigText] = useState(toJsonText(algorithm?.config_schema ?? EXAMPLE_CONFIG));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !queueName.trim() || !predictionQueueName.trim()) {
      setErrorMessage('Name, training queue and prediction queue are required.');
      return;
    }

    const config = parseJsonObject(configText);
    if (!config) {
      setErrorMessage('The settings are not valid JSON. They must be one object: { … }');
      return;
    }

    setIsSubmitting(true);
    try {
      await save({
        name: name.trim(),
        queue_name: queueName.trim(),
        prediction_queue_name: predictionQueueName.trim(),
        config_schema: config,
        // For an existing algorithm an empty text removes the description
        description: isNew ? description.trim() || undefined : description.trim(),
      });
    } catch (error) {
      setErrorMessage(getRequestErrorMessage(error, 'Could not save the algorithm.'));
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Panel bodyClassName="space-y-5">
        <Field label="Name" htmlFor="algorithm-name" hint={isNew ? undefined : 'Set when the algorithm was created.'}>
          <Input
            id="algorithm-name"
            placeholder="Isolation Forest"
            value={name}
            disabled={!isNew}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Training queue"
            htmlFor="algorithm-queue"
            hint="The RabbitMQ queue the training worker listens on."
          >
            <Input
              id="algorithm-queue"
              className="font-mono"
              placeholder="isolation_forest"
              value={queueName}
              onChange={(event) => setQueueName(event.target.value)}
            />
          </Field>
          <Field
            label="Prediction queue"
            htmlFor="algorithm-prediction-queue"
            hint="The queue the prediction worker listens on."
          >
            <Input
              id="algorithm-prediction-queue"
              className="font-mono"
              placeholder="isolation_forest_prediction"
              value={predictionQueueName}
              onChange={(event) => setPredictionQueueName(event.target.value)}
            />
          </Field>
        </div>

        <Field
          label="Settings"
          htmlFor="algorithm-config"
          hint="JSON. Every model of this algorithm must use exactly these keys, each with its own value."
        >
          <JsonEditor id="algorithm-config" rows={7} value={configText} onChange={setConfigText} />
        </Field>

        <Field label="Description" htmlFor="algorithm-description" optional>
          <Input
            id="algorithm-description"
            placeholder="Finds records that differ from the rest"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>

        {errorMessage && <Notice>{errorMessage}</Notice>}

        <FormActions>
          <Button type="submit" disabled={isSubmitting}>
            {submitLabel}
          </Button>
          <Button asChild variant="outline">
            <Link to={cancelTo}>Cancel</Link>
          </Button>
        </FormActions>
      </Panel>
    </form>
  );
}
