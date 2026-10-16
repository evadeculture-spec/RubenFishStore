import { MODALITY_ORDER, PLAN_ORDER, PLANS, MODALITIES } from '../config/business';
import type { BoxEdition, Modality, PlanId, Product } from '../domain/types';
import { formatMonth } from '../utils/dates';

/** Gera uma seleção de demonstração determinística a partir das regras de compatibilidade. */
export function generateEditionItems(products: Product[], modality: Modality, planId: PlanId, rotation: number) {
  const plan = PLANS[planId];
  const compatible = products.filter((p) => p.modalities.includes(modality) && p.category !== 'organizacao');
  const featured = compatible.filter((p) => p.featured);
  const regular = compatible.filter((p) => !p.featured);
  const pick = <T,>(list: T[], n: number, offset: number) =>
    Array.from({ length: Math.min(n, list.length) }, (_, i) => list[(offset + i) % list.length]);
  const chosen = [
    ...pick(featured, plan.featuredItems, rotation),
    ...pick(regular, plan.itemsRange[0] - plan.featuredItems, rotation * 2),
  ];
  return chosen.map((p) => ({ productId: p.id, quantity: 1 }));
}

export function seedEditions(products: Product[], updatedAt: string): BoxEdition[] {
  const months: { month: string; status: BoxEdition['status'] }[] = [
    { month: '2026-08', status: 'ready' },
    { month: '2026-09', status: 'ready' },
    { month: '2026-10', status: 'ready' },
  ];
  const out: BoxEdition[] = [];
  months.forEach(({ month, status }, idx) => {
    for (const modality of MODALITY_ORDER) {
      for (const planId of PLAN_ORDER) {
        out.push({
          id: `ed-${month}-${modality}-${planId}`,
          name: `${formatMonth(month)} · ${MODALITIES[modality].short} · ${PLANS[planId].name}`,
          month,
          modality,
          planId,
          status,
          items: generateEditionItems(products, modality, planId, idx),
          updatedAt,
        });
      }
    }
  });
  for (const modality of MODALITY_ORDER) {
    out.push({
      id: `ed-2026-11-${modality}-explorador`,
      name: `${formatMonth('2026-11')} · ${MODALITIES[modality].short} · Explorador`,
      month: '2026-11',
      modality,
      planId: 'explorador',
      status: 'draft',
      items: generateEditionItems(products, modality, 'explorador', 3).slice(0, 3),
      notes: 'Rascunho: seleção em curso.',
      updatedAt,
    });
  }
  return out;
}
