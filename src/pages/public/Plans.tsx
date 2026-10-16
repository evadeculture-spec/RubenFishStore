import { useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, CalendarClock, PauseCircle, SkipForward, XCircle } from 'lucide-react';
import { LinkButton, PageHeader, RadioCards, Badge } from '../../components/ui';
import { PlanCard } from '../../components/PlanCard';
import { PriceSummary, PlanSummaryLine } from '../../components/commerce';
import { ModalityArt } from '../../components/art';
import { FREQUENCIES, MODALITIES, MODALITY_ORDER, PLAN_ORDER, PLANS } from '../../config/business';
import type { Modality, PlanId, PurchaseMode } from '../../domain/types';
import { boxUrl, checkoutUrl, MODE_LABEL, parseModality, parseMode, parsePlan } from '../../utils/selection';
import { cx } from '../../utils/cx';

export function Plans() {
  const [params, setParams] = useSearchParams();
  const planId = parsePlan(params.get('plano'));
  const modality = parseModality(params.get('modalidade'));
  const mode = parseMode(params.get('modo'));

  const update = (patch: Partial<{ plano: PlanId; modalidade: Modality; modo: PurchaseMode }>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) next.set(k, v);
    setParams(next, { replace: true });
  };

  return (
    <div className="container-page py-10 sm:py-14">
      <PageHeader eyebrow="Planos e preços" title="Escolhe a tua box" intro="Três escolhas rápidas. Vês sempre o preço, os portes e o total antes de avançar." />

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="s1">
            <h2 id="s1" className="mb-3 text-xl font-semibold"><span className="text-tide-600">1.</span> Modalidade</h2>
            <RadioCards
              name="modalidade"
              legend="Modalidade"
              hideLegend
              value={modality}
              onChange={(v) => update({ modalidade: v })}
              options={MODALITY_ORDER.map((m) => ({
                value: m,
                label: MODALITIES[m].label,
                description: MODALITIES[m].description,
              }))}
            />
          </section>

          <section aria-labelledby="s2">
            <h2 id="s2" className="mb-3 text-xl font-semibold"><span className="text-tide-600">2.</span> Subscrição ou compra avulsa</h2>
            <RadioCards
              name="modo"
              legend="Frequência"
              hideLegend
              value={mode}
              onChange={(v) => update({ modo: v })}
              options={[
                { value: 'mensal' as PurchaseMode, label: FREQUENCIES.mensal.label, description: 'Renova todos os meses. Pausa, salta ou cancela quando quiseres.' },
                { value: 'bimestral' as PurchaseMode, label: FREQUENCIES.bimestral.label, description: 'Renova a cada dois meses, ao mesmo preço por box.' },
                { value: 'avulsa' as PurchaseMode, label: 'Compra avulsa', description: 'Uma só box, sem subscrição nem renovação.', aside: <Badge tone="sand">Sem compromisso</Badge> },
              ]}
            />
          </section>

          <section aria-labelledby="s3">
            <h2 id="s3" className="mb-3 text-xl font-semibold"><span className="text-tide-600">3.</span> Plano</h2>
            <fieldset>
              <legend className="sr-only">Plano</legend>
              <div className="grid gap-4 md:grid-cols-3">
                {PLAN_ORDER.map((p) => (
                  <PlanCard
                    key={p}
                    planId={p}
                    selected={p === planId}
                    footer={
                      <label className={cx('flex cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-2.5 font-semibold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-tide-400', p === planId ? 'border-tide-600 bg-tide-600 text-white' : 'border-abyss-800/20 text-abyss-800 hover:border-abyss-800/40')}>
                        <input type="radio" name="plano" value={p} checked={p === planId} onChange={() => update({ plano: p })} className="h-4 w-4 accent-white" />
                        {p === planId ? `${PLANS[p].name} selecionado` : `Selecionar ${PLANS[p].name}`}
                      </label>
                    }
                  />
                ))}
              </div>
            </fieldset>
          </section>

          <section aria-labelledby="gerir" className="card p-6">
            <h2 id="gerir" className="text-xl font-semibold">Pausar, saltar ou cancelar</h2>
            <p className="mt-2 text-ink-soft">Tudo se faz na área de cliente, sem telefonemas nem formulários.</p>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { icon: SkipForward, t: 'Saltar a próxima entrega', d: 'Esse ciclo não é cobrado nem enviado.' },
                { icon: PauseCircle, t: 'Pausar', d: 'Sem cobranças enquanto estiver pausada. Ao retomar, agendamos uma nova data.' },
                { icon: CalendarClock, t: 'Mudar plano ou frequência', d: 'Aplica-se ao próximo ciclo, sem acertos a meio.' },
                { icon: XCircle, t: 'Cancelar', d: 'Não há novas cobranças. O progresso e as recompensas conquistadas mantêm-se.' },
              ].map((x) => (
                <li key={x.t} className="flex gap-3">
                  <x.icon className="mt-0.5 h-5 w-5 shrink-0 text-tide-600" aria-hidden />
                  <div>
                    <p className="font-semibold text-abyss-900">{x.t}</p>
                    <p className="text-sm text-ink-soft">{x.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside aria-labelledby="resumo-h" className="lg:sticky lg:top-24 lg:self-start">
          <div className="card overflow-hidden">
            <ModalityArt modality={modality} className="aspect-[16/7] w-full" />
            <div className="p-5">
              <h2 id="resumo-h" className="text-lg font-semibold">A tua escolha</h2>
              <div className="mt-3 space-y-3">
                <PlanSummaryLine planId={planId} />
                <p className="text-sm"><span className="text-ink-muted">Modalidade:</span> <strong>{MODALITIES[modality].label}</strong></p>
                <p className="text-sm"><span className="text-ink-muted">Modo:</span> <strong>{MODE_LABEL[mode]}</strong></p>
              </div>
              <PriceSummary planId={planId} mode={mode} className="mt-4 border-t border-sand-300 pt-4" />
              <LinkButton to={checkoutUrl(planId, modality, mode)} className="mt-5 w-full" size="lg">
                Continuar <ArrowRight className="h-5 w-5" aria-hidden />
              </LinkButton>
              <Link to={boxUrl(planId, modality, mode)} className="link mt-3 block text-center text-sm">
                Ver detalhe desta box
              </Link>
              <p className="mt-3 text-center text-xs text-ink-muted">Demonstração: nenhuma cobrança será efetuada.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
