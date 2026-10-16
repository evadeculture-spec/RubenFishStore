import { FREQUENCIES, PLANS } from '../config/business';
import type { Frequency, PlanId, PurchaseMode, Subscription } from './types';

export interface PriceQuote {
  planId: PlanId;
  mode: PurchaseMode;
  priceCents: number;
  shippingCents: number;
  totalCents: number;
  recurring: boolean;
}

/** Preço por caixa. Sem descontos por frequência nesta versão. */
export function quote(planId: PlanId, mode: PurchaseMode): PriceQuote {
  const plan = PLANS[planId];
  const priceCents = plan.priceCents;
  const shippingCents = plan.shippingCents;
  return {
    planId,
    mode,
    priceCents,
    shippingCents,
    totalCents: priceCents + shippingCents,
    recurring: mode !== 'avulsa',
  };
}

/** Receita recorrente mensal equivalente de uma subscrição (sem portes, IVA incluído). */
export function monthlyEquivalentCents(planId: PlanId, frequency: Frequency): number {
  return PLANS[planId].priceCents / FREQUENCIES[frequency].months;
}

/**
 * MRR simulado: soma das subscrições ativas, normalizada ao mês.
 * Exclui pausadas, canceladas e compras avulsas (que não são subscrições).
 */
export function simulatedMRRCents(subscriptions: Subscription[]): number {
  const total = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + monthlyEquivalentCents(s.planId, s.frequency), 0);
  return Math.round(total);
}
