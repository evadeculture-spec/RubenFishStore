import { FREQUENCIES } from '../config/business';
import { nextId, nextOrderNumber } from './ids';
import { quote } from './pricing';
import type { DemoData, Order, Result, Subscription } from './types';
import { addMonths, atClock } from '../utils/dates';

export interface RenewalOutcome {
  subscription: Subscription;
  /** Ausente quando o ciclo foi saltado. */
  order?: Order;
  skipped: boolean;
  cycleDate: string;
}

const FALLBACK_ADDRESS = {
  fullName: 'Cliente de demonstração',
  line1: 'Rua Fictícia do Exemplo, 1',
  postalCode: '1000-001',
  city: 'Lisboa',
};

/**
 * Processa o ciclo de cobrança vencido de uma subscrição.
 * - Só subscrições ativas geram cobranças simuladas.
 * - Cada ciclo é identificado por `cycleKey` e nunca gera duas encomendas.
 * - Um ciclo marcado para saltar avança a data sem gerar encomenda.
 */
export function renewSubscription(d: DemoData, subscriptionId: string): Result<RenewalOutcome> {
  const s = d.subscriptions.find((x) => x.id === subscriptionId);
  if (!s) return { ok: false, error: 'Subscrição não encontrada.' };
  if (s.status === 'paused') return { ok: false, error: 'A subscrição está pausada: não há cobranças simuladas.' };
  if (s.status === 'cancelled') return { ok: false, error: 'A subscrição está cancelada: não há cobranças simuladas.' };
  if (s.nextBillingDate > d.clock) {
    return { ok: false, error: 'A próxima cobrança ainda não está vencida no relógio de demonstração.' };
  }
  const cycleDate = s.nextBillingDate;
  const cycleKey = `${s.id}:${cycleDate}`;
  if (d.orders.some((o) => o.cycleKey === cycleKey)) {
    return { ok: false, error: 'Este ciclo já foi renovado.' };
  }
  const months = FREQUENCIES[s.frequency].months;
  const at = atClock(d.clock);

  if (s.skipNext) {
    s.skipNext = false;
    s.nextBillingDate = addMonths(cycleDate, months);
    s.history.push({ at, type: 'skipped', detail: cycleDate });
    return { ok: true, value: { subscription: s, skipped: true, cycleDate } };
  }

  const customer = d.customers.find((c) => c.id === s.customerId);
  const q = quote(s.planId, s.frequency);
  const order: Order = {
    id: nextId(d, 'ord'),
    number: nextOrderNumber(d),
    customerId: s.customerId,
    kind: 'subscription',
    subscriptionId: s.id,
    cycleKey,
    planId: s.planId,
    modality: s.modality,
    frequency: s.frequency,
    priceCents: q.priceCents,
    shippingCents: q.shippingCents,
    totalCents: q.totalCents,
    status: 'paid',
    statusHistory: [{ status: 'paid', at }],
    createdAt: at,
    shippingAddress: customer?.address ?? FALLBACK_ADDRESS,
    paymentMethod: 'pagamento-teste',
  };
  d.orders.push(order);
  s.nextBillingDate = addMonths(cycleDate, months);
  s.history.push({ at, type: 'renewed', detail: order.number });
  return { ok: true, value: { subscription: s, order, skipped: false, cycleDate } };
}

/** Processa todos os ciclos vencidos de todas as subscrições ativas (limite de segurança por subscrição). */
export function runDueRenewals(d: DemoData): RenewalOutcome[] {
  const out: RenewalOutcome[] = [];
  for (const s of d.subscriptions) {
    for (let i = 0; i < 24 && s.status === 'active' && s.nextBillingDate <= d.clock; i++) {
      const r = renewSubscription(d, s.id);
      if (!r.ok) break;
      out.push(r.value);
    }
  }
  return out;
}

/**
 * Simulador: avança o relógio até à próxima cobrança do cliente (se necessário) e renova esse ciclo.
 * Um ciclo saltado é processado e a renovação seguinte é efetuada, para gerar sempre uma encomenda.
 */
export function simulateNextRenewal(d: DemoData, customerId: string): Result<RenewalOutcome[]> {
  const s = d.subscriptions.find((x) => x.customerId === customerId && x.status !== 'cancelled');
  if (!s) return { ok: false, error: 'Este cliente não tem uma subscrição ativa.' };
  if (s.status === 'paused') return { ok: false, error: 'A subscrição está pausada: retoma-a para simular renovações.' };
  const outcomes: RenewalOutcome[] = [];
  for (let i = 0; i < 2; i++) {
    if (s.nextBillingDate > d.clock) d.clock = s.nextBillingDate;
    const r = renewSubscription(d, s.id);
    if (!r.ok) return r;
    outcomes.push(r.value);
    if (!r.value.skipped) break;
  }
  return { ok: true, value: outcomes };
}
