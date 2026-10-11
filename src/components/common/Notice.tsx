import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type NoticeProps = {
  tone?: 'error' | 'success' | 'warning' | 'info';
  children: ReactNode;
  className?: string;
};

const TONES = {
  error: 'border-destructive/30 bg-destructive/5 text-destructive',
  success: 'border-primary/30 bg-primary/5 text-primary',
  warning: 'border-signal/50 bg-signal/10 text-[#7a5200]',
  info: 'border-border bg-muted text-muted-foreground',
};

// A message that belongs to the page: something failed, something worked, something to know.
export function Notice({ tone = 'error', children, className }: NoticeProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('rounded-md border px-3 py-2 text-sm', TONES[tone], className)}
    >
      {children}
    </div>
  );
}
