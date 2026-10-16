import { useState } from 'react';
import { MODALITIES, MODALITY_ORDER, PLANS } from '../config/business';
import type { Modality, PlanId } from '../domain/types';
import { useDemo } from '../store/store';
import { formatMonth, monthKey } from '../utils/dates';
import { cx } from '../utils/cx';
import { ProductArt } from './art';
import { Badge } from './ui';

/** Edições anteriores ao mês atual do relógio — nunca a edição em curso ou seguinte. */
export function PastEditions({ initialModality = 'spinning-mar', planId = 'explorador', lockModality }: { initialModality?: Modality; planId?: PlanId; lockModality?: boolean }) {
  const data = useDemo();
  const [modality, setModality] = useState<Modality>(initialModality);
  const active = lockModality ? initialModality : modality;
  const month = monthKey(data.clock);
  const editions = data.editions
    .filter((e) => e.status === 'ready' && e.modality === active && e.planId === planId && e.month < month)
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 2);

  return (
    <div>
      {!lockModality && (
        <div role="group" aria-label="Filtrar por modalidade" className="mb-5 flex flex-wrap gap-2">
          {MODALITY_ORDER.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={m === modality}
              onClick={() => setModality(m)}
              className={cx('rounded-full px-4 py-2 text-sm font-semibold transition-colors', m === modality ? 'bg-abyss-800 text-sand-100' : 'bg-white text-abyss-800 ring-1 ring-abyss-800/15 hover:ring-abyss-800/40')}
            >
              {MODALITIES[m].label}
            </button>
          ))}
        </div>
      )}
      {editions.length === 0 ? (
        <p className="rounded-xl bg-sand-200 p-4 text-ink-soft">Ainda não há edições anteriores para mostrar nesta combinação.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {editions.map((e) => (
            <article key={e.id} className="card overflow-hidden" aria-labelledby={`pe-${e.id}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand-300 bg-sand-50 px-5 py-3">
                <h3 id={`pe-${e.id}`} className="text-lg font-semibold">
                  {formatMonth(e.month)} · {PLANS[e.planId].name}
                </h3>
                <Badge tone="coral">Exemplo fictício</Badge>
              </div>
              <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
                {e.items.map((it) => {
                  const p = data.products.find((x) => x.id === it.productId);
                  if (!p) return null;
                  return (
                    <li key={it.productId} className="rounded-xl bg-sand-50 p-2">
                      <ProductArt category={p.category} className="aspect-square w-full" />
                      <p className="mt-2 text-xs font-semibold leading-snug text-abyss-900">{p.name}</p>
                      {p.featured && <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-tide-600">Produto principal</p>}
                    </li>
                  );
                })}
              </ul>
              <p className="px-5 pb-4 text-xs text-ink-muted">{MODALITIES[e.modality].label}. A próxima edição terá uma seleção diferente.</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
