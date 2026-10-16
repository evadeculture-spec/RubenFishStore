import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cx } from '../utils/cx';

/** Diálogo modal baseado em <dialog> nativo: foco preso, Esc para fechar, regresso do foco. */
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  side,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Apresenta como painel lateral (direita). */
  side?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cx(
        'w-[calc(100%-1.5rem)] bg-transparent p-0 text-ink backdrop:bg-transparent',
        side ? 'm-0 ml-auto h-full max-h-none max-w-md sm:w-full' : cx('m-auto', widths[size]),
      )}
    >
      {open && (
        <div
          className={cx(
            'flex flex-col bg-sand-50 shadow-lift',
            side ? 'h-full animate-fade-up' : 'max-h-[calc(100dvh-2rem)] animate-pop rounded-2xl',
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-sand-300 px-5 py-4">
            <h2 id={titleId} className="text-lg font-semibold leading-snug">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-abyss-800/5"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-sand-300 px-5 py-3">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
