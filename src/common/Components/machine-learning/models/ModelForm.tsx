import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { getRequestErrorMessage } from '@/api/errorMessage';
import type { MLModelSchema, MlAlgorithmSchema, ModelStatus } from '@/api/mlSchemas';
import { Field } from '@/components/common/Field';
import { FormActions } from '@/components/common/FormActions';
import { JsonEditor } from '@/components/common/JsonEditor';
import { Notice } from '@/components/common/Notice';
import { Panel } from '@/components/common/Panel';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { parseJsonObject, toJsonText } from '@/lib/json';

import { MODEL_STATUS_OPTIONS } from './modelOptions';

export type ModelFormValues = {
  name: string;
  version: string;
  description?: string;
  ml_algorithm_id: string;
  ml_algorithm_config: Record<string, unknown>;
  // Left out when an existing model keeps its status
  model_status?: ModelStatus;
};

export type ModelFormAction = {
  label: string;
  // Sends the values to the API and moves on to the next page. An error it throws is shown in the form.
  save: (values: ModelFormValues) => Promise<void>;
};

type ModelFormProps = {
  // The model that is edited. Left out when a new model is created.
  model?: MLModelSchema;
  algorithms: MlAlgorithmSchema[];
  // One button per action. The first one is the main button.
  actions: ModelFormAction[];
  cancelTo: string;
};

// The form behind "New model" and "Edit model"
export function ModelForm({ model, algorithms, actions, cancelTo }: ModelFormProps) {
  const isNew = !model;
  const firstAlgorithm = algorithms.at(0);

  const [name, setName] = useState(model?.name ?? '');
  const [version, setVersion] = useState(model?.version ?? '');
  const [description, setDescription] = useState(model?.description ?? '');
  const [algorithmId, setAlgorithmId] = useState(model?.ml_algorithm_id ?? firstAlgorithm?.id ?? '');
  const [status, setStatus] = useState<ModelStatus>(model?.model_status ?? 'DRAFT');
  // A new model starts with the settings of its algorithm
  const [configText, setConfigText] = useState(toJsonText(model?.ml_algorithm_config ?? firstAlgorithm?.config_schema));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const algorithm = algorithms.find((item) => item.id === algorithmId);

  const changeAlgorithm = (nextAlgorithmId: string) => {
    setAlgorithmId(nextAlgorithmId);

    // Another algorithm has other settings. An existing model keeps what was saved until it is edited by hand.
    if (isNew) {
      setConfigText(toJsonText(algorithms.find((item) => item.id === nextAlgorithmId)?.config_schema));
    }
  };

  const submit = async (action: ModelFormAction) => {
    setErrorMessage('');

    if (!name.trim() || !version.trim() || !algorithmId) {
      setErrorMessage('Name, version and algorithm are required.');
      return;
    }

    const config = parseJsonObject(configText);
    if (!config) {
      setErrorMessage('The settings are not valid JSON. They must be one object: { … }');
      return;
    }

    setIsSubmitting(true);
    try {
      await action.save({
        name: name.trim(),
        version: version.trim(),
        // A new model has no description to remove. For an existing one an empty text removes it.
        description: isNew ? description.trim() || undefined : description.trim(),
        ml_algorithm_id: algorithmId,
        ml_algorithm_config: config,
        // The status is only sent when it was changed here. Otherwise saving a model that finished
        // training while this form was open would set it back to the status the form was opened with.
        model_status: isNew || status !== model.model_status ? status : undefined,
      });
    } catch (error) {
      setErrorMessage(getRequestErrorMessage(error, 'Could not save the model.'));
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit(actions[0]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Panel bodyClassName="space-y-5">
        {algorithms.length === 0 && (
          <Notice tone="warning">
            A model needs an algorithm and there is none yet.{' '}
            <Link to="/machine-learning/algorithms/create" className="font-medium underline">
              Add an algorithm
            </Link>{' '}
            first.
          </Notice>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Name" htmlFor="model-name" hint={isNew ? undefined : 'Set when the model was created.'}>
            <Input
              id="model-name"
              placeholder="login-anomalies"
              value={name}
              disabled={!isNew}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field label="Version" htmlFor="model-version">
            <Input
              id="model-version"
              placeholder="1.0.0"
              value={version}
              onChange={(event) => setVersion(event.target.value)}
            />
          </Field>
          <Field label="Algorithm" htmlFor="model-algorithm" hint={algorithm?.description}>
            <Select id="model-algorithm" value={algorithmId} onChange={(event) => changeAlgorithm(event.target.value)}>
              {algorithms.length === 0 && <option value="">No algorithms</option>}
              {algorithms.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Status"
            htmlFor="model-status"
            hint="Training sets this by itself. Change it by hand only to correct it or to archive the model."
          >
            <Select id="model-status" value={status} onChange={(event) => setStatus(event.target.value as ModelStatus)}>
              {MODEL_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Description" htmlFor="model-description" optional>
          <Input
            id="model-description"
            placeholder="Flags unusual sign-ins"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Settings"
            htmlFor="model-config"
            hint="JSON. Use exactly the keys of the algorithm’s settings, the API refuses other keys."
          >
            <JsonEditor id="model-config" rows={7} value={configText} onChange={setConfigText} />
          </Field>
          <Field label="Settings of the algorithm" htmlFor="model-algorithm-config" hint="For comparison, can’t be edited here.">
            <JsonEditor id="model-algorithm-config" rows={7} value={toJsonText(algorithm?.config_schema)} readOnly />
          </Field>
        </div>

        {errorMessage && <Notice>{errorMessage}</Notice>}

        <FormActions>
          {actions.map((action, index) => (
            <Button
              key={action.label}
              type={index === 0 ? 'submit' : 'button'}
              variant={index === 0 ? 'default' : 'secondary'}
              disabled={isSubmitting || algorithms.length === 0}
              onClick={index === 0 ? undefined : () => void submit(action)}
            >
              {action.label}
            </Button>
          ))}
          <Button asChild variant="outline">
            <Link to={cancelTo}>Cancel</Link>
          </Button>
        </FormActions>
      </Panel>
    </form>
  );
}
