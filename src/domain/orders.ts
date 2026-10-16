import { recordDelivery } from './loyalty';
import { attachReservedRewardsOnShip, markRewardsReceived } from './rewards';
import type { BoxEdition, DemoData, Order, OrderContentItem, OrderStatus, Product, Result, RewardLevel } from './types';
import { atClock, monthKey } from '../utils/dates';

export const ORDER_FLOW: OrderStatus[] = ['paid', 'preparing', 'shipped', 'delivered'];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  paid: 'Pagamento simulado confirmado',
  preparing: 'Em preparação',
  shipped: 'Expedida',
  delivered: 'Entregue',
};

export function nextStatus(status: OrderStatus): OrderStatus | undefined {
  return ORDER_FLOW[ORDER_FLOW.indexOf(status) + 1];
}

/** Só é válida a transição para o estado imediatamente seguinte: sem saltos nem repetições. */
export function canTransition(order: Order, to: OrderStatus): boolean {
  return nextStatus(order.status) === to;
}

/** Edição pronta para a modalidade e o plano: a mais recente até ao mês da encomenda, ou a mais antiga disponível. */
export function resolveEdition(d: DemoData, order: Order): BoxEdition | undefined {
  const ready = d.editions
    .filter((e) => e.status === 'ready' && e.modality === order.modality && e.planId === order.planId)
    .sort((a, b) => a.month.localeCompare(b.month));
  const month = monthKey(d.clock);
  const upTo = ready.filter((e) => e.month <= month);
  return upTo[upTo.length - 1] ?? ready[0];
}

/**
 * Regra explícita de preferências: um artigo de uma categoria que o cliente quer evitar é trocado
 * pelo produto compatível de outra categoria com preço de referência mais próximo e stock disponível.
 */
export function applyAvoidPreferences(
  items: { product: Product; quantity: number }[],
  avoid: string[],
  catalog: Product[],
  modality: Order['modality'],
): OrderContentItem[] {
  const used = new Set(items.map((i) => i.product.id));
  return items.map(({ product, quantity }) => {
    if (!avoid.includes(product.category)) {
      return { productId: product.id, name: product.name, category: product.category, quantity };
    }
    const alt = catalog
      .filter(
        (p) => p.modalities.includes(modality) && !avoid.includes(p.category) && !used.has(p.id) && p.stock >= quantity,
      )
      .sort(
        (a, b) =>
          Math.abs(a.referencePriceCents - product.referencePriceCents) -
          Math.abs(b.referencePriceCents - product.referencePriceCents),
      )[0];
    if (!alt) return { productId: product.id, name: product.name, category: product.category, quantity };
    used.add(alt.id);
    return { productId: alt.id, name: alt.name, category: alt.category, quantity, substitutedFor: product.name };
  });
}

export interface TransitionOutcome {
  order: Order;
  unlocked: RewardLevel[];
}

export function transitionOrder(d: DemoData, orderId: string, to: OrderStatus): Result<TransitionOutcome> {
  const order = d.orders.find((o) => o.id === orderId);
  if (!order) return { ok: false, error: 'Encomenda não encontrada.' };
  if (order.status === to) return { ok: false, error: `A encomenda já está no estado "${ORDER_STATUS_LABEL[to]}".` };
  if (!canTransition(order, to)) {
    const expected = nextStatus(order.status);
    return {
      ok: false,
      error: expected
        ? `Transição inválida: o próximo estado possível é "${ORDER_STATUS_LABEL[expected]}".`
        : 'A encomenda já foi entregue.',
    };
  }

  let unlocked: RewardLevel[] = [];
  if (to === 'shipped') {
    const edition = resolveEdition(d, order);
    if (!edition) {
      return { ok: false, error: 'Não existe nenhuma edição "pronta" para esta modalidade e plano.' };
    }
    const customer = d.customers.find((c) => c.id === order.customerId);
    const items = edition.items
      .map((i) => ({ product: d.products.find((p) => p.id === i.productId), quantity: i.quantity }))
      .filter((i): i is { product: Product; quantity: number } => Boolean(i.product));
    const contents = applyAvoidPreferences(items, customer?.profile.avoidCategories ?? [], d.products, order.modality);
    for (const c of contents) {
      const p = d.products.find((x) => x.id === c.productId);
      if (p) p.stock = Math.max(0, p.stock - c.quantity);
    }
    order.editionId = edition.id;
    order.contents = contents;
    attachReservedRewardsOnShip(d, order);
  }

  order.status = to;
  order.statusHistory.push({ status: to, at: atClock(d.clock) });

  if (to === 'delivered') {
    markRewardsReceived(d, order);
    unlocked = recordDelivery(d, order);
  }
  return { ok: true, value: { order, unlocked } };
}

/** Simulador: avança a encomenda por todos os estados válidos até à entrega. */
export function advanceToDelivered(d: DemoData, orderId: string): Result<TransitionOutcome> {
  const order = d.orders.find((o) => o.id === orderId);
  if (!order) return { ok: false, error: 'Encomenda não encontrada.' };
  if (order.status === 'delivered') return { ok: false, error: 'Esta encomenda já foi entregue.' };
  const unlocked: RewardLevel[] = [];
  let to = nextStatus(order.status);
  while (to) {
    const r = transitionOrder(d, orderId, to);
    if (!r.ok) return r;
    unlocked.push(...r.value.unlocked);
    to = nextStatus(order.status);
  }
  return { ok: true, value: { order, unlocked } };
}

/** Conteúdo só é revelado após a expedição simulada. */
export function isContentRevealed(order: Order): boolean {
  return order.status === 'shipped' || order.status === 'delivered';
}

export function statusDate(order: Order, status: OrderStatus): string | undefined {
  return order.statusHistory.find((h) => h.status === status)?.at;
}
