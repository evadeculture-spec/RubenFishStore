import { nextId } from './ids';
import type { DemoData, Product, Result } from './types';

export type ProductInput = Omit<Product, 'id'> & { id?: string };

export function validateProduct(p: ProductInput): string[] {
  const e: string[] = [];
  if (p.name.trim().length < 3) e.push('Indica um nome com pelo menos 3 caracteres.');
  if (p.modalities.length === 0) e.push('Escolhe pelo menos uma modalidade compatível.');
  for (const [v, label] of [[p.unitCostCents, 'custo unitário'], [p.referencePriceCents, 'preço de referência']] as const) {
    if (!Number.isInteger(v) || v < 0) e.push(`O ${label} tem de ser um valor positivo.`);
  }
  if (!Number.isInteger(p.stock) || p.stock < 0) e.push('O stock tem de ser um número inteiro igual ou superior a 0.');
  return e;
}

export function saveProduct(d: DemoData, p: ProductInput): Result<Product> {
  const errors = validateProduct(p);
  if (errors.length) return { ok: false, error: errors[0] };
  if (p.id) {
    const existing = d.products.find((x) => x.id === p.id);
    if (!existing) return { ok: false, error: 'Produto não encontrado.' };
    Object.assign(existing, { ...p, name: p.name.trim() });
    return { ok: true, value: existing };
  }
  const created: Product = { ...p, id: nextId(d, 'p'), name: p.name.trim() };
  d.products.push(created);
  return { ok: true, value: created };
}

/** Ajuste de stock físico de uma recompensa. Não pode ficar abaixo das unidades já reservadas. */
export function setRewardStock(d: DemoData, itemId: string, stock: number): Result<number> {
  const item = d.rewardItems.find((i) => i.id === itemId);
  if (!item) return { ok: false, error: 'Recompensa não encontrada.' };
  if (!Number.isInteger(stock) || stock < 0) return { ok: false, error: 'O stock tem de ser um número inteiro igual ou superior a 0.' };
  const reserved = d.redemptions.filter((r) => r.rewardItemId === itemId && r.status === 'reserved').length;
  if (stock < reserved) return { ok: false, error: `Há ${reserved} unidade(s) reservada(s): o stock não pode ser inferior.` };
  item.stock = stock;
  return { ok: true, value: stock };
}
