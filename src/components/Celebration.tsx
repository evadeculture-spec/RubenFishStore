import { useNavigate } from 'react-router-dom';
import { Gift } from 'lucide-react';
import { Dialog } from './Dialog';
import { Button } from './ui';
import { LOYALTY } from '../config/business';
import { useActiveCustomer } from '../store/hooks';
import { store } from '../store/store';

const PIECES = Array.from({ length: 14 }, (_, i) => i);

/** Celebração discreta de um marco desbloqueado. As animações respeitam "movimento reduzido". */
export function Celebration() {
  const { data, customer } = useActiveCustomer();
  const navigate = useNavigate();
  const pending = data.progressEvents.find(
    (e) => e.type === 'milestone_unlocked' && e.customerId === customer.id && !data.seenCelebrations.includes(e.id),
  );
  if (!pending || pending.type !== 'milestone_unlocked') return null;
  const m = LOYALTY.milestones.find((x) => x.level === pending.level)!;

  const dismiss = () =>
    store.run((d) => {
      d.seenCelebrations.push(pending.id);
      return { ok: true, value: null };
    });

  return (
    <Dialog
      open
      onClose={dismiss}
      size="sm"
      title={`Recompensa de ${m.title.toLowerCase()} desbloqueada`}
      footer={
        <>
          <Button variant="secondary" onClick={dismiss}>Mais tarde</Button>
          <Button
            onClick={() => {
              dismiss();
              navigate('/conta/recompensas');
            }}
          >
            Escolher recompensa
          </Button>
        </>
      }
    >
      <div className="relative overflow-hidden rounded-xl bg-abyss-800 px-5 py-8 text-center text-sand-100">
        <div aria-hidden className="pointer-events-none absolute inset-0 motion-reduce:hidden">
          {PIECES.map((i) => (
            <span
              key={i}
              className="absolute block h-2 w-2 animate-fade-up rounded-sm"
              style={{
                left: `${(i * 37) % 100}%`,
                top: i % 2 ? `${4 + ((i * 53) % 14)}%` : `${82 + ((i * 7) % 12)}%`,
                background: ['#4FC0B4', '#E0663E', '#FBF8F2', '#93D9D1'][i % 4],
                transform: `rotate(${i * 25}deg)`,
                animationDelay: `${i * 30}ms`,
              }}
            />
          ))}
        </div>
        <div className="relative mx-auto mb-3 grid h-14 w-14 animate-pop place-items-center rounded-full bg-tide-400 text-abyss-900">
          <Gift className="h-7 w-7" aria-hidden />
        </div>
        <p className="relative font-display text-2xl font-semibold text-white">{m.boxes} boxes entregues</p>
        <p className="relative mt-1 text-sand-100/80">{m.summary}</p>
      </div>
      <p className="mt-4 text-ink-soft">
        Escolhe um produto entre as opções compatíveis com a tua modalidade. Fica reservado e segue na tua próxima box.
      </p>
    </Dialog>
  );
}
