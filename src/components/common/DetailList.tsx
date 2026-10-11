import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type DetailItem = {
  label: string;
  value: ReactNode;
  mono?: boolean;
};

// Label and value pairs of one record
export function DetailList({ items }: { items: DetailItem[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-[11rem_1fr]">
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className={cn('m-0 min-w-0 break-words', item.mono && 'font-mono text-[0.8125rem]')}>
            {item.value === undefined || item.value === null || item.value === '' ? '—' : item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
