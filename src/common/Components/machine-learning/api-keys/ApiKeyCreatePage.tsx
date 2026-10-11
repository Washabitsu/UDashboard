import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { createApiKey } from '@/api/apiKeyApi';
import { getRequestErrorMessage } from '@/api/errorMessage';
import { listMlModels } from '@/api/mlModelApi';
import type { ApiKeySchema, MLModelSchema } from '@/api/mlSchemas';
import { toList } from '@/api/normalize';
import { Field } from '@/components/common/Field';
import { FormActions } from '@/components/common/FormActions';
import { LoadStatus } from '@/components/common/LoadStatus';
import { Notice } from '@/components/common/Notice';
import { Panel } from '@/components/common/Panel';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { useLoad } from '@/hooks/useLoad';

const loadModels = () => listMlModels<unknown>().then((response) => toList<MLModelSchema>(response, ['models']));

export function ApiKeyCreatePage() {
  const [searchParams] = useSearchParams();
  const { data: models, error, isLoading, reload } = useLoad(loadModels, 'Could not load the models.');

  const [selectedModelId, setSelectedModelId] = useState('');
  const [name, setName] = useState('');
  const [createdApiKey, setCreatedApiKey] = useState<ApiKeySchema | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Nothing picked yet: the model named in the address (…/create?modelId=3) if it exists, or else the first one
  const requestedModelId = searchParams.get('modelId');
  const modelId =
    selectedModelId ||
    models?.find((model) => model.id === requestedModelId)?.id ||
    models?.at(0)?.id ||
    '';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage('');

    if (!modelId || !name.trim()) {
      setErrorMessage('A model and a name are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      setCreatedApiKey(await createApiKey({ model_id: modelId, name: name.trim() }));
    } catch (requestError) {
      setErrorMessage(getRequestErrorMessage(requestError, 'Could not create the API key.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Once the key exists the form is gone and the key takes its place. It is on the page itself, not in
  // a dialog, so a stray click or Escape can't hide a key that can never be shown again.
  if (createdApiKey) {
    return (
      <div className="max-w-2xl">
        <PageHeader title="API key created" back={{ to: '/machine-learning/api-keys', label: 'API keys' }} />
        <CreatedKeyPanel apiKey={createdApiKey} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="New API key"
        description="The key belongs to one model. Whoever has it can ask that model for predictions."
        back={{ to: '/machine-learning/api-keys', label: 'API keys' }}
      />

      {!models ? (
        <LoadStatus isLoading={isLoading} error={error} onRetry={reload} />
      ) : (
        <form onSubmit={handleSubmit}>
          <Panel bodyClassName="space-y-5">
            {models.length === 0 && (
              <Notice tone="warning">
                A key needs a model and there is none yet.{' '}
                <Link to="/machine-learning/models/create" className="font-medium underline">
                  Create a model
                </Link>{' '}
                first.
              </Notice>
            )}

            <Field label="Model" htmlFor="api-key-model">
              <Select id="api-key-model" value={modelId} onChange={(event) => setSelectedModelId(event.target.value)}>
                {models.length === 0 && <option value="">No models</option>}
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.version})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Name" htmlFor="api-key-name" hint="Something that tells you later who uses the key.">
              <Input
                id="api-key-name"
                placeholder="Billing service"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>

            {errorMessage && <Notice>{errorMessage}</Notice>}

            <FormActions>
              <Button type="submit" disabled={isSubmitting || models.length === 0}>
                Create API key
              </Button>
              <Button asChild variant="outline">
                <Link to="/machine-learning/api-keys">Cancel</Link>
              </Button>
            </FormActions>
          </Panel>
        </form>
      )}
    </div>
  );
}

// The one moment the key can be read: the answer to "create" carries it, later answers only its hash
function CreatedKeyPanel({ apiKey }: { apiKey: ApiKeySchema }) {
  const [copyMessage, setCopyMessage] = useState('');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey.key);
      setCopyMessage('Copied.');
    } catch {
      setCopyMessage('The browser did not allow copying. Select the key and copy it by hand.');
    }
  };

  return (
    <Panel bodyClassName="space-y-4">
      <Notice tone="warning">
        Copy the key now. This is the only time it is shown: only a hash of it is stored.
      </Notice>

      <p id="created-api-key" className="rounded-md border bg-muted p-3 font-mono text-[0.8125rem] break-all">
        {apiKey.key}
      </p>

      {copyMessage && <Notice tone="info">{copyMessage}</Notice>}

      <FormActions>
        <Button type="button" onClick={() => void handleCopy()}>
          Copy key
        </Button>
        <Button asChild variant="outline">
          <Link to={`/machine-learning/api-keys/${apiKey.id}`}>Done</Link>
        </Button>
      </FormActions>
    </Panel>
  );
}
