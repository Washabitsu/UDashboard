import type { ReactNode } from 'react';

// A short label next to a value, e.g. what a dataset is used for
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-sm border bg-muted px-1.5 py-0.5 text-xs whitespace-nowrap text-muted-foreground">
      {children}
    </span>
  );
}
