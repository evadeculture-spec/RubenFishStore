import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Gift, PackageOpen, PauseCircle, Truck, UserRound } from 'lucide-react';
import { HeroArt, ModalityArt } from '../../components/art';
import { LinkButton, SectionHeading } from '../../components/ui';
import { PlanCard } from '../../components/PlanCard';
import { PastEditions } from '../../components/PastEditions';
import { Faq } from '../../components/Faq';
import { MilestoneTrack } from '../../components/commerce';
import { FAQ } from '../../content/faq';
import { MODALITIES, MODALITY_ORDER, PLAN_ORDER, PLANS } from '../../config/business';
import { formatEUR } from '../../utils/money';
import { boxUrl } from '../../utils/selection';

const STEPS = [
  { icon: UserRound, title: 'Diz-nos como pescas', text: 'Escolhe a modalidade e o teu nível de experiência. Se quiseres, indica o que preferes e o que dispensas.' },
  { icon: PackageOpen, title: 'Recebe a tua seleção surpresa', text: 'Cada edição é preparada para a tua modalidade, com um guia curto para tirares partido de cada artigo.' },
  { icon: Gift, title: 'Avança e ganha recompensas', text: 'Ao fim de 3, 6 e 12 boxes entregues, escolhes um produto extra. Sem sorteios: as regras são conhecidas.' },
];

export function Home() {
  return (
    <>
      <section className="on-dark relative overflow-hidden bg-abyss-800 text-sand-100">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,163,150,0.28),transparent_55%)]" />
        <div className="container-page relative grid items-center gap-8 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div className="animate-fade-up">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-tide-200">
              <Compass className="h-4 w-4" aria-hidden /> Boxes surpresa de pesca · Portugal Continental
            </p>
            <h1 className="text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              A tua próxima descoberta de pesca começa aqui.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-sand-100/85">
              Todos os meses, ou de dois em dois, uma seleção de material escolhida para a forma como pescas: spinning de mar, surfcasting ou achigã. Experimenta coisas novas sem teres de adivinhar o que comprar.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton to="/planos" size="lg" className="bg-tide-400 text-abyss-900 hover:bg-tide-300">
                Descobrir a minha box <ArrowRight className="h-5 w-5" aria-hidden />
              </LinkButton>
              <LinkButton to="/demonstracao" size="lg" variant="light" className="bg-transparent text-sand-100 ring-1 ring-sand-100/40 hover:bg-white/10">
                Experimentar demonstração
              </LinkButton>
            </div>
            <ul className="mt-8 grid gap-2 text-sm text-sand-100/80 sm:grid-cols-3">
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-tide-300" aria-hidden /> Desde {formatEUR(PLANS.essencial.priceCents)} por box</li>
              <li className="flex items-center gap-2"><PauseCircle className="h-4 w-4 text-tide-300" aria-hidden /> Pausa ou cancela online</li>
              <li className="flex items-center gap-2"><Gift className="h-4 w-4 text-tide-300" aria-hidden /> Recompensas garantidas</li>
            </ul>
          </div>
          <HeroArt className="mx-auto w-full max-w-md lg:max-w-none" />
        </div>
      </section>

      <section className="container-page py-16 sm:py-20" aria-labelledby="passos">
        <SectionHeading id="passos" eyebrow="Como funciona" title="Três passos, sem complicações" />
        <ol className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-tide-50 text-tide-600">
                  <s.icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-display text-sm font-bold text-ink-muted">Passo {i + 1}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6">
          <Link to="/como-funciona" className="link">Ver todos os detalhes</Link>
        </p>
      </section>

      <section className="bg-sand-200/60 py-16 sm:py-20" aria-labelledby="modalidades">
        <div className="container-page">
          <SectionHeading id="modalidades" eyebrow="Escolhe a modalidade" title="Onde gostas de pescar?" intro="A modalidade define os produtos, os exemplos e as recompensas a que tens acesso. Podes mudá-la mais tarde." />
          <ul className="grid gap-5 md:grid-cols-3">
            {MODALITY_ORDER.map((m) => (
              <li key={m}>
                <Link to={`/planos?modalidade=${m}`} className="card group block h-full overflow-hidden transition-shadow hover:shadow-lift">
                  <ModalityArt modality={m} className="aspect-[16/10] w-full" />
                  <div className="p-5">
                    <h3 className="flex items-center justify-between text-xl font-semibold">
                      {MODALITIES[m].label}
                      <ArrowRight className="h-5 w-5 text-tide-600 transition-transform group-hover:translate-x-1" aria-hidden />
                    </h3>
                    <p className="mt-2 text-ink-soft">{MODALITIES[m].description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20" aria-labelledby="planos-h">
        <SectionHeading id="planos-h" eyebrow="Planos" title="Três formas de receber a tua box" intro="O preço é o mesmo na subscrição mensal, de dois em dois meses ou numa compra avulsa. Os planos diferem na seleção e na quantidade indicativa de artigos." />
        <div className="grid gap-5 lg:grid-cols-3">
          {PLAN_ORDER.map((p) => (
            <PlanCard
              key={p}
              planId={p}
              footer={
                <div className="flex flex-col gap-2">
                  <LinkButton to={`/planos?plano=${p}`} variant={PLANS[p].highlight ? 'primary' : 'dark'} className="w-full">
                    Escolher {PLANS[p].name}
                  </LinkButton>
                  <Link to={boxUrl(p, 'spinning-mar')} className="link text-center text-sm">Ver o que inclui</Link>
                </div>
              }
            />
          ))}
        </div>
      </section>

      <section className="on-dark bg-abyss-800 py-16 text-sand-100 sm:py-20" aria-labelledby="rec-h">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow mb-2 text-tide-300">Recompensas</p>
            <h2 id="rec-h" className="text-3xl font-semibold text-white sm:text-4xl">Marcos garantidos, sem sorteios</h2>
            <p className="mt-4 text-lg leading-relaxed text-sand-100/85">
              Cada box entregue conta uma vez, seja de subscrição ou avulsa. Ao chegares aos marcos, escolhes um produto compatível com a tua modalidade e ele segue na próxima box.
            </p>
            <LinkButton to="/recompensas" variant="light" className="mt-6">
              Conhecer o programa
            </LinkButton>
          </div>
          <div className="rounded-2xl bg-sand-100 p-5 text-ink sm:p-6">
            <p className="text-sm font-semibold text-ink-soft">Exemplo: cliente com 4 boxes entregues</p>
            <MilestoneTrack count={4} />
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20" aria-labelledby="edicoes-h">
        <SectionHeading id="edicoes-h" eyebrow="Edições anteriores" title="O que já saiu numa box Explorador" intro="Exemplos fictícios, para teres uma ideia do tipo de seleção. O conteúdo da próxima edição é sempre surpresa." />
        <PastEditions />
      </section>

      <section className="container-page pb-6" aria-labelledby="perguntas-h">
        <div id="perguntas" className="scroll-mt-24" />
        <SectionHeading id="perguntas-h" eyebrow="Perguntas frequentes" title="Antes de começares" />
        <Faq items={FAQ} />
      </section>
    </>
  );
}
