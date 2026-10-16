import { BookOpen, Gift, PackageOpen, Settings2, Truck, UserRound } from 'lucide-react';
import { LinkButton, PageHeader } from '../../components/ui';
import { SHIPPING, SUBSCRIPTION_RULES } from '../../config/business';

const BLOCKS = [
  {
    icon: UserRound,
    title: 'Perfil de pesca',
    body: [
      'Escolhes a modalidade (spinning de mar, surfcasting ou achigã) e o teu nível: iniciante, intermédio ou experiente.',
      'Opcionalmente, indicas categorias que preferes (por exemplo, amostras) e categorias que queres evitar (por exemplo, chumbos).',
    ],
  },
  {
    icon: PackageOpen,
    title: 'Seleção surpresa adequada à modalidade',
    body: [
      'Cada edição é preparada por modalidade e por plano. Só entram produtos compatíveis com a tua modalidade.',
      'Se indicaste uma categoria a evitar, esse artigo é trocado por outro produto compatível com preço de referência semelhante. É uma regra simples e transparente, sem inteligência artificial.',
    ],
  },
  {
    icon: Truck,
    title: 'Entrega',
    body: [
      `Nesta fase entregamos apenas em ${SHIPPING.region}. A expedição acontece, em regra, ${SHIPPING.daysToShip} dias após a cobrança.`,
      'Recebes atualizações de estado: pagamento confirmado, em preparação, expedida e entregue. O conteúdo da box só é revelado na área de cliente depois da expedição.',
    ],
  },
  {
    icon: BookOpen,
    title: 'Conteúdos de aprendizagem',
    body: [
      'Cada box traz guias curtos para usares os produtos: montagens, nós e dicas de recolha.',
      'Na área "Aprender" encontras guias organizados pela tua modalidade e desafios opcionais com distintivos, sem valor monetário.',
    ],
  },
  {
    icon: Gift,
    title: 'Recompensas',
    body: [
      'Aos 3, 6 e 12 boxes entregues desbloqueias uma recompensa garantida. Escolhes o produto entre as opções do nível, compatíveis com a tua modalidade.',
      'O produto fica reservado e segue na tua próxima box. Não há sorteios nem roletas.',
    ],
  },
  {
    icon: Settings2,
    title: 'Gestão da subscrição',
    body: [
      'Podes alterar plano, modalidade e frequência: as alterações aplicam-se ao próximo ciclo, sem acertos a meio.',
      `Podes saltar a próxima entrega, pausar, retomar (com nova cobrança agendada para ${SUBSCRIPTION_RULES.resumeDelayDays} dias depois) ou cancelar. Pausada ou cancelada, não há cobranças.`,
    ],
  },
];

export function HowItWorks() {
  return (
    <div className="container-page py-10 sm:py-14">
      <PageHeader eyebrow="Como funciona" title="Do perfil de pesca à tua porta" intro="Tudo o que acontece entre escolheres a box e recebê-la, explicado sem letras pequenas." />
      <ol className="grid gap-5 md:grid-cols-2">
        {BLOCKS.map((b, i) => (
          <li key={b.title} className="card p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-abyss-800 text-tide-300">
                <b.icon className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="text-xl font-semibold"><span className="sr-only">{i + 1}. </span>{b.title}</h2>
            </div>
            {b.body.map((p) => (
              <p key={p} className="mt-3 leading-relaxed text-ink-soft">{p}</p>
            ))}
          </li>
        ))}
      </ol>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <LinkButton to="/planos" size="lg">Escolher a minha box</LinkButton>
        <LinkButton to="/recompensas" size="lg" variant="secondary">Ver recompensas</LinkButton>
      </div>
    </div>
  );
}
