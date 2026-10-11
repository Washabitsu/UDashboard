import { useCallback, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { getDataTypeById, updateDataType } from '@/api/dataTypeApi';
import { getRequestErrorMessage } from '@/api/errorMessage';
import type { DataTypeSchema } from '@/api/mlSchemas';
import { Field } from '@/components/common/Field';
import { FormActions } from '@/components/common/FormActions';
import { LoadStatus } from '@/components/common/LoadStatus';
import { Notice } from '@/components/common/Notice';
import { Panel } from '@/components/common/Panel';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLoad } from '@/hooks/useLoad';

export function DataTypeUpdatePage() {
  const { id = '' } = useParams<{ id: string }>();

  const load = useCallback(() => getDataTypeById(id), [id]);
  const { data: dataType, error, isLoading, reload } = useLoad(load, 'Could not load the file type.');

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={dataType ? `Edit ${dataType.name}` : 'Edit file type'}
        back={{ to: `/machine-learning/data-types/${id}`, label: 'Back to the file type' }}
      />

      {!dataType ? (
        <LoadStatus isLoading={isLoading} error={error} onRetry={reload} />
      ) : (
        <DataTypeEditForm dataType={dataType} />
      )}
    </div>
  );
}

// Shown once the file type is loaded, so its fields can start with the saved values
function DataTypeEditForm({ dataType }: { dataType: DataTypeSchema }) {
  const navigate = useNavigate();
  const [description, setDescription] = useState(dataType.description ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await updateDataType(dataType.id, { description: description.trim() });
      navigate(`/machine-learning/data-types/${dataType.id}`);
    } catch (error) {
      setErrorMessage(getRequestErrorMessage(error, 'Could not save the file type.'));
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Panel bodyClassName="space-y-5">
        <Field label="Extension" htmlFor="data-type-extension" hint="The extension can’t be changed.">
          <Input id="data-type-extension" className="font-mono" value={dataType.name} disabled />
        </Field>
        <Field label="Description" htmlFor="data-type-description" optional>
          <Input
            id="data-type-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>

        {errorMessage && <Notice>{errorMessage}</Notice>}

        <FormActions>
          <Button type="submit" disabled={isSubmitting}>
            Save changes
          </Button>
          <Button asChild variant="outline">
            <Link to={`/machine-learning/data-types/${dataType.id}`}>Cancel</Link>
          </Button>
        </FormActions>
      </Panel>
    </form>
  );
}
