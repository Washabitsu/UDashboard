import type { ReactNode } from 'react';

import { Label } from '@/components/ui/label';

type FieldProps = {
  label: string;
  htmlFor?: string;
  optional?: boolean;
  hint?: ReactNode;
  children: ReactNode;
};

// One form row: label, the control, and a hint under it
export function Field({ label, htmlFor, optional = false, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="justify-between">
        {label}
        {optional && <span className="font-normal text-muted-foreground">Optional</span>}
      </Label>
      {children}
      {hint && <p className="text-xs leading-5 text-muted-foreground">{hint}</p>}
    </div>
  );
}
