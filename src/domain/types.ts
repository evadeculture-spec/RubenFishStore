/** Tipos de domínio da Maré Box (demonstração). Valores monetários em cêntimos. */

export type PlanId = 'essencial' | 'explorador' | 'premium';
export type Frequency = 'mensal' | 'bimestral';
export type PurchaseMode = Frequency | 'avulsa';
export type Modality = 'spinning-mar' | 'surfcasting' | 'achiga';
export type ExperienceLevel = 'iniciante' | 'intermedio' | 'experiente';
export type ProductCategory =
  | 'amostras'
  | 'vinis'
  | 'anzois'
  | 'destorcedores'
  | 'chumbos'
  | 'linhas'
  | 'acessorios'
  | 'organizacao';

/** Data no formato AAAA-MM-DD. */
export type ISODate = string;
/** Data e hora ISO 8601. */
export type ISODateTime = string;

export interface FishingProfile {
  modality: Modality;
  experience: ExperienceLevel;
  preferredCategories: ProductCategory[];
  avoidCategories: ProductCategory[];
}

export interface Address {
  fullName: string;
  line1: string;
  postalCode: string;
  city: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: ISODateTime;
  profile: FishingProfile;
  address?: Address;
  /** Cliente criado por um cenário de demonstração. */
  scenario?: string;
}

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface SubscriptionEvent {
  at: ISODateTime;
  type:
    | 'created'
    | 'renewed'
    | 'skipped'
    | 'skip_requested'
    | 'skip_cancelled'
    | 'paused'
    | 'resumed'
    | 'cancelled'
    | 'plan_changed'
    | 'frequency_changed'
    | 'modality_changed';
  detail?: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  planId: PlanId;
  modality: Modality;
  frequency: Frequency;
  status: SubscriptionStatus;
  startedAt: ISODateTime;
  /** Próxima data de cobrança simulada. Ignorada quando pausada ou cancelada. */
  nextBillingDate: ISODate;
  /** Saltar a próxima entrega: o próximo ciclo não gera encomenda. */
  skipNext: boolean;
  cancelledAt?: ISODateTime;
  pausedAt?: ISODateTime;
  history: SubscriptionEvent[];
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  modalities: Modality[];
  description: string;
  unitCostCents: number;
  referencePriceCents: number;
  stock: number;
  /** Produto de destaque (produto principal). */
  featured?: boolean;
}

export type EditionStatus = 'draft' | 'ready';

export interface EditionItem {
  productId: string;
  quantity: number;
}

export interface BoxEdition {
  id: string;
  name: string;
  /** Mês da edição (AAAA-MM). */
  month: string;
  modality: Modality;
  planId: PlanId;
  status: EditionStatus;
  items: EditionItem[];
  notes?: string;
  updatedAt: ISODateTime;
}

export type OrderStatus = 'paid' | 'preparing' | 'shipped' | 'delivered';
export type OrderKind = 'subscription' | 'single';

export interface OrderContentItem {
  productId: string;
  name: string;
  category: ProductCategory;
  quantity: number;
  /** Substituído por causa de uma preferência "evitar". */
  substitutedFor?: string;
}

export interface Order {
  id: string;
  number: string;
  customerId: string;
  kind: OrderKind;
  subscriptionId?: string;
  /** Identificador do ciclo de subscrição (evita duplicações). */
  cycleKey?: string;
  /** Chave de idempotência do checkout (evita duplo clique). */
  checkoutToken?: string;
  planId: PlanId;
  modality: Modality;
  frequency?: Frequency;
  priceCents: number;
  shippingCents: number;
  totalCents: number;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; at: ISODateTime }[];
  createdAt: ISODateTime;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  /** Preenchido apenas na expedição simulada. */
  editionId?: string;
  contents?: OrderContentItem[];
}

export type PaymentMethod = 'cartao-demo' | 'pagamento-teste';

/** Evento de progresso: histórico imutável, nunca um contador mutável. */
export type ProgressEvent =
  | { id: string; customerId: string; at: ISODateTime; type: 'box_delivered'; orderId: string }
  | { id: string; customerId: string; at: ISODateTime; type: 'milestone_unlocked'; level: RewardLevel; orderId: string };

export type RewardLevel = 1 | 2 | 3;

export interface RewardMilestone {
  level: RewardLevel;
  boxes: number;
  title: string;
  summary: string;
}

export interface RewardItem {
  id: string;
  level: RewardLevel;
  name: string;
  description: string;
  modalities: Modality[];
  /** Unidades físicas em armazém (inclui as reservadas, ainda não expedidas). */
  stock: number;
}

export type RedemptionStatus = 'reserved' | 'shipped' | 'received';

export interface Redemption {
  id: string;
  customerId: string;
  level: RewardLevel;
  rewardItemId: string;
  status: RedemptionStatus;
  reservedAt: ISODateTime;
  orderId?: string;
  shippedAt?: ISODateTime;
  receivedAt?: ISODateTime;
}

export type ChallengeKind = 'read_guide' | 'try_rig' | 'log_trip';

export interface Challenge {
  id: string;
  kind: ChallengeKind;
  title: string;
  description: string;
  badge: string;
}

export interface ChallengeCompletion {
  id: string;
  customerId: string;
  challengeId: string;
  at: ISODateTime;
  /** Referência opcional (ex.: guia lido ou saída registada). */
  ref?: string;
}

export interface FishingLog {
  id: string;
  customerId: string;
  date: ISODate;
  spot: string;
  modality: Modality;
  species: string;
  notes: string;
  createdAt: ISODateTime;
}

export interface DemoData {
  clock: ISODate;
  customers: Customer[];
  subscriptions: Subscription[];
  orders: Order[];
  products: Product[];
  editions: BoxEdition[];
  progressEvents: ProgressEvent[];
  rewardItems: RewardItem[];
  redemptions: Redemption[];
  challengeCompletions: ChallengeCompletion[];
  fishingLogs: FishingLog[];
  guidesRead: { customerId: string; guideId: string; at: ISODateTime }[];
  /** Estado de interface persistido: celebrações já vistas. */
  seenCelebrations: string[];
  activeCustomerId: string;
  orderSequence: number;
  idSequence: number;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
