import { useCallback, useState } from 'react';
import { Download } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { downloadDatasetFile, getDatasetById } from '@/api/datasetApi';
import { getDataTypeById } from '@/api/dataTypeApi';
import { getRequestErrorMessage } from '@/api/errorMessage';
import { DataTable, type Column } from '@/components/common/DataTable';
import { DetailList } from '@/components/common/DetailList';
import { LoadStatus } from '@/components/common/LoadStatus';
import { Notice } from '@/components/common/Notice';
import { Panel } from '@/components/common/Panel';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useLoad } from '@/hooks/useLoad';
import { formatDate } from '@/lib/format';

import {
  DTYPE_OPTIONS,
  FEATURE_TYPE_OPTIONS,
  TRANSFORMATION_OPTIONS,
  optionLabel,
  rulesFromNormalizationSchema,
  type ColumnRuleForm,
} from './normalizationRules';

// "Trim spaces, lower case, 2 replacements" for one column
function describeCleanUp(rule: ColumnRuleForm): string {
  const parts = rule.transformations.map((item) => optionLabel(TRANSFORMATION_OPTIONS, item).toLowerCase());
  if (rule.replacements.length > 0) {
    parts.push(`${rule.replacements.length} replaced ${rule.replacements.length === 1 ? 'value' : 'values'}`);
  }

  const text = parts.join(', ');
  return text ? text[0].toUpperCase() + text.slice(1) : '—';
}

const ruleColumns: Column<ColumnRuleForm>[] = [
  { header: 'Column', cell: (rule) => <span className="font-mono text-[0.8125rem] break-all">{rule.name}</span> },
  { header: 'Type', cell: (rule) => (rule.drop ? '—' : optionLabel(DTYPE_OPTIONS, rule.dtype)) },
  {
    header: 'Used as',
    cell: (rule) => (rule.drop ? 'Left out' : optionLabel(FEATURE_TYPE_OPTIONS, rule.feature_type)),
  },
  {
    header: 'Empty cells become',
    cell: (rule) => (rule.drop ? '—' : <span className="font-mono text-[0.8125rem]">{rule.fillna}</span>),
  },
  { header: 'Clean-up', cell: (rule) => (rule.drop ? '—' : describeCleanUp(rule)) },
];

export function DatasetReadPage() {
  const { id = '' } = useParams<{ id: string }>();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const load = useCallback(async () => {
    const dataset = await getDatasetById(id);
    // Only needed for the name of the file type (".csv"). The page works without it.
    const dataType = await getDataTypeById(dataset.data_type_id).catch(() => null);

    return { dataset, dataType };
  }, [id]);
  const { data, error, isLoading, reload } = useLoad(load, 'Could not load the dataset.');

  if (!data) {
    return (
      <>
        <PageHeader title="Dataset" back={{ to: '/machine-learning/datasets', label: 'Datasets' }} />
        <LoadStatus isLoading={isLoading} error={error} onRetry={reload} />
      </>
    );
  }

  const { dataset, dataType } = data;
  const rules = rulesFromNormalizationSchema(dataset.normalization_schema);

  const handleDownload = async () => {
    setDownloadError('');
    setIsDownloading(true);

    try {
      const fileBlob = await downloadDatasetFile(id);

      // The browser saves a file when a link with "download" is clicked, so one is made for a moment
      const objectUrl = URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `dataset-${id}${dataType?.name ?? ''}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (requestError) {
      setDownloadError(getRequestErrorMessage(requestError, 'Could not download the file.'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={dataset.description?.trim() || `Dataset ${dataset.id}`}
        back={{ to: '/machine-learning/datasets', label: 'Datasets' }}
        actions={
          <>
            <Button type="button" variant="outline" disabled={isDownloading} onClick={() => void handleDownload()}>
              <Download />
              {isDownloading ? 'Downloading…' : 'Download file'}
            </Button>
            <Button asChild variant="outline">
              <Link to={`/machine-learning/datasets/${id}/edit`}>Edit</Link>
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        {downloadError && <Notice>{downloadError}</Notice>}

        <Panel title="Details">
          <DetailList
            items={[
              { label: 'File type', value: dataType?.name, mono: true },
              { label: 'Uploaded', value: formatDate(dataset.created_at) },
              { label: 'Checksum', value: <span className="break-all">{dataset.data_checksum}</span>, mono: true },
            ]}
          />
        </Panel>

        <Panel title="Columns" description="How each column is read before training." bodyClassName="p-0">
          <DataTable
            caption="Column rules of this dataset"
            columns={ruleColumns}
            rows={rules}
            getRowKey={(rule, index) => `${index}-${rule.name}`}
            empty="This dataset was uploaded without column rules."
          />
        </Panel>
      </div>
    </div>
  );
}
