/**
 * Configuração central da oferta comercial da demonstração.
 *
 * Todos os valores são hipóteses de teste do piloto e podem ser editados aqui.
 * Valores monetários em cêntimos, com IVA incluído (preço ao consumidor).
 */
import type { Frequency, Modality, PlanId, ExperienceLevel, ProductCategory } from '../domain/types';

export interface PlanConfig {
  id: PlanId;
  name: string;
  priceCents: number;
  shippingCents: number;
  tagline: string;
  /** Quantidade indicativa de artigos por caixa. */
  itemsRange: [number, number];
  /** Número de produtos principais (peças de maior destaque) por caixa. */
  featuredItems: number;
  selection: string[];
  highlight?: boolean;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  essencial: {
    id: 'essencial',
    name: 'Essencial',
    priceCents: 1990,
    shippingCents: 390,
    tagline: 'Para experimentar novidades sem complicar.',
    itemsRange: [4, 5],
    featuredItems: 0,
    selection: [
      'Consumíveis do dia a dia: anzóis, destorcedores, chumbos ou linha',
      'Uma amostra ou isco artificial adequado à modalidade',
      'Guia curto de utilização dos artigos da edição',
    ],
  },
  explorador: {
    id: 'explorador',
    name: 'Explorador',
    priceCents: 3990,
    shippingCents: 0,
    tagline: 'Mais variedade para quem já sai com regularidade.',
    itemsRange: [6, 8],
    featuredItems: 1,
    selection: [
      'Tudo o que entra no Essencial, em maior quantidade',
      'Duas a três amostras ou iscos artificiais',
      'Um produto principal escolhido para a modalidade',
      'Guia de montagem com exemplo prático',
    ],
    highlight: true,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    priceCents: 5990,
    shippingCents: 0,
    tagline: 'Seleção mais completa, com peças de maior destaque.',
    itemsRange: [8, 10],
    featuredItems: 2,
    selection: [
      'Seleção alargada de consumíveis e acessórios',
      'Três ou mais amostras ou iscos artificiais',
      'Dois produtos principais, como linha técnica ou organizador',
      'Guias de montagem e de utilização de cada produto principal',
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ['essencial', 'explorador', 'premium'];

export const FREQUENCIES: Record<Frequency, { label: string; short: string; months: number; description: string }> = {
  mensal: { label: 'Mensal', short: 'por mês', months: 1, description: 'Uma box todos os meses.' },
  bimestral: {
    label: 'De dois em dois meses',
    short: 'a cada 2 meses',
    months: 2,
    description: 'Uma box a cada dois meses.',
  },
};

export const MODALITIES: Record<Modality, { label: string; short: string; description: string }> = {
  'spinning-mar': {
    label: 'Spinning de mar',
    short: 'Spinning',
    description: 'Pesca ativa com amostras a partir de rochas, praias e molhes: robalo, anchova, sarda.',
  },
  surfcasting: {
    label: 'Surfcasting',
    short: 'Surfcasting',
    description: 'Lançamento longo a partir da praia com isco natural: sargo, dourada, robalo.',
  },
  achiga: {
    label: 'Achigã',
    short: 'Achigã',
    description: 'Pesca de predadores em albufeiras e rios, com vinis, amostras de superfície e jigs.',
  },
};

export const MODALITY_ORDER: Modality[] = ['spinning-mar', 'surfcasting', 'achiga'];

export const EXPERIENCE: Record<ExperienceLevel, { label: string; description: string }> = {
  iniciante: { label: 'Iniciante', description: 'Estou a começar ou pesco poucas vezes por ano.' },
  intermedio: { label: 'Intermédio', description: 'Pesco com regularidade e conheço as montagens básicas.' },
  experiente: { label: 'Experiente', description: 'Tenho várias técnicas dominadas e procuro novidades.' },
};

export const PRODUCT_CATEGORIES: Record<ProductCategory, string> = {
  amostras: 'Amostras',
  vinis: 'Vinis e iscos artificiais',
  anzois: 'Anzóis',
  destorcedores: 'Destorcedores e snaps',
  chumbos: 'Chumbos e cabeçotes',
  linhas: 'Linhas e fluorocarbono',
  acessorios: 'Acessórios',
  organizacao: 'Organização',
};

export const SHIPPING = {
  /** Entregas limitadas a Portugal Continental no piloto. */
  region: 'Portugal Continental',
  /** Dias indicativos entre a cobrança simulada e a expedição. */
  daysToShip: 3,
};

export const LOYALTY = {
  /** Marcos garantidos: número de caixas elegíveis entregues. */
  milestones: [
    { level: 1 as const, boxes: 3, title: 'Nível 1', summary: 'Pequeno acessório à escolha' },
    { level: 2 as const, boxes: 6, title: 'Nível 2', summary: 'Amostra ou conjunto de consumíveis' },
    { level: 3 as const, boxes: 12, title: 'Nível 3', summary: 'Caixa organizadora ou conjunto especial' },
  ],
  /** Compras avulsas também contam para o progresso. */
  singleBoxesCount: true,
};

export const SUBSCRIPTION_RULES = {
  /** Ao retomar uma subscrição pausada, a próxima cobrança simulada é agendada para daqui a N dias. */
  resumeDelayDays: 3,
};

/** Data inicial do relógio de demonstração. */
export const DEMO_START_DATE = '2026-10-16';
