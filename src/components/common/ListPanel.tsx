import type { ReactNode } from 'react';

import { SearchInput } from '@/components/common/SearchInput';

type ListPanelProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchLabel: string;
  // e.g. "2 of 5 models"
  summary: string;
  children: ReactNode;
};

// The frame of a list page: a search box, how many rows are shown, and the table under it
export function ListPanel({ search, onSearchChange, searchLabel, summary, children }: ListPanelProps) {
  return (
    <section className="rounded-lg border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
        <SearchInput value={search} onChange={onSearchChange} label={searchLabel} />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {summary}
        </p>
      </div>
      {children}
    </section>
  );
}
