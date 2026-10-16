export interface FaqItem {
  q: string;
  a: string;
  topics: ('geral' | 'subscricao' | 'entrega' | 'recompensas' | 'conteudo')[];
}

export const FAQ: FaqItem[] = [
  { q: 'Isto é uma loja real?', a: 'Não. É uma demonstração para testar a ideia da Maré Box. Todos os dados são fictícios, não há pagamentos reais nem envios reais.', topics: ['geral'] },
  { q: 'Sei o que vem na próxima box?', a: 'Não: o conteúdo é surpresa. Sabes o tipo de seleção, a quantidade indicativa de artigos e que tudo é escolhido para a tua modalidade. Podes ver exemplos de edições anteriores (fictícias).', topics: ['conteudo', 'geral'] },
  { q: 'Como escolhem os produtos para mim?', a: 'Com regras simples e explícitas: cada edição é preparada por modalidade e plano, e se indicares categorias a evitar, esses artigos são trocados por outro produto compatível com preço de referência semelhante. Não usamos inteligência artificial.', topics: ['conteudo'] },
  { q: 'Posso pausar ou cancelar quando quiser?', a: 'Sim, na área "A minha subscrição". Uma subscrição pausada ou cancelada não gera novas cobranças. Ao retomar, é agendada uma nova data de cobrança.', topics: ['subscricao'] },
  { q: 'Se mudar de plano, quando muda o preço?', a: 'As alterações de plano, modalidade e frequência aplicam-se ao próximo ciclo. A encomenda já paga mantém-se igual e não há acertos a meio do ciclo.', topics: ['subscricao'] },
  { q: 'Posso saltar um mês?', a: 'Sim. Ao saltar a próxima entrega, esse ciclo não é cobrado nem enviado. O teu progresso nas recompensas mantém-se.', topics: ['subscricao', 'recompensas'] },
  { q: 'Para onde enviam?', a: 'Neste piloto, apenas para Portugal Continental. No plano Essencial os portes são 3,90 €; no Explorador e no Premium estão incluídos.', topics: ['entrega'] },
  { q: 'Como funcionam as recompensas?', a: 'Ao fim de 3, 6 e 12 boxes entregues desbloqueias uma recompensa garantida. Escolhes um produto entre as opções compatíveis com a tua modalidade e ele segue na próxima box. Não há sorteios.', topics: ['recompensas'] },
  { q: 'As compras avulsas contam para as recompensas?', a: 'Sim. Qualquer box com pagamento confirmado e entregue conta uma vez, seja de subscrição ou avulsa.', topics: ['recompensas'] },
  { q: 'Os preços incluem IVA?', a: 'Sim, todos os preços apresentados incluem IVA. São valores de demonstração.', topics: ['geral'] },
];
