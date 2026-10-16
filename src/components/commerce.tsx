import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, CircleCheck, CircleDot, Circle, Gift, Lock, PackageCheck, Truck, Package, Clock3 } from 'lucide-react';
import { FREQUENCIES, LOYALTY, PLANS } from '../config/business';
import { ORDER_FLOW, ORDER_STATUS_LABEL, statusDate } from '../domain/orders';
import { quote } from '../domain/pricing';
import type { MilestoneState } from '../domain/loyalty';
import type { Order, OrderStatus, PlanId, PurchaseMode, RewardMilestone } from '../domain/types';
import { formatEUR } from '../utils/money';
import { formatShortDate } from '../utils/dates';
import { cx } from '../utils/cx';
import { Badge } from './ui';
import { PlanBoxArt } from './art';

const statusIcon: Record<OrderStatus, typeof Clock3> = { paid: CircleCheck, preparing: Package, shipped: Truck, delivered: PackageCheck };

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const Icon = statusIcon[status];
  const tone = status === 'delivered' ? 'tide' : status === 'shipped' ? 'dark' : 'neutral';
  return (
    <Badge tone={tone}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {ORDER_STATUS_LABEL[status]}
    </Badge>
  );
}

export function OrderTimeline({ order }: { order: Order }) {
  const current = ORDER_FLOW.indexOf(order.status);
  return (
    <ol className="grid gap-3 sm:grid-cols-4">
      {ORDER_FLOW.map((s, i) => {
        const done = i <= current;
        const at = statusDate(order, s);
        const Icon = done ? CircleCheck : i === current + 1 ? CircleDot : Circle;
        return (
          <li key={s} className={cx('flex items-start gap-2 rounded-xl border p-3', done ? 'border-tide-200 bg-tide-50' : 'border-sand-300 bg-white')}>
            <Icon className={cx('mt-0.5 h-5 w-5 shrink-0', done ? 'text-tide-600' : 'text-ink-muted')} aria-hidden />
            <div className="text-sm">
              <p className="font-semibold text-abyss-900">{ORDER_STATUS_LABEL[s]}</p>
              <p className="text-ink-muted">{done ? (at ? formatShortDate(at) : 'Concluído') : 'Pendente'}</p>
              <span className="sr-only">{done ? 'Etapa concluída' : 'Etapa pendente'}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function PriceSummary({ planId, mode, className }: { planId: PlanId; mode: PurchaseMode; className?: string }) {
  const q = quote(planId, mode);
  return (
    <dl className={cx('space-y-2 text-[15px]', className)}>
      <div className="flex justify-between gap-4">
        <dt className="text-ink-soft">Box {PLANS[planId].name}</dt>
        <dd className="font-semibold">{formatEUR(q.priceCents)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-ink-soft">Portes (Portugal Continental)</dt>
        <dd className="font-semibold">{q.shippingCents === 0 ? 'Incluídos' : formatEUR(q.shippingCents)}</dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-sand-300 pt-2 text-base">
        <dt className="font-bold text-abyss-900">Total {mode === 'avulsa' ? 'da compra' : 'por box'}</dt>
        <dd className="font-display text-xl font-semibold text-abyss-900">{formatEUR(q.totalCents)}</dd>
      </div>
      <p className="text-sm text-ink-muted">
        {mode === 'avulsa'
          ? 'Compra única, sem renovação.'
          : `Renovação recorrente ${FREQUENCIES[mode].short} (${formatEUR(q.totalCents)} por box). Podes pausar ou cancelar quando quiseres.`}{' '}
        IVA incluído.
      </p>
    </dl>
  );
}

export function PlanSummaryLine({ planId }: { planId: PlanId }) {
  const p = PLANS[planId];
  return (
    <div className="flex items-center gap-3">
      <PlanBoxArt planId={planId} className="h-12 w-14 shrink-0" />
      <div>
        <p className="font-semibold text-abyss-900">Box {p.name}</p>
        <p className="text-sm text-ink-muted">
          {p.itemsRange[0]}–{p.itemsRange[1]} artigos indicativos
          {p.featuredItems > 0 && ` · ${p.featuredItems} produto${p.featuredItems > 1 ? 's' : ''} principa${p.featuredItems > 1 ? 'is' : 'l'}`}
        </p>
      </div>
    </div>
  );
}

const stateLabel: Record<MilestoneState, string> = {
  locked: 'Bloqueada',
  available: 'Disponível',
  reserved: 'Reservada',
  shipped: 'A caminho',
  received: 'Recebida',
};

export function MilestoneStateBadge({ state }: { state: MilestoneState }) {
  const tone = state === 'locked' ? 'sand' : state === 'available' ? 'coral' : state === 'received' ? 'tide' : 'dark';
  const Icon = state === 'locked' ? Lock : state === 'received' ? Check : Gift;
  return (
    <Badge tone={tone}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {stateLabel[state]}
    </Badge>
  );
}

/** Linha de marcos (3, 6, 12) com a contagem de caixas elegíveis. */
export function MilestoneTrack({ count, states }: { count: number; states?: Partial<Record<1 | 2 | 3, MilestoneState>> }) {
  const max = LOYALTY.milestones[LOYALTY.milestones.length - 1].boxes;
  return (
    <div>
      <div className="relative mx-2 mb-2 mt-8 h-2 rounded-full bg-abyss-800/10" aria-hidden>
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-tide-500 to-tide-300 transition-[width] duration-500" style={{ width: `${Math.min(1, count / max) * 100}%` }} />
        {LOYALTY.milestones.map((m) => {
          const reached = count >= m.boxes;
          return (
            <div key={m.level} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${(m.boxes / max) * 100}%` }}>
              <div className={cx('grid h-7 w-7 place-items-center rounded-full border-2 text-xs font-bold', reached ? 'border-tide-600 bg-tide-600 text-white' : 'border-abyss-800/25 bg-white text-ink-soft')}>
                {reached ? <Check className="h-4 w-4" /> : m.boxes}
              </div>
            </div>
          );
        })}
      </div>
      <ul className="mt-5 grid gap-2 sm:grid-cols-3">
        {LOYALTY.milestones.map((m) => (
          <MilestoneCard key={m.level} m={m} state={states?.[m.level] ?? (count >= m.boxes ? 'available' : 'locked')} showState={Boolean(states)} />
        ))}
      </ul>
    </div>
  );
}

function MilestoneCard({ m, state, showState }: { m: RewardMilestone; state: MilestoneState; showState: boolean }) {
  return (
    <li className={cx('rounded-xl border p-3', state === 'locked' ? 'border-sand-300 bg-white' : 'border-tide-200 bg-tide-50/70')}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-abyss-900">{m.title} · {m.boxes} boxes</p>
        {showState && <MilestoneStateBadge state={state} />}
      </div>
      <p className="mt-0.5 text-sm text-ink-soft">{m.summary}</p>
    </li>
  );
}

export function KeyValue({ items }: { items: [ReactNode, ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
      {items.map(([k, v], i) => (
        <div key={i}>
          <dt className="text-ink-muted">{k}</dt>
          <dd className="font-semibold text-abyss-900">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-tide-600 hover:underline">
      ← {children}
    </Link>
  );
}
