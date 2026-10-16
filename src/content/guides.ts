import type { Modality } from '../domain/types';

export interface Guide {
  id: string;
  modality: Modality | 'todas';
  title: string;
  minutes: number;
  summary: string;
  level: 'Iniciante' | 'Intermédio' | 'Todos';
  sections: { heading: string; text?: string; steps?: string[] }[];
  /** Montagem ilustrada, de cima (linha principal) para baixo (anzol/amostra). */
  rig?: { name: string; parts: string[] };
}

export const GUIDES: Guide[] = [
  {
    id: 'no-fg',
    modality: 'spinning-mar',
    title: 'Ligar trançado a fluorocarbono: nó FG simplificado',
    minutes: 6,
    level: 'Intermédio',
    summary: 'Uma ligação fina que passa bem nos passadores, ideal para lançar amostras leves.',
    sections: [
      { heading: 'Porque usar um terminal', text: 'O trançado lança longe e transmite bem as picadas, mas é visível e pouco resistente à abrasão. Um metro a metro e meio de fluorocarbono protege a ponta da linha junto às rochas.' },
      { heading: 'Passo a passo', steps: ['Mantém o fluorocarbono esticado entre a boca e a mão.', 'Cruza o trançado à volta do fluorocarbono 16 a 20 vezes, alternando por cima e por baixo.', 'Prende com dois meios-nós e aperta molhando a linha.', 'Termina com 4 a 6 meios-nós só no trançado e corta as pontas rente.'] },
      { heading: 'Erro comum', text: 'Apertar a seco aquece a linha e enfraquece o nó. Molha sempre antes de puxar.' },
    ],
    rig: { name: 'Montagem de spinning com terminal', parts: ['Linha trançada PE 1.0', 'Nó FG', 'Terminal fluorocarbono 0,35 mm (1–1,5 m)', 'Snap reforçado', 'Amostra minnow 120 mm'] },
  },
  {
    id: 'vinil-cabecote',
    modality: 'spinning-mar',
    title: 'Montar um vinil em cabeçote sem o deixar torto',
    minutes: 4,
    level: 'Iniciante',
    summary: 'Um vinil direito nada de forma natural e evita torções na linha.',
    sections: [
      { heading: 'Medir antes de furar', text: 'Encosta o anzol ao vinil por fora e marca com a unha o ponto onde a ponta deve sair.' },
      { heading: 'Passo a passo', steps: ['Entra pelo centro da cabeça do vinil.', 'Acompanha a curva do anzol pelo interior do corpo.', 'Sai no ponto marcado, mantendo o vinil alinhado.', 'Encosta bem ao cabeçote; se enrugar, recua um pouco.'] },
      { heading: 'Recolha', text: 'Começa com recolha lenta e constante junto ao fundo e vai acrescentando pequenos toques de ponteira.' },
    ],
    rig: { name: 'Vinil em cabeçote', parts: ['Terminal fluorocarbono', 'Nó Palomar', 'Cabeçote 15 g', 'Vinil "sand eel" 12 cm'] },
  },
  {
    id: 'baixada-2-anzois',
    modality: 'surfcasting',
    title: 'Baixada de dois anzóis para fundo de areia',
    minutes: 7,
    level: 'Iniciante',
    summary: 'A montagem mais versátil para começar no surfcasting.',
    sections: [
      { heading: 'Material', text: 'Shock leader, destorcedores com rolamento, fio de baixada 0,30 mm, anzóis n.º 2 e um chumbo de garras ou pirâmide conforme a corrente.' },
      { heading: 'Passo a passo', steps: ['Ata um destorcedor no fim do shock leader.', 'Faz duas derivações de 40 cm, separadas por 60 cm.', 'Ata um anzol em cada derivação com nó de anzol de pá ou de olhal.', 'No fim, prende o chumbo com um snap para trocar facilmente.'] },
      { heading: 'Iscar', text: 'Usa fio elástico para segurar iscos moles: duas ou três voltas bastam.' },
    ],
    rig: { name: 'Baixada de dois anzóis', parts: ['Shock leader cónico', 'Destorcedor com rolamento', 'Derivação 1 · anzol n.º 2', 'Derivação 2 · anzol n.º 2', 'Snap', 'Chumbo de garras 150 g'] },
  },
  {
    id: 'ler-praia',
    modality: 'surfcasting',
    title: 'Ler a praia: onde lançar',
    minutes: 5,
    level: 'Todos',
    summary: 'Cavas, correntes de retorno e bancos de areia contam mais do que a distância.',
    sections: [
      { heading: 'O que procurar', steps: ['Zonas onde a onda rebenta menos indicam mais profundidade.', 'Espuma a sair para o largo denuncia correntes de retorno.', 'Lança para a orla das cavas, não para o centro.'] },
      { heading: 'Maré', text: 'As duas horas antes e depois da preia-mar costumam ser as mais ativas, mas cada praia tem o seu ritmo. Regista as tuas saídas para comparar.' },
    ],
  },
  {
    id: 'texas',
    modality: 'achiga',
    title: 'Montagem texas para zonas com vegetação',
    minutes: 6,
    level: 'Iniciante',
    summary: 'Anti-enrocamento: o vinil atravessa ervas e troncos sem prender.',
    sections: [
      { heading: 'Material', text: 'Anzol offset 3/0, chumbo bala de 7 g, vinil "worm" ou "craw".' },
      { heading: 'Passo a passo', steps: ['Enfia o chumbo bala na linha, com a ponta virada para a cana.', 'Ata o anzol offset com nó Palomar.', 'Entra 1 cm na cabeça do vinil e sai pelo lado.', 'Roda o anzol e esconde a ponta dentro do corpo do vinil.'] },
      { heading: 'Ação', text: 'Deixa cair ao fundo, levanta a ponteira em dois toques e volta a deixar cair. A maioria das picadas acontece na descida.' },
    ],
    rig: { name: 'Montagem texas', parts: ['Fluorocarbono 0,28 mm', 'Chumbo bala 7 g', 'Nó Palomar', 'Anzol offset 3/0', 'Vinil "craw" 9 cm'] },
  },
  {
    id: 'crank',
    modality: 'achiga',
    title: 'Crankbait: escolher a profundidade certa',
    minutes: 4,
    level: 'Intermédio',
    summary: 'A pala define a profundidade; a recolha define o comportamento.',
    sections: [
      { heading: 'Regra simples', text: 'Escolhe um crank que toque ligeiramente no fundo ou na vegetação: os toques provocam ataques de reação.' },
      { heading: 'Recolhas a experimentar', steps: ['Constante e média, para prospetar.', 'Para-arranca, junto a estruturas.', 'Lenta, em água fria.'] },
    ],
  },
  {
    id: 'nos-essenciais',
    modality: 'todas',
    title: 'Três nós que resolvem quase tudo',
    minutes: 5,
    level: 'Todos',
    summary: 'Palomar, clinch melhorado e união de duas linhas.',
    sections: [
      { heading: 'Palomar', text: 'Dobra a linha, passa no olhal, faz um nó simples, passa o anzol pela laçada e aperta molhando.' },
      { heading: 'Clinch melhorado', text: 'Cinco a sete voltas, passa a ponta pelo primeiro anel e depois pela laçada grande.' },
      { heading: 'União de linhas', text: 'Para diâmetros semelhantes, o nó duplo de pescador é fácil de memorizar.' },
    ],
  },
];

export function guidesFor(modality: Modality): Guide[] {
  return GUIDES.filter((g) => g.modality === modality || g.modality === 'todas');
}
