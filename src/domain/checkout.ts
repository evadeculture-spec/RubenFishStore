import { FREQUENCIES } from '../config/business';
import { nextId, nextOrderNumber } from './ids';
import { quote } from './pricing';
import { currentSubscription } from './subscriptions';
import type {
  Address,
  DemoData,
  FishingProfile,
  Order,
  PaymentMethod,
  PlanId,
  PurchaseMode,
  Result,
  Subscription,
} from './types';
import { addMonths, atClock } from '../utils/dates';

export interface CheckoutInput {
  customerId: string;
  planId: PlanId;
  mode: PurchaseMode;
  profile: FishingProfile;
  address: Address;
  paymentMethod: PaymentMethod | null;
  subscriptionConsent: boolean;
  /** Chave única da sessão de checkout, para evitar encomendas duplicadas. */
  checkoutToken: string;
}

export type AddressErrors = Partial<Record<keyof Address, string>>;

/** Código postal de Portugal Continental: NNNN-NNN, começando entre 1 e 8 (9xxx = Regiões Autónomas). */
export function validatePostalCode(code: string): string | undefined {
  const v = code.trim();
  if (!v) return 'Indica o código postal.';
  if (!/^\d{4}-\d{3}$/.test(v)) return 'Usa o formato 0000-000.';
  if (!/^[1-8]/.test(v)) return 'Nesta fase só entregamos em Portugal Continental.';
  return undefined;
}

export function validateAddress(a: Address): AddressErrors {
  const e: AddressErrors = {};
  if (a.fullName.trim().length < 3) e.fullName = 'Indica um nome (fictício) com pelo menos 3 caracteres.';
  if (a.line1.trim().length < 5) e.line1 = 'Indica uma morada (fictícia).';
  const pc = validatePostalCode(a.postalCode);
  if (pc) e.postalCode = pc;
  if (a.city.trim().length < 2) e.city = 'Indica a localidade.';
  return e;
}

export interface PlacedOrder {
  order: Order;
  subscription?: Subscription;
  duplicate: boolean;
}

export function placeOrder(d: DemoData, input: CheckoutInput): Result<PlacedOrder> {
  const existing = d.orders.find((o) => o.checkoutToken === input.checkoutToken);
  if (existing) {
    const subscription = d.subscriptions.find((s) => s.id === existing.subscriptionId);
    return { ok: true, value: { order: existing, subscription, duplicate: true } };
  }
  const customer = d.customers.find((c) => c.id === input.customerId);
  if (!customer) return { ok: false, error: 'Cliente de demonstração não encontrado.' };
  if (Object.keys(validateAddress(input.address)).length > 0) {
    return { ok: false, error: 'Revê os dados da morada fictícia.' };
  }
  if (!input.paymentMethod) return { ok: false, error: 'Escolhe um método de pagamento simulado.' };
  const recurring = input.mode !== 'avulsa';
  if (recurring && !input.subscriptionConsent) {
    return { ok: false, error: 'Confirma que aceitas a renovação recorrente simulada.' };
  }
  if (recurring && currentSubscription(d, customer.id)) {
    return {
      ok: false,
      error: 'Já tens uma subscrição. Podes alterá-la em "A minha subscrição" ou comprar uma caixa avulsa.',
    };
  }

  customer.profile = { ...input.profile };
  customer.address = { ...input.address };
  customer.name = input.address.fullName.trim();

  const now = atClock(d.clock);
  const q = quote(input.planId, input.mode);
  let subscription: Subscription | undefined;
  if (input.mode !== 'avulsa') {
    subscription = {
      id: nextId(d, 'sub'),
      customerId: customer.id,
      planId: input.planId,
      modality: input.profile.modality,
      frequency: input.mode,
      status: 'active',
      startedAt: now,
      nextBillingDate: addMonths(d.clock, FREQUENCIES[input.mode].months),
      skipNext: false,
      history: [{ at: now, type: 'created' }],
    };
    d.subscriptions.push(subscription);
  }

  const order: Order = {
    id: nextId(d, 'ord'),
    number: nextOrderNumber(d),
    customerId: customer.id,
    kind: subscription ? 'subscription' : 'single',
    subscriptionId: subscription?.id,
    cycleKey: subscription ? `${subscription.id}:${d.clock}` : undefined,
    checkoutToken: input.checkoutToken,
    planId: input.planId,
    modality: input.profile.modality,
    frequency: subscription?.frequency,
    priceCents: q.priceCents,
    shippingCents: q.shippingCents,
    totalCents: q.totalCents,
    status: 'paid',
    statusHistory: [{ status: 'paid', at: now }],
    createdAt: now,
    shippingAddress: { ...input.address },
    paymentMethod: input.paymentMethod,
  };
  d.orders.push(order);
  return { ok: true, value: { order, subscription, duplicate: false } };
}
