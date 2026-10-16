import type { DemoData } from '../domain/types';
import { isValidISODate } from '../utils/dates';
import { createSeedData } from './seed';

/**
 * Repositório local da demonstração (localStorage).
 *
 * Ponto de integração futuro: substituir esta implementação por uma que fale com um backend,
 * mantendo a mesma interface `DemoRepository`.
 */
export interface DemoRepository {
  load(): LoadResult;
  save(data: DemoData): void;
  reset(): DemoData;
}

export type LoadResult = { data: DemoData; status: 'loaded' | 'seeded' | 'recovered' };

export const STORAGE_KEY = 'mare-box-demo';
export const SCHEMA_VERSION = 1;

interface Envelope {
  schemaVersion: number;
  savedAt: string;
  data: DemoData;
}

const ARRAY_KEYS: (keyof DemoData)[] = [
  'customers',
  'subscriptions',
  'orders',
  'products',
  'editions',
  'progressEvents',
  'rewardItems',
  'redemptions',
  'challengeCompletions',
  'fishingLogs',
  'guidesRead',
  'seenCelebrations',
];

/** Validação estrutural mínima: rejeita dados ausentes, de outra versão ou corrompidos. */
export function isValidData(value: unknown): value is DemoData {
  if (!value || typeof value !== 'object') return false;
  const d = value as Record<string, unknown>;
  if (!ARRAY_KEYS.every((k) => Array.isArray(d[k]))) return false;
  if (!isValidISODate(d.clock)) return false;
  if (typeof d.orderSequence !== 'number' || typeof d.idSequence !== 'number') return false;
  const customers = d.customers as { id?: unknown }[];
  return typeof d.activeCustomerId === 'string' && customers.some((c) => c && c.id === d.activeCustomerId);
}

export function parseStored(raw: string | null): DemoData | null {
  if (!raw) return null;
  try {
    const env = JSON.parse(raw) as Partial<Envelope>;
    if (env.schemaVersion !== SCHEMA_VERSION) return null;
    return isValidData(env.data) ? env.data : null;
  } catch {
    return null;
  }
}

function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export const localRepository: DemoRepository = {
  load() {
    const s = storage();
    let raw: string | null;
    try {
      raw = s?.getItem(STORAGE_KEY) ?? null;
    } catch {
      raw = null;
    }
    const parsed = parseStored(raw);
    if (parsed) return { data: parsed, status: 'loaded' };
    const data = createSeedData();
    this.save(data);
    return { data, status: raw ? 'recovered' : 'seeded' };
  },
  save(data) {
    const env: Envelope = { schemaVersion: SCHEMA_VERSION, savedAt: new Date().toISOString(), data };
    try {
      storage()?.setItem(STORAGE_KEY, JSON.stringify(env));
    } catch {
      // Sem armazenamento disponível (ex.: navegação privada): a demonstração continua em memória.
    }
  },
  reset() {
    try {
      storage()?.removeItem(STORAGE_KEY);
    } catch {
      /* ignorado */
    }
    const data = createSeedData();
    this.save(data);
    return data;
  },
};
