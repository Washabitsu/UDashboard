import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

type RowActionsProps = {
  // Extra buttons in front of Edit and Delete
  children?: ReactNode;
  editTo?: string;
  onDelete: () => void;
};

// The buttons at the end of a table row
export function RowActions({ children, editTo, onDelete }: RowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      {children}
      {editTo && (
        <Button asChild size="sm" variant="ghost">
          <Link to={editTo}>Edit</Link>
        </Button>
      )}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="text-destructive hover:bg-destructive/10"
        onClick={onDelete}
      >
        Delete
      </Button>
    </div>
  );
}

// The look of the link in the first column of a table, the one that opens the item
export const rowLinkClassName = 'font-medium text-foreground underline-offset-4 hover:text-primary hover:underline';
