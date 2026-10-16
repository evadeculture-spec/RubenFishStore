# Maré Box — demonstração

Plataforma de demonstração para um negócio português de **mystery boxes de pesca por subscrição**, com gamificação e recompensas em produto. Português de Portugal, euro, Portugal Continental.

> **Modo demonstração.** Todos os dados são fictícios. Não há pagamentos reais, envios reais nem recolha de dados pessoais. Tudo fica guardado no `localStorage` do navegador. Não precisa de credenciais, base de dados nem serviços externos.

## Instalar e executar

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev          # desenvolvimento → http://localhost:5173
```

Versão de produção local:

```bash
npm run build
npm run preview      # → http://localhost:4173
```

Verificações:

```bash
npm run typecheck    # TypeScript
npm run lint         # ESLint
npm test             # testes das regras de negócio (Vitest)
npm run e2e          # percurso completo no browser (requer `npm run preview` a correr)
```

`npm run e2e` usa `playwright-core` com um Chromium já instalado. Caminho por omissão: `/opt/pw-browsers/...`; noutro ambiente, define `CHROMIUM_PATH=/caminho/para/chrome`. As capturas de ecrã (desktop, 768 px e 360 px) ficam em `e2e-output/`.

## Como demonstrar

- **Ferramentas de demonstração**: botão flutuante no canto inferior esquerdo (em telemóvel: "Demo") ou ligação no rodapé. Permite:
  - mudar o cliente em visualização;
  - carregar cenários: cliente novo, ou com 2, 5 ou 11 caixas elegíveis;
  - simular a próxima renovação;
  - avançar uma encomenda até à entrega;
  - controlar o relógio de demonstração (+1 dia, +1 semana, +1 mês);
  - processar as renovações vencidas;
  - repor os dados (pede confirmação).
- **Ver como cliente / Ver como gestor**: seletor no cabeçalho, ou no menu em telemóvel. É só para a demonstração: não é autenticação.
- A página `/demonstracao` tem um percurso sugerido e um atalho direto para o cenário de recompensas.

### Primeiro desbloqueio de recompensa (≈1 minuto)

1. Abre as Ferramentas de demonstração e carrega **"Cliente com 2 caixas elegíveis"**. A conta mostra "Falta 1 box para desbloqueares a próxima recompensa."
2. Carrega em **"Simular próxima renovação"**. O relógio avança para a data de cobrança e é criada uma nova encomenda.
3. Carrega em **"Avançar até à entrega"**. A encomenda passa por preparação, expedição e entrega, o painel fecha-se e aparece a celebração do nível 1.
4. Carrega em **"Escolher recompensa"**, escolhe um produto compatível e confirma em **"Reservar para a próxima box"**. A recompensa fica *Reservada* e o stock disponível desce.
5. Repete os passos 2 e 3. Na expedição, a recompensa fica associada à encomenda; na entrega, passa a *Recebida*.

Os cenários de 5 e 11 caixas fazem o mesmo para os níveis 2 e 3.

## Oferta (configuração central)

Tudo em `src/config/business.ts`, com valores em cêntimos e IVA incluído:

| Plano | Preço por box | Portes | Artigos indicativos |
|---|---|---|---|
| Essencial | 19,90 € | 3,90 € | 4–5 |
| Explorador | 39,90 € | incluídos | 6–8, 1 produto principal |
| Premium | 59,90 € | incluídos | 8–10, 2 produtos principais |

- Frequências: mensal ou de dois em dois meses, mais compra avulsa. Sem descontos por frequência.
- Modalidades: spinning de mar, surfcasting e achigã. Níveis de experiência: iniciante, intermédio e experiente.

## Regras principais

**Subscrição**
- Alterar plano, modalidade ou frequência aplica-se ao próximo ciclo, sem acertos financeiros.
- Saltar a próxima entrega: esse ciclo avança sem gerar encomenda.
- Pausada ou cancelada, a subscrição não gera cobranças. Ao retomar, a próxima cobrança fica para daqui a 3 dias (`resumeDelayDays`).
- Cada ciclo tem uma `cycleKey` única, por isso a mesma renovação nunca gera duas encomendas.

**Checkout**
- Cinco passos: revisão, perfil, morada fictícia, pagamento simulado e confirmação.
- O consentimento de renovação começa por marcar.
- O código postal tem de ser do Continente (1000-000 a 8999-999).
- Uma chave de idempotência e um bloqueio do botão impedem encomendas duplicadas por duplo clique.
- A encomenda nasce em "Pagamento simulado confirmado".

**Encomendas**
- Estados: pago → em preparação → expedida → entregue. Só se avança para o estado seguinte.
- Na expedição, a encomenda recebe a edição pronta mais recente para a modalidade e o plano, guardada como cópia (*snapshot*).
- Os artigos de categorias que o cliente quer evitar são trocados por um produto compatível de preço de referência semelhante. É uma regra explícita, sem IA.
- O conteúdo só é revelado após a expedição.

**Fidelização** (marcos garantidos aos 3, 6 e 12 boxes)
- Contam encomendas com pagamento confirmado e entrega concluída, uma única vez cada (registo de eventos `box_delivered`). As compras avulsas também contam.
- Cada marco gera um evento `milestone_unlocked` uma única vez. Saltar, pausar ou cancelar não apaga nada.
- Cada nível só pode ser resgatado uma vez, escolhendo um produto compatível com a modalidade.
- A reserva reduz o stock disponível (disponível = stock − reservadas).
- Sem próxima box prevista, a recompensa fica disponível para uma compra futura.
- Expedição: recompensa *A caminho* e stock físico −1. Entrega: recompensa *Recebida*.

**Desafios**
- Ler um guia, experimentar uma montagem e registar uma saída de pesca.
- Dão apenas distintivos visuais, sem valor monetário.

**Gestão**
- Os indicadores são calculados a partir dos mesmos dados que alimentam as listas (`src/domain/kpis.ts`).
- Receita mensal equivalente: mensal = preço do plano; de dois em dois meses = metade do preço. Excluem-se avulsas, pausadas, canceladas e portes. É receita bruta simulada, com IVA.

## Arquitetura

```
src/
  config/business.ts   oferta editável (planos, portes, marcos, modalidades)
  domain/              tipos e regras de negócio puras (pricing, checkout, subscriptions,
                       renewals, orders, loyalty, rewards, editions, catalog, kpis, challenges)
  data/                catálogo e edições iniciais, cenários, repositório localStorage
  store/               store mínimo (operações atómicas sobre cópia do estado) e hooks
  components/          interface partilhada (ui, Dialog, feedback, ilustrações SVG, ...)
  pages/public|account|admin
  content/             guias e FAQ
  tests/               testes Vitest das regras de maior risco
scripts/e2e.mjs        verificação no browser
```

- **Persistência**: chave `mare-box-demo` com `schemaVersion`. Dados ausentes, inválidos ou de outra versão são repostos com aviso.
- **Estado derivado**: contagens, estados de marcos, stock disponível e indicadores são calculados, não guardados.
- **Operações**: cada operação de negócio corre sobre uma cópia do estado e só é gravada se tiver sucesso, por isso não há estados parciais.
- **Imagens**: todas as ilustrações são SVG locais e as fontes vêm de `@fontsource`. Não há dependências remotas.

### Pontos de integração futuros (não implementados)

- `DemoRepository` (`src/data/repository.ts`): trocar o `localStorage` por uma API.
- `placeOrder` / `renewSubscription`: hoje confirmam o pagamento de imediato. Num backend real, a confirmação deve vir de um webhook do prestador de pagamentos.
- `transitionOrder`: ligar a um sistema de expedição e acompanhamento.
- O seletor cliente/gestor tem de ser substituído por autenticação e autorização.

## Limitações e decisões

- Um só navegador e um só "utilizador"; não há sincronização entre dispositivos.
- O relógio é de demonstração. As renovações só acontecem quando são simuladas ou processadas nas ferramentas.
- Cada cliente tem no máximo uma subscrição não cancelada. Para outra box, há a compra avulsa.
- Retomar agenda a cobrança para daqui a 3 dias. É uma hipótese configurável.
- Alterar a modalidade no perfil também pode alterar a subscrição (opção marcada por omissão, aplica-se ao próximo ciclo).
- A edição usada é a "pronta" mais recente até ao mês do relógio. Se não existir, a expedição é recusada com uma mensagem.
- O stock de produtos é descontado na expedição, mas nunca bloqueia (fica no mínimo em 0).
- Um resgate não pode ser anulado pelo cliente nesta versão.
- Os textos comerciais e legais são de demonstração.

## Antes de aceitar clientes reais

1. **Backend e base de dados**: persistência no servidor, transações, auditoria e cópias de segurança. As regras de `src/domain` passam para o servidor.
2. **Autenticação e autorização**: contas de cliente, perfis de gestão com permissões, recuperação de acesso e proteção do painel de gestão.
3. **Pagamentos**: prestador certificado (cartão, MB WAY, Multibanco), pagamentos recorrentes com autenticação forte (PSD2/SCA), webhooks, falhas de cobrança e novas tentativas, reembolsos e faturação certificada pela AT.
4. **Operações de envio**: transportadora, etiquetas, acompanhamento, devoluções, gestão de stock e compras a fornecedores, e calendário real de preparação das edições.
5. **Revisão comercial e legal**:
   - termos e condições, política de privacidade e cookies (RGPD);
   - informação pré-contratual e direito de livre resolução de 14 dias (DL 24/2014);
   - regras de renovação automática e cancelamento;
   - livro de reclamações eletrónico;
   - regras do programa de recompensas;
   - validação dos preços, portes e margens com custos reais;
   - revisão de todos os textos por quem conhece o mercado.
6. **Qualidade**: auditoria de acessibilidade com utilizadores reais e tecnologias de apoio, testes de carga, monitorização e analítica com consentimento.
