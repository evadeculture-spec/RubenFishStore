import { nextId } from './ids';
import type { BoxEdition, DemoData, Result } from './types';
import { atClock } from '../utils/dates';

export type EditionInput = Omit<BoxEdition, 'id' | 'updatedAt'> & { id?: string };

export function validateEdition(d: DemoData, e: EditionInput): string[] {
  const errors: string[] = [];
  if (e.name.trim().length < 3) errors.push('Indica um nome para a edição.');
  if (!/^\d{4}-\d{2}$/.test(e.month)) errors.push('Indica o mês da edição.');
  if (e.items.length === 0) errors.push('Associa pelo menos um produto.');
  const seen = new Set<string>();
  for (const it of e.items) {
    const p = d.products.find((x) => x.id === it.productId);
    if (!p) errors.push('Há um produto inválido na lista.');
    else if (!p.modalities.includes(e.modality)) errors.push(`"${p.name}" não é compatível com a modalidade escolhida.`);
    if (!Number.isInteger(it.quantity) || it.quantity < 1) errors.push('As quantidades têm de ser números inteiros a partir de 1.');
    if (seen.has(it.productId)) errors.push('Há produtos repetidos: ajusta a quantidade em vez de repetir.');
    seen.add(it.productId);
  }
  if (e.status === 'ready') {
    const clash = d.editions.find((x) => x.id !== e.id && x.status === 'ready' && x.month === e.month && x.modality === e.modality && x.planId === e.planId);
    if (clash) errors.push(`Já existe uma edição pronta para este mês, modalidade e plano ("${clash.name}").`);
  }
  return [...new Set(errors)];
}

export function saveEdition(d: DemoData, e: EditionInput): Result<BoxEdition> {
  const errors = validateEdition(d, e);
  if (errors.length) return { ok: false, error: errors[0] };
  const updatedAt = atClock(d.clock);
  if (e.id) {
    const existing = d.editions.find((x) => x.id === e.id);
    if (!existing) return { ok: false, error: 'Edição não encontrada.' };
    Object.assign(existing, { ...e, name: e.name.trim(), updatedAt });
    return { ok: true, value: existing };
  }
  const created: BoxEdition = { ...e, id: nextId(d, 'ed'), name: e.name.trim(), updatedAt };
  d.editions.push(created);
  return { ok: true, value: created };
}
