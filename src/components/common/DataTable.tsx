import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type Column<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  // Read by screen readers, not shown
  caption: string;
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  // Shown instead of the rows when there are none
  empty: ReactNode;
};

export function DataTable<T>({ caption, columns, rows, getRowKey, empty }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <div className="px-5 py-10 text-center text-sm text-muted-foreground">{empty}</div>;
  }

  return (
    // A wide table scrolls sideways inside its panel instead of stretching the page
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b bg-muted/60">
            {columns.map((column) => (
              <th
                key={column.header}
                scope="col"
                className={cn('px-5 py-2.5 font-medium whitespace-nowrap text-muted-foreground', column.className)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={getRowKey(row, index)} className="border-b last:border-b-0 hover:bg-muted/40">
              {columns.map((column) => (
                <td key={column.header} className={cn('px-5 py-3 align-middle', column.className)}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
