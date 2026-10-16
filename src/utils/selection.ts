import { FREQUENCIES, MODALITIES, PLANS } from '../config/business';
import type { Modality, PlanId, PurchaseMode } from '../domain/types';

export function parsePlan(v: string | null | undefined, fallback: PlanId = 'explorador'): PlanId {
  return v && v in PLANS ? (v as PlanId) : fallback;
}
export function parseModality(v: string | null | undefined, fallback: Modality = 'spinning-mar'): Modality {
  return v && v in MODALITIES ? (v as Modality) : fallback;
}
export function parseMode(v: string | null | undefined, fallback: PurchaseMode = 'mensal'): PurchaseMode {
  return v === 'avulsa' || (v && v in FREQUENCIES) ? (v as PurchaseMode) : fallback;
}

export function checkoutUrl(planId: PlanId, modality: Modality, mode: PurchaseMode) {
  return `/checkout?plano=${planId}&modalidade=${modality}&modo=${mode}`;
}
export function boxUrl(planId: PlanId, modality: Modality, mode?: PurchaseMode) {
  return `/box/${planId}?modalidade=${modality}${mode ? `&modo=${mode}` : ''}`;
}

export const MODE_LABEL: Record<PurchaseMode, string> = {
  mensal: 'Subscrição mensal',
  bimestral: 'Subscrição de dois em dois meses',
  avulsa: 'Compra avulsa (sem subscrição)',
};
