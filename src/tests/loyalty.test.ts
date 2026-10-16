import { describe, expect, it } from 'vitest';
import { countEligibleBoxes, milestoneState, progressSummary, recordDelivery } from '../domain/loyalty';
import { advanceToDelivered, transitionOrder } from '../domain/orders';
import { simulateNextRenewal } from '../domain/renewals';
import { reserveReward, rewardStock } from '../domain/rewards';
import { cancel, pause } from '../domain/subscriptions';
import { buildCustomerHistory, loadScenario } from '../data/scenarios';
import { createSeedData } from '../data/seed';
import { buy, freshData } from './helpers';

function deliverN(n: number, mode: 'mensal' | 'avulsa' = 'mensal') {
  const d = freshData();
  const first = buy(d, { mode });
  advanceToDelivered(d, first.order.id);
  for (let i = 1; i < n; i++) {
    const id =
      mode === 'avulsa'
        ? buy(d, { mode, customerId: first.customerId }).order.id
        : (() => { const r = simulateNextRenewal(d, first.customerId); if (!r.ok) throw new Error(r.error); return r.value[0].order!.id; })();
    advanceToDelivered(d, id);
  }
  return { d, customerId: first.customerId };
}

describe('contagem de caixas elegíveis', () => {
  it('só conta encomendas entregues, uma única vez', () => {
    const d = freshData();
    const { order, customerId } = buy(d);
    transitionOrder(d, order.id, 'preparing');
    transitionOrder(d, order.id, 'shipped');
    expect(countEligibleBoxes(d.progressEvents, customerId)).toBe(0);
    transitionOrder(d, order.id, 'delivered');
    expect(countEligibleBoxes(d.progressEvents, customerId)).toBe(1);
    // registo repetido não volta a contar
    recordDelivery(d, d.orders[0]);
    expect(countEligibleBoxes(d.progressEvents, customerId)).toBe(1);
  });
  it('impede transições repetidas e saltos de estado', () => {
    const d = freshData();
    const { order } = buy(d);
    expect(transitionOrder(d, order.id, 'delivered').ok).toBe(false);
    expect(transitionOrder(d, order.id, 'shipped').ok).toBe(false);
    expect(transitionOrder(d, order.id, 'preparing').ok).toBe(true);
    expect(transitionOrder(d, order.id, 'preparing').ok).toBe(false);
  });
  it('conteúdo só é atribuído na expedição', () => {
    const d = freshData();
    const { order } = buy(d);
    transitionOrder(d, order.id, 'preparing');
    expect(d.orders[0].contents).toBeUndefined();
    transitionOrder(d, order.id, 'shipped');
    expect(d.orders[0].contents!.length).toBeGreaterThan(0);
  });
  it('compras avulsas também contam', () => {
    const { d, customerId } = deliverN(3, 'avulsa');
    expect(countEligibleBoxes(d.progressEvents, customerId)).toBe(3);
    expect(milestoneState(d, customerId, 1)).toBe('available');
  });
});

describe('marcos 3, 6 e 12', () => {
  it('desbloqueia exatamente nos marcos e cada marco uma vez', () => {
    const { d, customerId } = deliverN(2);
    expect(milestoneState(d, customerId, 1)).toBe('locked');
    expect(progressSummary(d, customerId).message).toBe('Falta 1 box para desbloqueares a próxima recompensa.');

    const r3 = simulateNextRenewal(d, customerId);
    const out3 = r3.ok ? advanceToDelivered(d, r3.value[0].order!.id) : null;
    expect(out3?.ok && out3.value.unlocked).toEqual([1]);

    for (let i = 4; i <= 12; i++) {
      const r = simulateNextRenewal(d, customerId);
      if (!r.ok) throw new Error(r.error);
      const out = advanceToDelivered(d, r.value[0].order!.id);
      if (!out.ok) throw new Error(out.error);
      if (i === 6) expect(out.value.unlocked).toEqual([2]);
      else if (i === 12) expect(out.value.unlocked).toEqual([3]);
      else expect(out.value.unlocked).toEqual([]);
    }
    const unlocks = d.progressEvents.filter((e) => e.type === 'milestone_unlocked');
    expect(unlocks.map((e) => (e.type === 'milestone_unlocked' ? e.level : 0))).toEqual([1, 2, 3]);
  });
  it('pausar ou cancelar não apaga progresso nem recompensas', () => {
    const { d, customerId } = deliverN(3);
    const sub = d.subscriptions[0];
    pause(d, sub.id);
    expect(countEligibleBoxes(d.progressEvents, customerId)).toBe(3);
    cancel(d, sub.id);
    expect(countEligibleBoxes(d.progressEvents, customerId)).toBe(3);
    expect(milestoneState(d, customerId, 1)).toBe('available');
  });
});

describe('resgate e stock de recompensas', () => {
  it('resgate único, reserva reduz stock disponível e segue com a próxima caixa', () => {
    const { d, customerId } = deliverN(3);
    const before = rewardStock(d, 'rw1-cutter');
    const r = reserveReward(d, customerId, 1, 'rw1-cutter');
    expect(r.ok).toBe(true);
    const after = rewardStock(d, 'rw1-cutter');
    expect(after.reserved).toBe(before.reserved + 1);
    expect(after.available).toBe(before.available - 1);
    expect(after.stock).toBe(before.stock);

    // segundo resgate do mesmo nível é recusado
    expect(reserveReward(d, customerId, 1, 'rw1-snaps').ok).toBe(false);
    expect(d.redemptions).toHaveLength(1);

    // expedição associa a recompensa à encomenda e retira do stock físico
    const next = simulateNextRenewal(d, customerId);
    const orderId = next.ok ? next.value[0].order!.id : '';
    transitionOrder(d, orderId, 'preparing');
    transitionOrder(d, orderId, 'shipped');
    expect(d.redemptions[0]).toMatchObject({ status: 'shipped', orderId });
    expect(rewardStock(d, 'rw1-cutter')).toEqual({ stock: before.stock - 1, reserved: 0, available: before.stock - 1 });
    transitionOrder(d, orderId, 'delivered');
    expect(d.redemptions[0].status).toBe('received');
    expect(milestoneState(d, customerId, 1)).toBe('received');
  });
  it('recusa marcos bloqueados, produtos incompatíveis e stock esgotado', () => {
    const { d, customerId } = deliverN(3);
    expect(reserveReward(d, customerId, 2, 'rw2-rock').ok).toBe(false);
    expect(reserveReward(d, customerId, 1, 'rw1-lights').ok).toBe(false); // surfcasting
    d.rewardItems.find((i) => i.id === 'rw1-cutter')!.stock = 0;
    expect(reserveReward(d, customerId, 1, 'rw1-cutter').ok).toBe(false);
  });
  it('sem próxima caixa, a recompensa mantém-se disponível', () => {
    const { d, customerId } = deliverN(3);
    cancel(d, d.subscriptions[0].id);
    const r = reserveReward(d, customerId, 1, 'rw1-cutter');
    expect(r.ok).toBe(false);
    expect(milestoneState(d, customerId, 1)).toBe('available');
    buy(d, { mode: 'avulsa', customerId });
    expect(reserveReward(d, customerId, 1, 'rw1-cutter').ok).toBe(true);
  });
});

describe('cenários e dados iniciais', () => {
  it('cenários 2, 5 e 11 ficam a uma box do marco seguinte', () => {
    const d = freshData();
    for (const [key, level] of [['boxes-2', 1], ['boxes-5', 2], ['boxes-11', 3]] as const) {
      const c = loadScenario(d, key, 'surfcasting');
      expect(progressSummary(d, c.id).remaining).toBe(1);
      expect(milestoneState(d, c.id, level)).toBe('locked');
      const r = simulateNextRenewal(d, c.id);
      if (!r.ok) throw new Error(r.error);
      const out = advanceToDelivered(d, r.value[0].order!.id);
      expect(out.ok && out.value.unlocked).toEqual([level]);
    }
  });
  it('dados iniciais são coerentes', () => {
    const d = createSeedData();
    expect(d.customers.length).toBeGreaterThan(5);
    const numbers = new Set(d.orders.map((o) => o.number));
    expect(numbers.size).toBe(d.orders.length);
    const carla = d.customers.find((c) => c.email === 'carla@exemplo.pt')!;
    expect(milestoneState(d, carla.id, 2)).toBe('received');
  });
  it('construção de histórico não altera o relógio', () => {
    const d = freshData();
    buildCustomerHistory(d, { name: 'Pessoa X', email: 'x@exemplo.pt', modality: 'achiga', planId: 'premium', mode: 'bimestral', deliveries: 3 });
    expect(d.clock).toBe('2026-10-16');
  });
});
