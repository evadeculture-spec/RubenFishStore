import { FREQUENCIES } from '../config/business';
import { placeOrder } from '../domain/checkout';
import { nextId } from '../domain/ids';
import { milestoneState, MILESTONES } from '../domain/loyalty';
import { advanceToDelivered, nextStatus, transitionOrder } from '../domain/orders';
import { renewSubscription } from '../domain/renewals';
import { compatibleRewardItems, reserveReward, rewardStock } from '../domain/rewards';
import { cancel, pause } from '../domain/subscriptions';
import type {
  Address,
  Customer,
  DemoData,
  ExperienceLevel,
  Modality,
  OrderStatus,
  PlanId,
  PurchaseMode,
} from '../domain/types';
import { addDays, addMonths, atClock } from '../utils/dates';

export interface HistoryOptions {
  name: string;
  email: string;
  modality: Modality;
  experience?: ExperienceLevel;
  planId: PlanId;
  mode: PurchaseMode;
  /** Número de caixas já entregues (elegíveis). */
  deliveries: number;
  /** Encomenda adicional em curso, no estado indicado. */
  openOrder?: Exclude<OrderStatus, 'delivered'>;
  finalStatus?: 'active' | 'paused' | 'cancelled';
  /** Escolhe automaticamente a recompensa de cada marco desbloqueado. */
  autoRedeem?: boolean;
  city?: string;
  scenario?: string;
}

function fictitiousAddress(name: string, city = 'Lisboa'): Address {
  const postal: Record<string, string> = {
    Lisboa: '1100-001',
    Porto: '4000-001',
    Peniche: '2520-001',
    Sines: '7520-001',
    Aveiro: '3800-001',
    Faro: '8000-001',
  };
  return { fullName: name, line1: 'Rua Fictícia do Exemplo, 12, 1.º Esq.', postalCode: postal[city] ?? '1000-001', city };
}

export function createCustomer(
  d: DemoData,
  name: string,
  email: string,
  modality: Modality,
  experience: ExperienceLevel = 'iniciante',
  scenario?: string,
  city?: string,
): Customer {
  const customer: Customer = {
    id: nextId(d, 'cus'),
    name,
    email,
    createdAt: atClock(d.clock),
    profile: { modality, experience, preferredCategories: [], avoidCategories: [] },
    address: fictitiousAddress(name, city),
    scenario,
  };
  d.customers.push(customer);
  return customer;
}

function autoRedeemAvailable(d: DemoData, customerId: string) {
  for (const m of MILESTONES) {
    if (milestoneState(d, customerId, m.level) !== 'available') continue;
    const item = compatibleRewardItems(d, customerId, m.level).find((i) => rewardStock(d, i.id).available > 0);
    if (item) reserveReward(d, customerId, m.level, item.id);
  }
}

/**
 * Constrói um histórico coerente usando as mesmas regras de negócio da aplicação
 * (checkout, renovações, transições, progresso e recompensas), recuando o relógio temporariamente.
 */
export function buildCustomerHistory(d: DemoData, o: HistoryOptions): Customer {
  const saved = d.clock;
  const months = o.mode === 'avulsa' ? 1 : FREQUENCIES[o.mode].months;
  const cycles = o.deliveries + (o.openOrder ? 1 : 0);
  const firstDate = o.openOrder
    ? addDays(addMonths(saved, -months * (cycles - 1)), -2)
    : addDays(addMonths(saved, -months * cycles), 5);

  d.clock = cycles > 0 ? firstDate : saved;
  const customer = createCustomer(d, o.name, o.email, o.modality, o.experience, o.scenario, o.city);
  let subscriptionId: string | undefined;

  for (let i = 0; i < cycles; i++) {
    let orderId: string;
    if (i === 0 || o.mode === 'avulsa') {
      if (i > 0) d.clock = addMonths(firstDate, months * i);
      const r = placeOrder(d, {
        customerId: customer.id,
        planId: o.planId,
        mode: o.mode,
        profile: customer.profile,
        address: customer.address!,
        paymentMethod: 'cartao-demo',
        subscriptionConsent: true,
        checkoutToken: `seed-${customer.id}-${i}`,
      });
      if (!r.ok) throw new Error(r.error);
      orderId = r.value.order.id;
      subscriptionId = r.value.subscription?.id ?? subscriptionId;
    } else {
      const sub = d.subscriptions.find((s) => s.id === subscriptionId)!;
      d.clock = sub.nextBillingDate;
      const r = renewSubscription(d, sub.id);
      if (!r.ok || !r.value.order) throw new Error(r.ok ? 'Renovação sem encomenda' : r.error);
      orderId = r.value.order.id;
    }

    if (i < o.deliveries) {
      d.clock = addDays(d.clock, 3);
      const r = advanceToDelivered(d, orderId);
      if (!r.ok) throw new Error(r.error);
      if (o.autoRedeem) autoRedeemAvailable(d, customer.id);
    } else if (o.openOrder) {
      const order = d.orders.find((x) => x.id === orderId)!;
      while (order.status !== o.openOrder) {
        const r = transitionOrder(d, orderId, nextStatus(order.status)!);
        if (!r.ok) throw new Error(r.error);
      }
    }
  }

  d.clock = saved;
  if (subscriptionId && o.finalStatus === 'paused') pause(d, subscriptionId);
  if (subscriptionId && o.finalStatus === 'cancelled') cancel(d, subscriptionId);

  for (const e of d.progressEvents) {
    if (e.customerId === customer.id && e.type === 'milestone_unlocked') d.seenCelebrations.push(e.id);
  }
  return customer;
}

export type ScenarioKey = 'new' | 'boxes-2' | 'boxes-5' | 'boxes-11';

export const SCENARIOS: Record<ScenarioKey, { label: string; description: string; deliveries: number }> = {
  new: { label: 'Cliente novo', description: 'Sem encomendas nem subscrição.', deliveries: 0 },
  'boxes-2': { label: 'Cliente com 2 caixas elegíveis', description: 'A 1 box do nível 1.', deliveries: 2 },
  'boxes-5': { label: 'Cliente com 5 caixas elegíveis', description: 'Nível 1 recebido; a 1 box do nível 2.', deliveries: 5 },
  'boxes-11': { label: 'Cliente com 11 caixas elegíveis', description: 'Níveis 1 e 2 recebidos; a 1 box do nível 3.', deliveries: 11 },
};

/** Carrega um cenário e torna-o o cliente ativo da vista de cliente. */
export function loadScenario(d: DemoData, key: ScenarioKey, modality: Modality): Customer {
  const s = SCENARIOS[key];
  const n = d.customers.filter((c) => c.scenario).length + 1;
  const name = key === 'new' ? `Cliente novo ${n} (fictício)` : `Cliente cenário ${n} (fictício)`;
  const email = `cenario${n}@exemplo.pt`;
  const customer =
    key === 'new'
      ? createCustomer(d, name, email, modality, 'iniciante', key)
      : buildCustomerHistory(d, {
          name,
          email,
          modality,
          experience: 'intermedio',
          planId: 'explorador',
          mode: 'mensal',
          deliveries: s.deliveries,
          autoRedeem: true,
          scenario: key,
        });
  if (key === 'new') customer.address = undefined;
  d.activeCustomerId = customer.id;
  return customer;
}
