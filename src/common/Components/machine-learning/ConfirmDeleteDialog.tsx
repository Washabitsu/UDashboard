import { Modal } from '@/components/common/Modal';
import { Notice } from '@/components/common/Notice';
import { Button } from '@/components/ui/button';

type ConfirmDeleteDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDeleteDialog({
  open,
  title,
  description,
  confirmLabel,
  isSubmitting = false,
  errorMessage = '',
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  if (!open) {
    return null;
  }

  // Cancel comes first, so the focus starts on the harmless button
  return (
    <Modal title={title} description={description} onClose={onCancel}>
      {errorMessage && <Notice className="mb-4">{errorMessage}</Notice>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="button" variant="destructive" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? 'Deleting…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
