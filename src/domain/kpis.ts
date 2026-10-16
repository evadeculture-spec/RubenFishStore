import { PLAN_ORDER } from '../config/business';
import { simulatedMRRCents } from './pricing';
import { rewardStock } from './rewards';
import type { DemoData, OrderStatus, PlanId } from './types';
import { monthKey } from '../utils/dates';

export interface AdminOverview {
  activeCustomers: number;
  activeSubscriptionsByPlan: Record<PlanId, number>;
  activeSubscriptions: number;
  mrrCents: number;
  ordersThisMonth: number;
  ordersByStatus: Record<OrderStatus, number>;
  paused: number;
  cancelled: number;
  rewardsAvailable: number;
  rewardsReserved: number;
  pendingRenewals: number;
}

/** Indicadores derivados exclusivamente dos mesmos dados que alimentam as listas. */
export function adminOverview(d: DemoData): AdminOverview {
  const byPlan = Object.fromEntries(PLAN_ORDER.map((p) => [p, 0])) as Record<PlanId, number>;
  const active = d.subscriptions.filter((s) => s.status === 'active');
  for (const s of active) byPlan[s.planId] += 1;
  const month = monthKey(d.clock);
  const ordersByStatus: Record<OrderStatus, number> = { paid: 0, preparing: 0, shipped: 0, delivered: 0 };
  for (const o of d.orders) ordersByStatus[o.status] += 1;
  let available = 0;
  let reserved = 0;
  for (const item of d.rewardItems) {
    const s = rewardStock(d, item.id);
    available += s.available;
    reserved += s.reserved;
  }
  return {
    activeCustomers: new Set(active.map((s) => s.customerId)).size,
    activeSubscriptionsByPlan: byPlan,
    activeSubscriptions: active.length,
    mrrCents: simulatedMRRCents(d.subscriptions),
    ordersThisMonth: d.orders.filter((o) => monthKey(o.createdAt) === month).length,
    ordersByStatus,
    paused: d.subscriptions.filter((s) => s.status === 'paused').length,
    cancelled: d.subscriptions.filter((s) => s.status === 'cancelled').length,
    rewardsAvailable: available,
    rewardsReserved: reserved,
    pendingRenewals: active.filter((s) => s.nextBillingDate <= d.clock).length,
  };
}
