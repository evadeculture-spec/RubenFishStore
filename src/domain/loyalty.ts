import { LOYALTY } from '../config/business';
import { nextId } from './ids';
import type { DemoData, Order, ProgressEvent, Redemption, RewardLevel, RewardMilestone } from './types';
import { atClock } from '../utils/dates';

export const MILESTONES: RewardMilestone[] = LOYALTY.milestones;

export type MilestoneState = 'locked' | 'available' | 'reserved' | 'shipped' | 'received';

/** Uma encomenda é elegível se o pagamento simulado foi confirmado e a entrega simulada concluída. */
export function isEligibleOrder(order: Order): boolean {
  if (order.status !== 'delivered') return false;
  if (order.kind === 'single' && !LOYALTY.singleBoxesCount) return false;
  return order.statusHistory.some((h) => h.status === 'paid');
}

/** Contagem derivada do histórico: cada encomenda conta uma única vez. */
export function countEligibleBoxes(events: ProgressEvent[], customerId: string): number {
  const ids = new Set<string>();
  for (const e of events) {
    if (e.customerId === customerId && e.type === 'box_delivered') ids.add(e.orderId);
  }
  return ids.size;
}

export function unlockedLevels(events: ProgressEvent[], customerId: string): Set<RewardLevel> {
  const set = new Set<RewardLevel>();
  for (const e of events) {
    if (e.customerId === customerId && e.type === 'milestone_unlocked') set.add(e.level);
  }
  return set;
}

/**
 * Regista a entrega de uma encomenda elegível no histórico de progresso e desbloqueia marcos.
 * Idempotente: uma encomenda já registada não volta a contar; cada marco é conquistado uma vez.
 * Devolve os níveis desbloqueados nesta chamada.
 */
export function recordDelivery(d: DemoData, order: Order): RewardLevel[] {
  if (!isEligibleOrder(order)) return [];
  const already = d.progressEvents.some((e) => e.type === 'box_delivered' && e.orderId === order.id);
  if (already) return [];
  const at = atClock(d.clock);
  d.progressEvents.push({ id: nextId(d, 'pe'), customerId: order.customerId, at, type: 'box_delivered', orderId: order.id });

  const count = countEligibleBoxes(d.progressEvents, order.customerId);
  const unlocked = unlockedLevels(d.progressEvents, order.customerId);
  const newly: RewardLevel[] = [];
  for (const m of MILESTONES) {
    if (count >= m.boxes && !unlocked.has(m.level)) {
      d.progressEvents.push({
        id: nextId(d, 'pe'),
        customerId: order.customerId,
        at,
        type: 'milestone_unlocked',
        level: m.level,
        orderId: order.id,
      });
      newly.push(m.level);
    }
  }
  return newly;
}

export function redemptionForLevel(redemptions: Redemption[], customerId: string, level: RewardLevel) {
  return redemptions.find((r) => r.customerId === customerId && r.level === level);
}

export function milestoneState(d: DemoData, customerId: string, level: RewardLevel): MilestoneState {
  if (!unlockedLevels(d.progressEvents, customerId).has(level)) return 'locked';
  const r = redemptionForLevel(d.redemptions, customerId, level);
  if (!r) return 'available';
  return r.status;
}

export interface ProgressSummary {
  count: number;
  next?: RewardMilestone;
  remaining: number;
  /** 0–1 até ao próximo marco. */
  ratioToNext: number;
  message: string;
}

export function progressSummary(d: DemoData, customerId: string): ProgressSummary {
  const count = countEligibleBoxes(d.progressEvents, customerId);
  const next = MILESTONES.find((m) => m.boxes > count);
  if (!next) {
    return { count, remaining: 0, ratioToNext: 1, message: 'Conquistaste todos os marcos desta versão do programa.' };
  }
  const prevBoxes = MILESTONES.filter((m) => m.boxes <= count).reduce((max, m) => Math.max(max, m.boxes), 0);
  const remaining = next.boxes - count;
  return {
    count,
    next,
    remaining,
    ratioToNext: (count - prevBoxes) / (next.boxes - prevBoxes),
    message:
      remaining === 1
        ? 'Falta 1 box para desbloqueares a próxima recompensa.'
        : `Faltam ${remaining} boxes para desbloqueares a próxima recompensa.`,
  };
}
