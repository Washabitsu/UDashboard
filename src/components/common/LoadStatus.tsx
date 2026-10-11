import { Notice } from '@/components/common/Notice';
import { Button } from '@/components/ui/button';

type LoadStatusProps = {
  isLoading: boolean;
  error: string;
  onRetry: () => void;
};

// What a page shows while its data is on the way, or when it did not arrive
export function LoadStatus({ isLoading, error, onRetry }: LoadStatusProps) {
  if (isLoading) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <Notice className="flex flex-wrap items-center justify-between gap-3">
      <span>{error || 'Nothing came back.'}</span>
      <Button type="button" size="sm" variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </Notice>
  );
}
