import { nextId } from './ids';
import { milestoneState, unlockedLevels } from './loyalty';
import type { DemoData, Order, Redemption, Result, RewardItem, RewardLevel } from './types';
import { atClock } from '../utils/dates';

export interface RewardStock {
  /** Unidades físicas em armazém. */
  stock: number;
  /** Reservadas para próximas caixas, ainda não expedidas. */
  reserved: number;
  /** Disponíveis para nova reserva. */
  available: number;
}

export function rewardStock(d: DemoData, itemId: string): RewardStock {
  const item = d.rewardItems.find((i) => i.id === itemId);
  const stock = item?.stock ?? 0;
  const reserved = d.redemptions.filter((r) => r.rewardItemId === itemId && r.status === 'reserved').length;
  return { stock, reserved, available: Math.max(0, stock - reserved) };
}

export function compatibleRewardItems(d: DemoData, customerId: string, level: RewardLevel): RewardItem[] {
  const customer = d.customers.find((c) => c.id === customerId);
  if (!customer) return [];
  return d.rewardItems.filter((i) => i.level === level && i.modalities.includes(customer.profile.modality));
}

/** Existe uma próxima caixa prevista: subscrição ativa ou encomenda paga ainda não expedida. */
export function hasUpcomingBox(d: DemoData, customerId: string): boolean {
  const activeSub = d.subscriptions.some((s) => s.customerId === customerId && s.status === 'active');
  if (activeSub) return true;
  return d.orders.some((o) => o.customerId === customerId && (o.status === 'paid' || o.status === 'preparing'));
}

/**
 * Resgata (reserva) uma recompensa de um marco desbloqueado.
 * Cada marco só pode ser resgatado uma vez e a reserva reduz o stock disponível.
 */
export function reserveReward(d: DemoData, customerId: string, level: RewardLevel, itemId: string): Result<Redemption> {
  if (!unlockedLevels(d.progressEvents, customerId).has(level)) {
    return { ok: false, error: 'Este marco ainda não foi desbloqueado.' };
  }
  if (milestoneState(d, customerId, level) !== 'available') {
    return { ok: false, error: 'A recompensa deste nível já foi escolhida.' };
  }
  const item = d.rewardItems.find((i) => i.id === itemId);
  if (!item || item.level !== level) return { ok: false, error: 'Produto de recompensa inválido para este nível.' };
  if (!compatibleRewardItems(d, customerId, level).some((i) => i.id === itemId)) {
    return { ok: false, error: 'Este produto não é compatível com a tua modalidade.' };
  }
  if (rewardStock(d, itemId).available <= 0) return { ok: false, error: 'Sem stock disponível para este produto.' };
  if (!hasUpcomingBox(d, customerId)) {
    return {
      ok: false,
      error: 'Não tens uma próxima box prevista. A recompensa mantém-se disponível para uma compra futura.',
    };
  }
  const redemption: Redemption = {
    id: nextId(d, 'rd'),
    customerId,
    level,
    rewardItemId: itemId,
    status: 'reserved',
    reservedAt: atClock(d.clock),
  };
  d.redemptions.push(redemption);
  return { ok: true, value: redemption };
}

/** Na expedição: as recompensas reservadas passam a pertencer à encomenda e saem do stock físico. */
export function attachReservedRewardsOnShip(d: DemoData, order: Order): Redemption[] {
  const reserved = d.redemptions.filter(
    (r) => r.customerId === order.customerId && r.status === 'reserved' && !r.orderId,
  );
  for (const r of reserved) {
    r.orderId = order.id;
    r.status = 'shipped';
    r.shippedAt = atClock(d.clock);
    const item = d.rewardItems.find((i) => i.id === r.rewardItemId);
    if (item) item.stock = Math.max(0, item.stock - 1);
  }
  return reserved;
}

/** Na entrega: recompensas expedidas com a encomenda passam a "recebida". */
export function markRewardsReceived(d: DemoData, order: Order): void {
  for (const r of d.redemptions) {
    if (r.orderId === order.id && r.status === 'shipped') {
      r.status = 'received';
      r.receivedAt = atClock(d.clock);
    }
  }
}
