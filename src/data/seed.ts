import { DEMO_START_DATE } from '../config/business';
import type { DemoData } from '../domain/types';
import { atClock } from '../utils/dates';
import { SEED_PRODUCTS, SEED_REWARD_ITEMS } from './catalog';
import { seedEditions } from './editions';
import { buildCustomerHistory } from './scenarios';

export const VISITOR_ID = 'cus_visitante';

export function createBaseData(clock = DEMO_START_DATE): DemoData {
  return {
    clock,
    customers: [
      {
        id: VISITOR_ID,
        name: 'Visitante (demonstração)',
        email: 'visitante@exemplo.pt',
        createdAt: atClock(clock),
        profile: { modality: 'spinning-mar', experience: 'iniciante', preferredCategories: [], avoidCategories: [] },
      },
    ],
    subscriptions: [],
    orders: [],
    products: structuredClone(SEED_PRODUCTS),
    editions: seedEditions(SEED_PRODUCTS, atClock(clock)),
    progressEvents: [],
    rewardItems: structuredClone(SEED_REWARD_ITEMS),
    redemptions: [],
    challengeCompletions: [],
    fishingLogs: [],
    guidesRead: [],
    seenCelebrations: [],
    activeCustomerId: VISITOR_ID,
    orderSequence: 0,
    idSequence: 0,
  };
}

/** Dados iniciais da demonstração: catálogo, edições e clientes fictícios em estados variados. */
export function createSeedData(): DemoData {
  const d = createBaseData();
  buildCustomerHistory(d, { name: 'Ana Ribeiro (fictícia)', email: 'ana@exemplo.pt', modality: 'spinning-mar', experience: 'intermedio', planId: 'explorador', mode: 'mensal', deliveries: 4, openOrder: 'paid', autoRedeem: true, city: 'Peniche' });
  buildCustomerHistory(d, { name: 'Bruno Matos (fictício)', email: 'bruno@exemplo.pt', modality: 'surfcasting', experience: 'iniciante', planId: 'essencial', mode: 'bimestral', deliveries: 2, city: 'Aveiro' });
  buildCustomerHistory(d, { name: 'Carla Nunes (fictícia)', email: 'carla@exemplo.pt', modality: 'achiga', experience: 'experiente', planId: 'premium', mode: 'mensal', deliveries: 7, openOrder: 'preparing', autoRedeem: true, city: 'Porto' });
  buildCustomerHistory(d, { name: 'Diogo Pires (fictício)', email: 'diogo@exemplo.pt', modality: 'spinning-mar', experience: 'iniciante', planId: 'essencial', mode: 'mensal', deliveries: 1, finalStatus: 'paused', city: 'Sines' });
  buildCustomerHistory(d, { name: 'Elisa Cardoso (fictícia)', email: 'elisa@exemplo.pt', modality: 'surfcasting', experience: 'intermedio', planId: 'explorador', mode: 'mensal', deliveries: 3, finalStatus: 'cancelled', city: 'Faro' });
  buildCustomerHistory(d, { name: 'Filipe Sousa (fictício)', email: 'filipe@exemplo.pt', modality: 'achiga', experience: 'intermedio', planId: 'explorador', mode: 'avulsa', deliveries: 1, openOrder: 'shipped', city: 'Lisboa' });
  buildCustomerHistory(d, { name: 'Gonçalo Teixeira (fictício)', email: 'goncalo@exemplo.pt', modality: 'spinning-mar', experience: 'experiente', planId: 'premium', mode: 'bimestral', deliveries: 0, openOrder: 'paid', city: 'Porto' });
  d.activeCustomerId = VISITOR_ID;
  return d;
}
