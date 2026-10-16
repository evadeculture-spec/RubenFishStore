import { describe, expect, it } from 'vitest';
import { placeOrder } from '../domain/checkout';
import { renewSubscription, runDueRenewals, simulateNextRenewal } from '../domain/renewals';
import { cancel, changeFrequency, changePlan, pause, resume, setSkipNext } from '../domain/subscriptions';
import { buy, freshData } from './helpers';

describe('checkout', () => {
  it('não duplica a encomenda com a mesma chave (duplo clique)', () => {
    const d = freshData();
    const a = buy(d, { token: 'abc' });
    const customer = d.customers.find((c) => c.id === a.customerId)!;
    const again = placeOrder(d, {
      customerId: a.customerId, planId: 'explorador', mode: 'mensal', profile: customer.profile,
      address: customer.address!, paymentMethod: 'cartao-demo', subscriptionConsent: true, checkoutToken: 'abc',
    });
    expect(again.ok && again.value.duplicate).toBe(true);
    expect(d.orders).toHaveLength(1);
    expect(d.subscriptions).toHaveLength(1);
  });
  it('exige consentimento explícito para subscrição', () => {
    const d = freshData();
    const r = placeOrder(d, {
      customerId: d.customers[0].id, planId: 'essencial', mode: 'mensal', profile: d.customers[0].profile,
      address: { fullName: 'Pessoa', line1: 'Rua Fictícia 1', postalCode: '1000-001', city: 'Lisboa' },
      paymentMethod: 'pagamento-teste', subscriptionConsent: false, checkoutToken: 'x',
    });
    expect(r.ok).toBe(false);
    expect(d.orders).toHaveLength(0);
  });
  it('rejeita códigos postais fora do Continente', () => {
    const d = freshData();
    const r = placeOrder(d, {
      customerId: d.customers[0].id, planId: 'essencial', mode: 'avulsa', profile: d.customers[0].profile,
      address: { fullName: 'Pessoa', line1: 'Rua Fictícia 1', postalCode: '9000-001', city: 'Funchal' },
      paymentMethod: 'pagamento-teste', subscriptionConsent: false, checkoutToken: 'y',
    });
    expect(r.ok).toBe(false);
  });
  it('começa em "pagamento simulado confirmado" e agenda a próxima cobrança', () => {
    const d = freshData();
    const { order, subscription } = buy(d, { mode: 'bimestral' });
    expect(order.status).toBe('paid');
    expect(subscription!.nextBillingDate).toBe('2026-12-16');
  });
});

describe('renovações', () => {
  it('cria uma encomenda por ciclo e nunca duplica o mesmo ciclo', () => {
    const d = freshData();
    const { subscription } = buy(d);
    expect(renewSubscription(d, subscription!.id).ok).toBe(false); // ainda não vencida
    d.clock = '2026-11-16';
    const r1 = renewSubscription(d, subscription!.id);
    expect(r1.ok).toBe(true);
    expect(d.orders).toHaveLength(2);
    // o mesmo ciclo não pode ser renovado de novo
    const sub = d.subscriptions[0];
    sub.nextBillingDate = '2026-11-16';
    expect(renewSubscription(d, sub.id)).toMatchObject({ ok: false, error: 'Este ciclo já foi renovado.' });
    expect(d.orders).toHaveLength(2);
  });
  it('processa todos os ciclos vencidos uma única vez', () => {
    const d = freshData();
    buy(d);
    d.clock = '2027-01-20';
    expect(runDueRenewals(d)).toHaveLength(3);
    expect(runDueRenewals(d)).toHaveLength(0);
    expect(d.orders).toHaveLength(4);
    expect(d.subscriptions[0].nextBillingDate).toBe('2027-02-16');
  });
  it('alterações de plano e frequência aplicam-se ao ciclo seguinte', () => {
    const d = freshData();
    const { subscription, order } = buy(d, { planId: 'essencial' });
    changePlan(d, subscription!.id, 'premium');
    changeFrequency(d, subscription!.id, 'bimestral');
    expect(d.orders.find((o) => o.id === order.id)!.priceCents).toBe(1990);
    expect(d.subscriptions[0].nextBillingDate).toBe('2026-11-16');
    const r = simulateNextRenewal(d, d.subscriptions[0].customerId);
    expect(r.ok && r.value[0].order!.priceCents).toBe(5990);
    expect(d.subscriptions[0].nextBillingDate).toBe('2027-01-16');
  });
  it('saltar a entrega avança a data sem gerar encomenda', () => {
    const d = freshData();
    const { subscription } = buy(d);
    setSkipNext(d, subscription!.id, true);
    d.clock = '2026-11-16';
    const r = renewSubscription(d, subscription!.id);
    expect(r.ok && r.value.skipped).toBe(true);
    expect(d.orders).toHaveLength(1);
    expect(d.subscriptions[0]).toMatchObject({ nextBillingDate: '2026-12-16', skipNext: false });
  });
});

describe('pausa e cancelamento', () => {
  it('subscrição pausada não gera cobranças e retomar agenda nova data futura', () => {
    const d = freshData();
    const { subscription } = buy(d);
    expect(pause(d, subscription!.id).ok).toBe(true);
    d.clock = '2027-03-01';
    expect(renewSubscription(d, subscription!.id).ok).toBe(false);
    expect(runDueRenewals(d)).toHaveLength(0);
    expect(d.orders).toHaveLength(1);
    expect(resume(d, subscription!.id).ok).toBe(true);
    expect(d.subscriptions[0].nextBillingDate > d.clock).toBe(true);
    expect(runDueRenewals(d)).toHaveLength(0);
  });
  it('subscrição cancelada não gera cobranças nem pode ser retomada', () => {
    const d = freshData();
    const { subscription } = buy(d);
    expect(cancel(d, subscription!.id).ok).toBe(true);
    d.clock = '2027-03-01';
    expect(runDueRenewals(d)).toHaveLength(0);
    expect(resume(d, subscription!.id).ok).toBe(false);
    expect(simulateNextRenewal(d, subscription!.customerId).ok).toBe(false);
  });
});
