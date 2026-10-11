import type { ReactNode } from 'react';

// The row of buttons at the end of a form
export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2 border-t pt-5">{children}</div>;
}
