import { useLayoutEffect, useRef, type ReactNode } from 'react';

type ModalProps = {
  title: string;
  description?: string;
  // Called for Escape and for a click next to the dialog
  onClose: () => void;
  children: ReactNode;
};

// A dialog over the page. It is the browser's own <dialog>: opened with showModal() it keeps the
// keyboard focus inside, makes the page behind it unreachable, and gives the focus back when it closes.
export function Modal({ title, description, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  // A layout effect, because its clean-up runs while the dialog is still on the page:
  // only then does close() put the focus back on the button that opened it.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();

    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border bg-card p-0 text-foreground shadow-xl backdrop:bg-sidebar/60"
      // Escape. The page decides whether the dialog goes away (it does so by no longer rendering it).
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // The dialog has no padding of its own, so a click that lands on it is a click on the backdrop
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </dialog>
  );
}
