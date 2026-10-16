import type { DemoData } from './types';

/** Gera identificadores determinísticos a partir de uma sequência guardada nos dados. */
export function nextId(d: DemoData, prefix: string): string {
  d.idSequence += 1;
  return `${prefix}_${d.idSequence.toString(36)}`;
}

/** Número de encomenda legível e único, ex.: MB-2026-00042. */
export function nextOrderNumber(d: DemoData): string {
  d.orderSequence += 1;
  return `MB-${d.clock.slice(0, 4)}-${String(d.orderSequence).padStart(5, '0')}`;
}
