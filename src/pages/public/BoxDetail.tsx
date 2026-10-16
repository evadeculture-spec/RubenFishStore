import { useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { Badge, LinkButton, RadioCards, SectionHeading } from '../../components/ui';
import { ModalityArt, PlanBoxArt, ProductArt } from '../../components/art';
import { MilestoneTrack, PriceSummary, BackLink } from '../../components/commerce';
import { PastEditions } from '../../components/PastEditions';
import { Faq } from '../../components/Faq';
import { FAQ } from '../../content/faq';
import { EXPERIENCE, FREQUENCIES, MODALITIES, MODALITY_ORDER, PLAN_ORDER, PLANS, PRODUCT_CATEGORIES } from '../../config/business';
import type { Modality, PurchaseMode } from '../../domain/types';
import { useDemo } from '../../store/store';
import { checkoutUrl, parseModality, parseMode, parsePlan } from '../../utils/selection';
import { cx } from '../../utils/cx';

const EXPECT: Record<Modality, string[]> = {
  'spinning-mar': ['Amostras de superfície e de meia-água', 'Vinis e cabeçotes para fundo de rocha', 'Terminais e snaps resistentes ao salitre'],
  surfcasting: ['Anzóis e baixadas para isco natural', 'Chumbos adequados a areia e corrente', 'Acessórios para iscar e pesca noturna'],
  achiga: ['Vinis para montagens texas, wacky e jig', 'Amostras duras de superfície e de mergulho', 'Anzóis offset, chumbos bala e fluorocarbono'],
};

export function BoxDetail() {
  const { planId: rawPlan } = useParams();
  const [params, setParams] = useSearchParams();
  const data = useDemo();
  const planId = parsePlan(rawPlan);
  const modality = parseModality(params.get('modalidade'));
  const mode = parseMode(params.get('modo'));
  const plan = PLANS[planId];

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    next.set(k, v);
    setParams(next, { replace: true });
  };

  const examples = data.products
    .filter((p) => p.modalities.includes(modality) && p.category !== 'organizacao')
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    .slice(0, 6);
  const rewards = data.rewardItems.filter((r) => r.modalities.includes(modality));

  return (
    <div className="container-page py-10 sm:py-14">
      <BackLink to={`/planos?plano=${planId}&modalidade=${modality}&modo=${mode}`}>Voltar aos planos</BackLink>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="min-w-0">
          <div className="card overflow-hidden">
            <div className="relative">
              <ModalityArt modality={modality} className="aspect-[16/8] w-full" />
              <PlanBoxArt planId={planId} className="absolute bottom-3 right-3 h-24 w-28 drop-shadow-lg" />
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                <Badge tone="dark">Plano {plan.name}</Badge>
                <Badge tone="tide">{MODALITIES[modality].label}</Badge>
              </div>
              <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Box {plan.name} · {MODALITIES[modality].short}</h1>
              <p className="mt-2 text-lg text-ink-soft">{plan.tagline}</p>
            </div>
          </div>

          <section className="mt-10" aria-labelledby="esperar">
            <h2 id="esperar" className="text-2xl font-semibold">O que podes esperar</h2>
            <p className="mt-2 text-ink-soft">
              <strong className="text-abyss-900">{plan.itemsRange[0]} a {plan.itemsRange[1]} artigos</strong> por box (quantidade indicativa)
              {plan.featuredItems > 0 ? `, com ${plan.featuredItems} produto${plan.featuredItems > 1 ? 's' : ''} principa${plan.featuredItems > 1 ? 'is' : 'l'}` : ''}. O conteúdo exato é surpresa.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <ul className="card space-y-2 p-5">
                <li className="text-sm font-bold uppercase tracking-wide text-ink-muted">No plano {plan.name}</li>
                {plan.selection.map((s) => (
                  <li key={s} className="flex gap-2 text-[15px]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-tide-600" aria-hidden />{s}</li>
                ))}
              </ul>
              <ul className="card space-y-2 p-5">
                <li className="text-sm font-bold uppercase tracking-wide text-ink-muted">Para {MODALITIES[modality].label.toLowerCase()}</li>
                {EXPECT[modality].map((s) => (
                  <li key={s} className="flex gap-2 text-[15px]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-tide-600" aria-hidden />{s}</li>
                ))}
              </ul>
            </div>
            <p className="mt-3 text-sm text-ink-muted">
              A seleção tem em conta a experiência indicada ({Object.values(EXPERIENCE).map((e) => e.label.toLowerCase()).join(', ')}) e as categorias que preferes evitar.
            </p>
          </section>

          <section className="mt-10" aria-labelledby="exemplos">
            <h2 id="exemplos" className="text-2xl font-semibold">Exemplos de produtos que podem surgir</h2>
            <p className="mt-2 text-ink-soft">Produtos fictícios do catálogo de demonstração, compatíveis com a modalidade.</p>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {examples.map((p) => (
                <li key={p.id} className="card p-3">
                  <ProductArt category={p.category} className="aspect-square w-full" />
                  <p className="mt-2 text-sm font-semibold leading-snug">{p.name}</p>
                  <p className="text-xs text-ink-muted">{PRODUCT_CATEGORIES[p.category]}</p>
                  {p.featured && <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-tide-600">Pode surgir como produto principal</p>}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10" aria-labelledby="anteriores">
            <h2 id="anteriores" className="mb-4 text-2xl font-semibold">Edições anteriores desta combinação</h2>
            <PastEditions initialModality={modality} planId={planId} lockModality />
          </section>

          <section className="mt-10" aria-labelledby="recomp">
            <h2 id="recomp" className="text-2xl font-semibold">Recompensas associadas</h2>
            <p className="mt-2 text-ink-soft">Cada box entregue conta para os marcos. Opções disponíveis para {MODALITIES[modality].label.toLowerCase()}:</p>
            <MilestoneTrack count={0} />
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {rewards.map((r) => (
                <li key={r.id} className="flex items-start gap-2 rounded-xl bg-white p-3 ring-1 ring-sand-300">
                  <Badge tone="dark">Nível {r.level}</Badge>
                  <span className="text-sm font-semibold">{r.name}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10" aria-labelledby="faq-box">
            <SectionHeading id="faq-box" title="Perguntas sobre esta box" />
            <Faq items={FAQ.filter((f) => f.topics.some((t) => t === 'conteudo' || t === 'entrega' || t === 'subscricao'))} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="comprar-h">
          <div className="card space-y-5 p-5 sm:p-6">
            <h2 id="comprar-h" className="text-xl font-semibold">Configurar e comprar</h2>
            <div>
              <p className="mb-2 text-sm font-semibold">Plano</p>
              <div role="group" aria-label="Plano" className="grid grid-cols-3 gap-2">
                {PLAN_ORDER.map((p) => (
                  <LinkButton
                    key={p}
                    to={`/box/${p}?modalidade=${modality}&modo=${mode}`}
                    replace
                    size="sm"
                    variant={p === planId ? 'dark' : 'secondary'}
                    aria-current={p === planId ? 'page' : undefined}
                  >
                    {PLANS[p].name}
                  </LinkButton>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="bd-mod" className="mb-2 block text-sm font-semibold">Modalidade</label>
              <select id="bd-mod" className="input" value={modality} onChange={(e) => set('modalidade', e.target.value)}>
                {MODALITY_ORDER.map((m) => <option key={m} value={m}>{MODALITIES[m].label}</option>)}
              </select>
            </div>
            <RadioCards
              name="bd-modo"
              legend="Frequência"
              columns={1}
              value={mode}
              onChange={(v) => set('modo', v)}
              options={[
                { value: 'mensal' as PurchaseMode, label: FREQUENCIES.mensal.label },
                { value: 'bimestral' as PurchaseMode, label: FREQUENCIES.bimestral.label },
                { value: 'avulsa' as PurchaseMode, label: 'Compra avulsa, sem subscrição' },
              ]}
            />
            <PriceSummary planId={planId} mode={mode} className={cx('border-t border-sand-300 pt-4')} />
            <LinkButton to={checkoutUrl(planId, modality, mode)} size="lg" className="w-full">
              {mode === 'avulsa' ? 'Comprar esta box' : 'Subscrever'} <ArrowRight className="h-5 w-5" aria-hidden />
            </LinkButton>
            <p className="text-center text-xs text-ink-muted">Demonstração: nenhuma cobrança será efetuada.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
