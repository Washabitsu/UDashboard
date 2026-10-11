import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { createDataset } from '@/api/datasetApi';
import { listDataTypes } from '@/api/dataTypeApi';
import { getRequestErrorMessage } from '@/api/errorMessage';
import type { DataTypeSchema } from '@/api/mlSchemas';
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

import { ColumnNormalizationForm } from './DatasetNormalization';
import {
  buildNormalizationSchema,
  createDefaultRule,
  parseCsvHeader,
  type ColumnRuleForm,
} from './normalizationRules';

const loadDataTypes = () =>
  listDataTypes<unknown>().then((response) => toList<DataTypeSchema>(response, ['data_types', 'dataTypes']));

export function DatasetCreatePage() {
  const navigate = useNavigate();
  const { data: dataTypes, error, isLoading, reload } = useLoad(loadDataTypes, 'Could not load the file types.');

  const [file, setFile] = useState<File | null>(null);
  const [selectedDataTypeId, setSelectedDataTypeId] = useState('');
  const [description, setDescription] = useState('');
  const [normalizationRules, setNormalizationRules] = useState<ColumnRuleForm[]>([]);
  const [headerMessage, setHeaderMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Nothing picked yet means the first file type of the list
  const dataTypeId = selectedDataTypeId || dataTypes?.at(0)?.id || '';

  const handleFileChange = async (selectedFile: File | null) => {
    setFile(selectedFile);
    setHeaderMessage('');
    setNormalizationRules([]);

    if (!selectedFile) {
      return;
    }

    // Pick the file type that matches the file's extension, if there is one
    const fileName = selectedFile.name.toLowerCase();
    const matchingType = dataTypes?.find((dataType) => fileName.endsWith(dataType.name.toLowerCase()));
    if (matchingType) {
      setSelectedDataTypeId(matchingType.id);
    }

    // The columns can only be read from a CSV file
    if (!fileName.endsWith('.csv') && selectedFile.type !== 'text/csv') {
      return;
    }

    try {
      const columnNames = await parseCsvHeader(selectedFile);
      if (columnNames.length === 0) {
        setHeaderMessage('The first line of the file has no column names.');
        return;
      }
      setNormalizationRules(columnNames.map((columnName) => createDefaultRule(columnName)));
    } catch {
      setHeaderMessage('The first line of the file could not be read.');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage('');

    if (!file || !dataTypeId) {
      setErrorMessage('A file and a file type are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createDataset({
        file,
        data_type_id: dataTypeId,
        description: description.trim() || undefined,
        normalization_schema: normalizationRules.length > 0 ? buildNormalizationSchema(normalizationRules) : undefined,
      });
      navigate(`/machine-learning/datasets/${created.id}`);
    } catch (requestError) {
      setErrorMessage(getRequestErrorMessage(requestError, 'Could not upload the dataset.'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Upload dataset"
        description="Choose a file, then say how each of its columns is read."
        back={{ to: '/machine-learning/datasets', label: 'Datasets' }}
      />

      {!dataTypes ? (
        <LoadStatus isLoading={isLoading} error={error} onRetry={reload} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Panel title="File" bodyClassName="space-y-5">
            {dataTypes.length === 0 && (
              <Notice tone="warning">
                A dataset needs a file type and there is none yet.{' '}
                <Link to="/machine-learning/data-types/create" className="font-medium underline">
                  Add a file type
                </Link>{' '}
                first.
              </Notice>
            )}

            <div className="grid gap-5 md:grid-cols-[1fr_12rem]">
              <Field label="File" htmlFor="dataset-file">
                <Input
                  id="dataset-file"
                  type="file"
                  onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
                />
              </Field>
              <Field label="File type" htmlFor="dataset-type">
                <Select
                  id="dataset-type"
                  className="font-mono"
                  value={dataTypeId}
                  onChange={(event) => setSelectedDataTypeId(event.target.value)}
                >
                  {dataTypes.length === 0 && <option value="">No file types</option>}
                  {dataTypes.map((dataType) => (
                    <option key={dataType.id} value={dataType.id}>
                      {dataType.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Description" htmlFor="dataset-description" optional>
              <Input
                id="dataset-description"
                placeholder="Sign-ins, June"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Field>
          </Panel>

          <Panel
            title="Columns"
            description="Read from the first line of the CSV file. Leave out what the model should not learn from, such as ids."
            bodyClassName="space-y-4"
          >
            {headerMessage && <Notice tone="warning">{headerMessage}</Notice>}
            <ColumnNormalizationForm rules={normalizationRules} onChange={setNormalizationRules} />
          </Panel>

          {errorMessage && <Notice>{errorMessage}</Notice>}

          <FormActions>
            <Button type="submit" disabled={isSubmitting || dataTypes.length === 0}>
              {isSubmitting ? 'Uploading…' : 'Upload dataset'}
            </Button>
            <Button asChild variant="outline">
              <Link to="/machine-learning/datasets">Cancel</Link>
            </Button>
          </FormActions>
        </form>
      )}
    </div>
  );
}
