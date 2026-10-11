import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  // Link to the page one level up, shown above the title
  back?: { to: string; label: string };
  // Shown next to the title, e.g. a status
  meta?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, description, back, meta, actions }: PageHeaderProps) {
  return (
    <header className="mb-6">
      {back && (
        <Link
          to={back.to}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <h1 className="text-2xl font-semibold break-words">{title}</h1>
            {meta}
          </div>
          {description && <p className="mt-1 max-w-[70ch] text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}
