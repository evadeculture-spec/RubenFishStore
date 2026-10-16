import { placeOrder } from '../domain/checkout';
import type { DemoData, Modality, PlanId, PurchaseMode } from '../domain/types';
import { createBaseData } from '../data/seed';
import { createCustomer } from '../data/scenarios';

export function freshData(): DemoData {
  return createBaseData('2026-10-16');
}

export function buy(d: DemoData, opts: { planId?: PlanId; mode?: PurchaseMode; modality?: Modality; customerId?: string; token?: string } = {}) {
  const customerId = opts.customerId ?? createCustomer(d, 'Teste', 't@exemplo.pt', opts.modality ?? 'spinning-mar').id;
  const customer = d.customers.find((c) => c.id === customerId)!;
  const r = placeOrder(d, {
    customerId,
    planId: opts.planId ?? 'explorador',
    mode: opts.mode ?? 'mensal',
    profile: { ...customer.profile, modality: opts.modality ?? customer.profile.modality },
    address: { fullName: 'Pessoa Teste', line1: 'Rua Fictícia, 1', postalCode: '1000-001', city: 'Lisboa' },
    paymentMethod: 'cartao-demo',
    subscriptionConsent: true,
    checkoutToken: opts.token ?? `tok-${d.idSequence}-${Math.random()}`,
  });
  if (!r.ok) throw new Error(r.error);
  return { customerId, ...r.value };
}
