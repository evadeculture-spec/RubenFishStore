import { nextId } from './ids';
import type { ChallengeKind, DemoData, FishingLog, Result } from './types';
import { atClock, isValidISODate } from '../utils/dates';

/** Desafios atribuem apenas distintivos visuais: não alteram progresso nem recompensas em produto. */
export function completeChallenge(d: DemoData, customerId: string, kind: ChallengeKind, ref?: string): boolean {
  const challenge = CHALLENGE_IDS[kind];
  if (d.challengeCompletions.some((c) => c.customerId === customerId && c.challengeId === challenge)) return false;
  d.challengeCompletions.push({ id: nextId(d, 'cc'), customerId, challengeId: challenge, at: atClock(d.clock), ref });
  return true;
}

export const CHALLENGE_IDS: Record<ChallengeKind, string> = { read_guide: 'ch-guide', try_rig: 'ch-rig', log_trip: 'ch-trip' };

export function markGuideRead(d: DemoData, customerId: string, guideId: string): Result<{ badge: boolean }> {
  if (!d.guidesRead.some((g) => g.customerId === customerId && g.guideId === guideId)) {
    d.guidesRead.push({ customerId, guideId, at: atClock(d.clock) });
  }
  return { ok: true, value: { badge: completeChallenge(d, customerId, 'read_guide', guideId) } };
}

export function markRigTried(d: DemoData, customerId: string, guideId: string): Result<{ badge: boolean }> {
  return { ok: true, value: { badge: completeChallenge(d, customerId, 'try_rig', guideId) } };
}

export type TripInput = Omit<FishingLog, 'id' | 'customerId' | 'createdAt'>;

export function validateTrip(t: TripInput): Partial<Record<keyof TripInput, string>> {
  const e: Partial<Record<keyof TripInput, string>> = {};
  if (!isValidISODate(t.date)) e.date = 'Indica uma data válida.';
  if (t.spot.trim().length < 2) e.spot = 'Indica um local (pode ser fictício).';
  return e;
}

export function logTrip(d: DemoData, customerId: string, t: TripInput): Result<{ log: FishingLog; badge: boolean }> {
  if (Object.keys(validateTrip(t)).length) return { ok: false, error: 'Revê os campos da saída de pesca.' };
  const log: FishingLog = { id: nextId(d, 'log'), customerId, createdAt: atClock(d.clock), ...t, spot: t.spot.trim(), species: t.species.trim(), notes: t.notes.trim() };
  d.fishingLogs.push(log);
  return { ok: true, value: { log, badge: completeChallenge(d, customerId, 'log_trip', log.id) } };
}
