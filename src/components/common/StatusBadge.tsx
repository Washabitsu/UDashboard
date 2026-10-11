import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, { label: string; dot: string }> = {
  DRAFT: { label: 'Draft', dot: 'bg-muted-foreground/50' },
  TRAINING: { label: 'Training', dot: 'bg-signal' },
  READY: { label: 'Ready', dot: 'bg-primary' },
  FAILED: { label: 'Failed', dot: 'bg-destructive' },
  ARCHIVED: { label: 'Archived', dot: 'border border-muted-foreground/60 bg-transparent' },
};

// The state of a model: a coloured dot and the word, so it never depends on colour alone
export function StatusBadge({ status }: { status?: string | null }) {
  const style = STATUS_STYLES[status ?? ''] ?? { label: status || 'Unknown', dot: 'bg-muted-foreground/50' };

  return (
    <span className="inline-flex items-center gap-2 text-sm whitespace-nowrap">
      <span className={cn('size-2 rounded-full', style.dot)} aria-hidden="true" />
      {style.label}
    </span>
  );
}
