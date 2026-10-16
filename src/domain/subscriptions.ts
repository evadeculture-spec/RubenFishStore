import { FREQUENCIES, MODALITIES, PLANS, SHIPPING, SUBSCRIPTION_RULES } from '../config/business';
import type { DemoData, Frequency, Modality, PlanId, Result, Subscription, SubscriptionEvent } from './types';
import { addDays, addMonths, atClock } from '../utils/dates';

export const SUBSCRIPTION_STATUS_LABEL: Record<Subscription['status'], string> = {
  active: 'Ativa',
  paused: 'Pausada',
  cancelled: 'Cancelada',
};

/** Subscrição corrente (não cancelada) do cliente, se existir. */
export function currentSubscription(d: DemoData, customerId: string): Subscription | undefined {
  return d.subscriptions.find((s) => s.customerId === customerId && s.status !== 'cancelled');
}

export function latestSubscription(d: DemoData, customerId: string): Subscription | undefined {
  const subs = d.subscriptions.filter((s) => s.customerId === customerId);
  return currentSubscription(d, customerId) ?? subs[subs.length - 1];
}

function find(d: DemoData, id: string): Result<Subscription> {
  const s = d.subscriptions.find((x) => x.id === id);
  return s ? { ok: true, value: s } : { ok: false, error: 'Subscrição não encontrada.' };
}

function log(d: DemoData, s: Subscription, type: SubscriptionEvent['type'], detail?: string) {
  s.history.push({ at: atClock(d.clock), type, detail });
}

function requireNotCancelled(s: Subscription): Result<Subscription> {
  return s.status === 'cancelled'
    ? { ok: false, error: 'Esta subscrição está cancelada. Podes iniciar uma nova a partir dos planos.' }
    : { ok: true, value: s };
}

/** Alterações de plano aplicam-se ao próximo ciclo; a encomenda já paga não muda. */
export function changePlan(d: DemoData, id: string, planId: PlanId): Result<Subscription> {
  const f = find(d, id);
  if (!f.ok) return f;
  const s = f.value;
  const c = requireNotCancelled(s);
  if (!c.ok) return c;
  if (s.planId === planId) return { ok: false, error: `O plano já é ${PLANS[planId].name}.` };
  log(d, s, 'plan_changed', `${PLANS[s.planId].name} → ${PLANS[planId].name}`);
  s.planId = planId;
  return { ok: true, value: s };
}

export function changeModality(d: DemoData, id: string, modality: Modality): Result<Subscription> {
  const f = find(d, id);
  if (!f.ok) return f;
  const s = f.value;
  const c = requireNotCancelled(s);
  if (!c.ok) return c;
  if (s.modality === modality) return { ok: false, error: `A modalidade já é ${MODALITIES[modality].label}.` };
  log(d, s, 'modality_changed', `${MODALITIES[s.modality].label} → ${MODALITIES[modality].label}`);
  s.modality = modality;
  return { ok: true, value: s };
}

/** A frequência aplica-se a partir do próximo ciclo: a próxima data de cobrança já agendada mantém-se. */
export function changeFrequency(d: DemoData, id: string, frequency: Frequency): Result<Subscription> {
  const f = find(d, id);
  if (!f.ok) return f;
  const s = f.value;
  const c = requireNotCancelled(s);
  if (!c.ok) return c;
  if (s.frequency === frequency) return { ok: false, error: `A frequência já é "${FREQUENCIES[frequency].label}".` };
  log(d, s, 'frequency_changed', `${FREQUENCIES[s.frequency].label} → ${FREQUENCIES[frequency].label}`);
  s.frequency = frequency;
  return { ok: true, value: s };
}

export function setSkipNext(d: DemoData, id: string, skip: boolean): Result<Subscription> {
  const f = find(d, id);
  if (!f.ok) return f;
  const s = f.value;
  if (s.status !== 'active') return { ok: false, error: 'Só é possível saltar entregas numa subscrição ativa.' };
  if (s.skipNext === skip) return { ok: false, error: skip ? 'A próxima entrega já está marcada para saltar.' : 'A próxima entrega não está marcada para saltar.' };
  s.skipNext = skip;
  log(d, s, skip ? 'skip_requested' : 'skip_cancelled', s.nextBillingDate);
  return { ok: true, value: s };
}

export function pause(d: DemoData, id: string): Result<Subscription> {
  const f = find(d, id);
  if (!f.ok) return f;
  const s = f.value;
  if (s.status !== 'active') return { ok: false, error: 'Só é possível pausar uma subscrição ativa.' };
  s.status = 'paused';
  s.pausedAt = atClock(d.clock);
  s.skipNext = false;
  log(d, s, 'paused');
  return { ok: true, value: s };
}

/** Retomar agenda uma nova data futura de cobrança, a partir do relógio atual. */
export function resume(d: DemoData, id: string): Result<Subscription> {
  const f = find(d, id);
  if (!f.ok) return f;
  const s = f.value;
  if (s.status !== 'paused') return { ok: false, error: 'Só é possível retomar uma subscrição pausada.' };
  s.status = 'active';
  s.pausedAt = undefined;
  s.nextBillingDate = addDays(d.clock, SUBSCRIPTION_RULES.resumeDelayDays);
  log(d, s, 'resumed', s.nextBillingDate);
  return { ok: true, value: s };
}

/** Cancelar não apaga histórico, progresso nem recompensas já conquistadas. */
export function cancel(d: DemoData, id: string): Result<Subscription> {
  const f = find(d, id);
  if (!f.ok) return f;
  const s = f.value;
  if (s.status === 'cancelled') return { ok: false, error: 'A subscrição já está cancelada.' };
  s.status = 'cancelled';
  s.cancelledAt = atClock(d.clock);
  s.skipNext = false;
  log(d, s, 'cancelled');
  return { ok: true, value: s };
}

/** Data indicativa da próxima box (expedição) para uma subscrição ativa. */
export function nextBoxShipDate(s: Subscription): string | undefined {
  const billing = nextChargedBillingDate(s);
  return billing ? addDays(billing, SHIPPING.daysToShip) : undefined;
}

/** Próxima cobrança simulada efetiva (considera uma entrega saltada). */
export function nextChargedBillingDate(s: Subscription): string | undefined {
  if (s.status !== 'active') return undefined;
  return s.skipNext ? addMonths(s.nextBillingDate, FREQUENCIES[s.frequency].months) : s.nextBillingDate;
}
