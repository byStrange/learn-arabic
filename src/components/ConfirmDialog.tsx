import { useEffect, useRef, type ReactNode } from 'react';

type Props = {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({ open, title, children, confirmLabel, danger, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      d.showModal();
    }
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="confirm-title"
      onClose={() => {
        onCancel();
        returnTo.current?.focus();
      }}
    >
      <div className="modal__body">
        <h2 id="confirm-title">{title}</h2>
        <div className="modal__text">{children}</div>
        <div className="modal__actions">
          <button type="button" className="btn btn--secondary" onClick={() => ref.current?.close()} autoFocus>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`}
            onClick={() => {
              onConfirm();
              ref.current?.close();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
