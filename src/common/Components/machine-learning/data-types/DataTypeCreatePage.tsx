import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { createDataType } from '@/api/dataTypeApi';
import { getRequestErrorMessage } from '@/api/errorMessage';
import { Field } from '@/components/common/Field';
import { FormActions } from '@/components/common/FormActions';
import { Notice } from '@/components/common/Notice';
import { Panel } from '@/components/common/Panel';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function DataTypeCreatePage() {
  const navigate = useNavigate();
  const [fileExtension, setFileExtension] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage('');

    const extension = fileExtension.trim();
    if (!extension) {
      setErrorMessage('The extension is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      // The API stores the extension as the name of the data type
      const created = await createDataType({
        name: extension.startsWith('.') ? extension : `.${extension}`,
        description: description.trim() || undefined,
      });
      navigate(`/machine-learning/data-types/${created.id}`);
    } catch (error) {
      setErrorMessage(getRequestErrorMessage(error, 'Could not create the file type.'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="New file type"
        description="Allow one more kind of file for datasets."
        back={{ to: '/machine-learning/data-types', label: 'File types' }}
      />

      <form onSubmit={handleSubmit}>
        <Panel bodyClassName="space-y-5">
          <Field label="Extension" htmlFor="data-type-extension" hint="For example .csv">
            <Input
              id="data-type-extension"
              className="font-mono"
              placeholder=".csv"
              value={fileExtension}
              onChange={(event) => setFileExtension(event.target.value)}
            />
          </Field>
          <Field label="Description" htmlFor="data-type-description" optional>
            <Input
              id="data-type-description"
              placeholder="Comma-separated values"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>

          {errorMessage && <Notice>{errorMessage}</Notice>}

          <FormActions>
            <Button type="submit" disabled={isSubmitting}>
              Create file type
            </Button>
            <Button asChild variant="outline">
              <Link to="/machine-learning/data-types">Cancel</Link>
            </Button>
          </FormActions>
        </Panel>
      </form>
    </div>
  );
}
