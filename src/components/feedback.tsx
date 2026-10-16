import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { CircleCheck, TriangleAlert, X } from 'lucide-react';
import { Button } from './ui';
import { Dialog } from './Dialog';
import { cx } from '../utils/cx';

type Toast = { id: number; tone: 'success' | 'error'; message: ReactNode };
type ConfirmOptions = { title: string; body: ReactNode; confirmLabel: string; tone?: 'danger' | 'primary' };

interface FeedbackApi {
  success: (m: ReactNode) => void;
  error: (m: ReactNode) => void;
  confirm: (o: ConfirmOptions) => Promise<boolean>;
}

const Ctx = createContext<FeedbackApi | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const seq = useRef(0);

  const push = useCallback((tone: Toast['tone'], message: ReactNode) => {
    const id = ++seq.current;
    setToasts((t) => [...t.slice(-2), { id, tone, message }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'error' ? 8000 : 5000);
  }, []);

  const api = useMemo<FeedbackApi>(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      confirm: (o) => new Promise<boolean>((resolve) => setConfirmState({ ...o, resolve })),
    }),
    [push],
  );

  const close = (v: boolean) => {
    confirmState?.resolve(v);
    setConfirmState(null);
  };

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-3 sm:bottom-4 sm:items-end sm:px-6">
        <div role="status" aria-live="polite" className="contents">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cx(
                'pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-lift',
                t.tone === 'success' ? 'bg-abyss-900 text-sand-100' : 'bg-white text-[#7A2E14] ring-2 ring-coral/50',
              )}
            >
              {t.tone === 'success' ? (
                <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-tide-300" aria-label="Sucesso" />
              ) : (
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-coral-600" aria-label="Erro" />
              )}
              <div className="flex-1 leading-snug">{t.message}</div>
              <button
                type="button"
                className="-m-1 rounded p-1 opacity-70 hover:opacity-100"
                aria-label="Fechar mensagem"
                onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      </div>
      <Dialog
        open={Boolean(confirmState)}
        onClose={() => close(false)}
        title={confirmState?.title ?? ''}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => close(false)}>
              Voltar
            </Button>
            <Button variant={confirmState?.tone === 'danger' ? 'danger' : 'primary'} onClick={() => close(true)}>
              {confirmState?.confirmLabel}
            </Button>
          </>
        }
      >
        <div className="text-ink-soft">{confirmState?.body}</div>
      </Dialog>
    </Ctx.Provider>
  );
}

export function useFeedback(): FeedbackApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useFeedback fora do FeedbackProvider');
  return v;
}
