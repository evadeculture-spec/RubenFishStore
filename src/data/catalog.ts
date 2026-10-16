import type { Challenge, Modality, Product, RewardItem } from '../domain/types';

const ALL: Modality[] = ['spinning-mar', 'surfcasting', 'achiga'];
const SP: Modality[] = ['spinning-mar'];
const SC: Modality[] = ['surfcasting'];
const AC: Modality[] = ['achiga'];

type P = Omit<Product, 'stock'> & { stock?: number };

const raw: P[] = [
  // Spinning de mar
  { id: 'p-sp-minnow', name: 'Amostra minnow 120 mm, afundamento lento', category: 'amostras', modalities: SP, description: 'Para recolhas lentas junto à rocha, em água com alguma ondulação.', unitCostCents: 520, referencePriceCents: 1290, featured: true },
  { id: 'p-sp-stick', name: 'Stickbait de superfície 110 mm', category: 'amostras', modalities: SP, description: 'Trabalho em "walk the dog" para dias de atividade à superfície.', unitCostCents: 480, referencePriceCents: 1190 },
  { id: 'p-sp-jig30', name: 'Jig metálico 30 g', category: 'amostras', modalities: SP, description: 'Lançamento longo para cardumes de sarda e anchova.', unitCostCents: 210, referencePriceCents: 590 },
  { id: 'p-sp-eel', name: 'Vinil "sand eel" 12 cm (4 un.)', category: 'vinis', modalities: SP, description: 'Imitação de galeota para montar em cabeçote.', unitCostCents: 260, referencePriceCents: 690 },
  { id: 'p-sp-head', name: 'Cabeçotes 15 g (3 un.)', category: 'chumbos', modalities: SP, description: 'Cabeçotes com anzol forte para vinis de 10 a 14 cm.', unitCostCents: 180, referencePriceCents: 490 },
  { id: 'p-sp-braid', name: 'Linha trançada PE 1.0, 150 m', category: 'linhas', modalities: SP, description: 'Linha principal fina para lançar amostras leves.', unitCostCents: 990, referencePriceCents: 2290, featured: true },
  { id: 'p-sp-snaps', name: 'Snaps reforçados (10 un.)', category: 'destorcedores', modalities: SP, description: 'Troca rápida de amostras sem nós.', unitCostCents: 120, referencePriceCents: 350 },
  { id: 'p-sp-trebles', name: 'Triplos de substituição n.º 4 (6 un.)', category: 'anzois', modalities: SP, description: 'Para renovar amostras com anzóis gastos.', unitCostCents: 170, referencePriceCents: 450 },
  // Surfcasting
  { id: 'p-sc-hooks', name: 'Anzóis de praia n.º 2 (10 un.)', category: 'anzois', modalities: SC, description: 'Haste longa, adequados a iscos como minhoca e casulo.', unitCostCents: 110, referencePriceCents: 320 },
  { id: 'p-sc-grip', name: 'Chumbos de garras 150 g (2 un.)', category: 'chumbos', modalities: SC, description: 'Fixação ao fundo com corrente lateral.', unitCostCents: 260, referencePriceCents: 650 },
  { id: 'p-sc-pyr', name: 'Chumbos pirâmide 120 g (3 un.)', category: 'chumbos', modalities: SC, description: 'Para fundos de areia com pouca corrente.', unitCostCents: 210, referencePriceCents: 520 },
  { id: 'p-sc-swivel', name: 'Destorcedores com rolamento (10 un.)', category: 'destorcedores', modalities: SC, description: 'Evitam torções na baixada durante a recolha.', unitCostCents: 150, referencePriceCents: 420 },
  { id: 'p-sc-leader', name: 'Shock leader cónico 0,26–0,57 mm', category: 'linhas', modalities: SC, description: 'Absorve o esforço do lançamento com chumbos pesados.', unitCostCents: 380, referencePriceCents: 890, featured: true },
  { id: 'p-sc-elastic', name: 'Fio elástico para iscar, 200 m', category: 'acessorios', modalities: SC, description: 'Segura iscos moles durante o lançamento.', unitCostCents: 140, referencePriceCents: 390 },
  { id: 'p-sc-lights', name: 'Luzes químicas 4,5 mm (10 un.)', category: 'acessorios', modalities: SC, description: 'Sinalização da ponteira em pesca noturna.', unitCostCents: 120, referencePriceCents: 350 },
  { id: 'p-sc-rig', name: 'Baixadas prontas de 2 anzóis (3 un.)', category: 'anzois', modalities: SC, description: 'Montagem pronta para começar sem nós complicados.', unitCostCents: 290, referencePriceCents: 750 },
  // Achigã
  { id: 'p-ac-craw', name: 'Vinil "craw" 9 cm (6 un.)', category: 'vinis', modalities: AC, description: 'Imitação de lagostim para montagens texas e jig.', unitCostCents: 290, referencePriceCents: 750 },
  { id: 'p-ac-worm', name: 'Vinil "worm" 15 cm (8 un.)', category: 'vinis', modalities: AC, description: 'Clássico para wacky e texas em zonas com vegetação.', unitCostCents: 260, referencePriceCents: 690 },
  { id: 'p-ac-crank', name: 'Crankbait 6 cm, mergulho médio', category: 'amostras', modalities: AC, description: 'Prospeção rápida entre 1 e 2,5 m de profundidade.', unitCostCents: 450, referencePriceCents: 1090, featured: true },
  { id: 'p-ac-spinner', name: 'Spinnerbait 10 g', category: 'amostras', modalities: AC, description: 'Vibração e reflexos para águas turvas.', unitCostCents: 330, referencePriceCents: 790 },
  { id: 'p-ac-popper', name: 'Popper de superfície 7 cm', category: 'amostras', modalities: AC, description: 'Para manhãs calmas junto a margens com sombra.', unitCostCents: 360, referencePriceCents: 890 },
  { id: 'p-ac-offset', name: 'Anzóis offset 3/0 (10 un.)', category: 'anzois', modalities: AC, description: 'Montagem texas anti-enrocamento.', unitCostCents: 140, referencePriceCents: 390 },
  { id: 'p-ac-bullet', name: 'Chumbos bala em tungsténio 7 g (4 un.)', category: 'chumbos', modalities: AC, description: 'Perfil compacto para atravessar vegetação.', unitCostCents: 420, referencePriceCents: 990 },
  { id: 'p-ac-fluoro', name: 'Fluorocarbono 0,28 mm, 50 m', category: 'linhas', modalities: AC, description: 'Baixa visibilidade em águas claras.', unitCostCents: 540, referencePriceCents: 1290, featured: true },
  // Comuns
  { id: 'p-all-fluoro35', name: 'Fluorocarbono 0,35 mm, 50 m', category: 'linhas', modalities: ['spinning-mar', 'surfcasting'], description: 'Terminal resistente à abrasão em rocha.', unitCostCents: 590, referencePriceCents: 1390 },
  { id: 'p-all-pliers', name: 'Alicate de abrir argolas', category: 'acessorios', modalities: ALL, description: 'Troca de argolas e triplos sem estragar as unhas.', unitCostCents: 390, referencePriceCents: 950, featured: true },
  { id: 'p-all-box', name: 'Caixa organizadora 20 x 12 cm', category: 'organizacao', modalities: ALL, description: 'Divisórias amovíveis para pequenos acessórios.', unitCostCents: 310, referencePriceCents: 790 },
  { id: 'p-all-towel', name: 'Toalha de pesca com mosquetão', category: 'acessorios', modalities: ALL, description: 'Para manter as mãos secas e limpas durante a sessão.', unitCostCents: 250, referencePriceCents: 690 },
  { id: 'p-all-knots', name: 'Cartão de nós essenciais, impermeável', category: 'acessorios', modalities: ALL, description: 'Seis nós explicados passo a passo.', unitCostCents: 60, referencePriceCents: 250 },
];

export const SEED_PRODUCTS: Product[] = raw.map((p) => ({ stock: 120, ...p }));

export const SEED_REWARD_ITEMS: RewardItem[] = [
  { id: 'rw1-cutter', level: 1, name: 'Cortador de linha retrátil', description: 'Preso ao colete ou à mochila, sempre à mão.', modalities: ALL, stock: 40 },
  { id: 'rw1-snaps', level: 1, name: 'Snaps de troca rápida, gama reforçada (20 un.)', description: 'Para quem troca de amostra muitas vezes.', modalities: ['spinning-mar', 'achiga'], stock: 25 },
  { id: 'rw1-lights', level: 1, name: 'Luzes químicas (20 un.) e suporte de ponteira', description: 'Pesca noturna na praia com sinalização clara.', modalities: SC, stock: 25 },
  { id: 'rw2-rock', level: 2, name: 'Conjunto de 3 amostras para rocha', description: 'Minnow, stickbait e jig em tons naturais.', modalities: SP, stock: 15 },
  { id: 'rw2-beach', level: 2, name: 'Conjunto de consumíveis de praia', description: 'Chumbos, destorcedores, anzóis e elástico para várias saídas.', modalities: SC, stock: 15 },
  { id: 'rw2-softs', level: 2, name: 'Sortido de vinis para achigã (30 un.)', description: 'Craws, worms e shads em cores para água clara e turva.', modalities: AC, stock: 15 },
  { id: 'rw2-fluoro', level: 2, name: 'Bobina de fluorocarbono 0,40 mm, 100 m', description: 'Terminais resistentes para rocha e praia.', modalities: ['spinning-mar', 'surfcasting'], stock: 10 },
  { id: 'rw3-box', level: 3, name: 'Caixa organizadora estanque, tamanho grande', description: 'Proteção contra água e salitre para o material mais usado.', modalities: ALL, stock: 8 },
  { id: 'rw3-rockbag', level: 3, name: 'Bolsa de cintura para rocha com 2 caixas', description: 'Mãos livres para mudar de pesqueiro.', modalities: SP, stock: 5 },
  { id: 'rw3-surfkit', level: 3, name: 'Conjunto especial de surfcasting', description: 'Bolsa de baixadas com 12 montagens prontas e chumbos variados.', modalities: SC, stock: 5 },
  { id: 'rw3-bass', level: 3, name: 'Conjunto especial de achigã', description: 'Caixa dupla com vinis, anzóis offset e chumbos bala.', modalities: AC, stock: 5 },
];

export const SEED_CHALLENGES: Challenge[] = [
  { id: 'ch-guide', kind: 'read_guide', title: 'Consultar um guia', description: 'Lê até ao fim um dos guias da secção Aprender e marca-o como lido.', badge: 'Leitor de maré' },
  { id: 'ch-rig', kind: 'try_rig', title: 'Experimentar uma montagem', description: 'Escolhe uma montagem dos guias e confirma que a experimentaste.', badge: 'Mãos na linha' },
  { id: 'ch-trip', kind: 'log_trip', title: 'Registar uma saída de pesca', description: 'Regista uma saída de demonstração: data, local e o que correu bem.', badge: 'Diário de bordo' },
];
