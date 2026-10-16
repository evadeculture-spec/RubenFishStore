import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { PLANS } from '../config/business';
import type { PlanId } from '../domain/types';
import { formatEUR } from '../utils/money';
import { cx } from '../utils/cx';
import { PlanBoxArt } from './art';
import { Badge } from './ui';

export function PlanCard({ planId, footer, selected, header }: { planId: PlanId; footer?: ReactNode; selected?: boolean; header?: ReactNode }) {
  const p = PLANS[planId];
  return (
    <article
      className={cx(
        'card relative flex h-full flex-col p-5 transition-shadow sm:p-6',
        selected && 'ring-2 ring-tide-500',
        p.highlight && !selected && 'ring-1 ring-abyss-800/20',
      )}
      aria-labelledby={`plan-${planId}`}
    >
      {header}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id={`plan-${planId}`} className="text-2xl font-semibold">{p.name}</h3>
          <p className="mt-1 text-sm text-ink-soft">{p.tagline}</p>
        </div>
        <PlanBoxArt planId={planId} className="h-16 w-20 shrink-0" />
      </div>
      {p.highlight && (
        <div className="mt-3">
          <Badge tone="tide">Equilíbrio entre variedade e preço</Badge>
        </div>
      )}
      <p className="mt-4">
        <span className="font-display text-4xl font-semibold text-abyss-900">{formatEUR(p.priceCents)}</span>
        <span className="ml-1 text-ink-soft">/ box</span>
      </p>
      <p className="mt-1 text-sm font-semibold text-ink-soft">
        {p.shippingCents === 0 ? 'Portes incluídos' : `+ ${formatEUR(p.shippingCents)} de portes`} · IVA incluído
      </p>
      <p className="mt-4 rounded-lg bg-sand-200/70 px-3 py-2 text-sm text-abyss-900">
        <strong>{p.itemsRange[0]}–{p.itemsRange[1]} artigos</strong> indicativos
        {p.featuredItems > 0 ? `, incluindo ${p.featuredItems} produto${p.featuredItems > 1 ? 's' : ''} principa${p.featuredItems > 1 ? 'is' : 'l'}` : ''}
      </p>
      <ul className="mt-4 flex-1 space-y-2 text-[15px]">
        {p.selection.map((s) => (
          <li key={s} className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-tide-600" aria-hidden />
            <span className="text-ink-soft">{s}</span>
          </li>
        ))}
      </ul>
      {footer && <div className="mt-5">{footer}</div>}
    </article>
  );
}
