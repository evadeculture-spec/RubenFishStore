import { useState } from 'react';
import { PauseCircle, PlayCircle, RefreshCw, SkipForward, XCircle } from 'lucide-react';
import { Badge, Button, EmptyState, LinkButton, Notice } from '../../components/ui';
import { useFeedback } from '../../components/feedback';
import { PlanSummaryLine } from '../../components/commerce';
import { FREQUENCIES, MODALITIES, MODALITY_ORDER, PLAN_ORDER, PLANS, SUBSCRIPTION_RULES } from '../../config/business';
import { quote } from '../../domain/pricing';
import {
  cancel,
  changeFrequency,
  changeModality,
  changePlan,
  latestSubscription,
  nextBoxShipDate,
  nextChargedBillingDate,
  pause,
  resume,
  setSkipNext,
  SUBSCRIPTION_STATUS_LABEL,
} from '../../domain/subscriptions';
import type { Frequency, Modality, PlanId, SubscriptionEvent } from '../../domain/types';
import { useAction, useActiveCustomer } from '../../store/hooks';
import { addDays, formatDate, formatShortDate } from '../../utils/dates';
import { formatEUR } from '../../utils/money';

const EVENT_LABEL: Record<SubscriptionEvent['type'], string> = {
  created: 'Subscrição criada',
  renewed: 'Renovação simulada',
  skipped: 'Entrega saltada',
  skip_requested: 'Pedido para saltar a próxima entrega',
  skip_cancelled: 'Pedido para saltar anulado',
  paused: 'Subscrição pausada',
  resumed: 'Subscrição retomada',
  cancelled: 'Subscrição cancelada',
  plan_changed: 'Plano alterado',
  frequency_changed: 'Frequência alterada',
  modality_changed: 'Modalidade alterada',
};

export function SubscriptionPage() {
  const { data, customer } = useActiveCustomer();
  const act = useAction();
  const fb = useFeedback();
  const sub = latestSubscription(data, customer.id);
  const [plan, setPlan] = useState<PlanId | ''>('');
  const [modality, setModality] = useState<Modality | ''>('');
  const [freq, setFreq] = useState<Frequency | ''>('');

  if (!sub) {
    return (
      <EmptyState icon={<RefreshCw className="h-6 w-6" />} title="Sem subscrição" action={<LinkButton to="/planos">Ver planos</LinkButton>}>
        Ainda não tens uma subscrição. Podes começar uma ou comprar boxes avulsas.
      </EmptyState>
    );
  }

  const editable = sub.status !== 'cancelled';
  const billing = nextChargedBillingDate(sub);
  const ship = nextBoxShipDate(sub);
  const applyNote = `Aplica-se a partir do próximo ciclo${billing ? ` (${formatDate(billing)})` : ''}. A encomenda já paga não muda.`;

  const confirmThen = async (title: string, body: string, label: string, fn: () => void, tone: 'danger' | 'primary' = 'primary') => {
    if (await fb.confirm({ title, body, confirmLabel: label, tone })) fn();
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">A minha subscrição</h1>

      <section className="card p-5 sm:p-6" aria-labelledby="sub-state">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="sub-state" className="sr-only">Estado</h2>
            <PlanSummaryLine planId={sub.planId} />
          </div>
          <Badge tone={sub.status === 'active' ? 'tide' : sub.status === 'paused' ? 'sand' : 'coral'}>Estado: {SUBSCRIPTION_STATUS_LABEL[sub.status]}</Badge>
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-ink-muted">Modalidade</dt><dd className="font-semibold">{MODALITIES[sub.modality].label}</dd></div>
          <div><dt className="text-ink-muted">Frequência</dt><dd className="font-semibold">{FREQUENCIES[sub.frequency].label}</dd></div>
          <div><dt className="text-ink-muted">Valor por box</dt><dd className="font-semibold">{formatEUR(quote(sub.planId, sub.frequency).totalCents)} (com portes)</dd></div>
          <div><dt className="text-ink-muted">Próxima cobrança simulada</dt><dd className="font-semibold">{billing ? formatDate(billing) : 'Nenhuma'}</dd></div>
        </dl>
        {sub.status === 'active' && ship && <p className="mt-3 text-sm text-ink-soft">Expedição prevista da próxima box: {formatDate(ship)}.</p>}
        {sub.skipNext && (
          <Notice tone="warning" className="mt-4">
            O ciclo de {formatDate(sub.nextBillingDate)} vai ser saltado: sem cobrança nem envio. O progresso nas recompensas mantém-se.
          </Notice>
        )}
        {sub.status === 'paused' && <Notice className="mt-4">Subscrição pausada: não há cobranças simuladas. Ao retomar, a próxima cobrança fica agendada para daqui a {SUBSCRIPTION_RULES.resumeDelayDays} dias.</Notice>}
        {sub.status === 'cancelled' && <Notice className="mt-4">Subscrição cancelada em {formatDate(sub.cancelledAt!)}. O teu histórico, progresso e recompensas mantêm-se. <LinkButton to="/planos" size="sm" variant="secondary" className="ml-1 mt-2">Começar nova subscrição</LinkButton></Notice>}

        <div className="mt-5 flex flex-wrap gap-2 border-t border-sand-300 pt-5">
          {sub.status === 'active' && (
            <Button
              variant="secondary"
              onClick={() =>
                sub.skipNext
                  ? act((d) => setSkipNext(d, sub.id, false), 'A próxima entrega já não vai ser saltada.')
                  : confirmThen('Saltar a próxima entrega?', `O ciclo de ${formatDate(sub.nextBillingDate)} não será cobrado nem enviado. A cobrança seguinte mantém-se no calendário normal.`, 'Saltar entrega', () =>
                      act((d) => setSkipNext(d, sub.id, true), `Entrega de ${formatDate(sub.nextBillingDate)} marcada para saltar.`),
                    )
              }
            >
              <SkipForward className="h-4 w-4" aria-hidden /> {sub.skipNext ? 'Anular salto' : 'Saltar a próxima entrega'}
            </Button>
          )}
          {sub.status === 'active' && (
            <Button
              variant="secondary"
              onClick={() => confirmThen('Pausar a subscrição?', 'Enquanto estiver pausada não há cobranças simuladas nem envios. Podes retomar quando quiseres.', 'Pausar', () => act((d) => pause(d, sub.id), 'Subscrição pausada. Não haverá novas cobranças.'))}
            >
              <PauseCircle className="h-4 w-4" aria-hidden /> Pausar
            </Button>
          )}
          {sub.status === 'paused' && (
            <Button
              onClick={() =>
                confirmThen('Retomar a subscrição?', `A próxima cobrança simulada fica agendada para ${formatDate(addDays(data.clock, SUBSCRIPTION_RULES.resumeDelayDays))}.`, 'Retomar', () =>
                  act((d) => resume(d, sub.id), (s) => `Subscrição retomada. Próxima cobrança simulada: ${formatDate(s.nextBillingDate)}.`),
                )
              }
            >
              <PlayCircle className="h-4 w-4" aria-hidden /> Retomar
            </Button>
          )}
          {editable && (
            <Button
              variant="danger"
              onClick={() =>
                confirmThen(
                  'Cancelar a subscrição?',
                  'Não haverá novas cobranças. Encomendas já pagas seguem normalmente e o teu progresso e recompensas mantêm-se.',
                  'Cancelar subscrição',
                  () => act((d) => cancel(d, sub.id), 'Subscrição cancelada. Não haverá novas cobranças.'),
                  'danger',
                )
              }
            >
              <XCircle className="h-4 w-4" aria-hidden /> Cancelar subscrição
            </Button>
          )}
        </div>
      </section>

      {editable && (
        <section className="card p-5 sm:p-6" aria-labelledby="sub-change">
          <h2 id="sub-change" className="text-lg font-semibold">Alterar subscrição</h2>
          <p className="mt-1 text-sm text-ink-soft">{applyNote} Sem acertos financeiros a meio do ciclo.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <ChangeControl
              id="ch-plan"
              label="Plano"
              current={sub.planId}
              value={plan}
              onChange={(v) => setPlan(v as PlanId)}
              options={PLAN_ORDER.map((p) => ({ value: p, label: `${PLANS[p].name} · ${formatEUR(quote(p, sub.frequency).totalCents)}` }))}
              onApply={() => { if (plan && act((d) => changePlan(d, sub.id, plan), `Plano alterado para ${PLANS[plan].name}. ${applyNote}`).ok) setPlan(''); }}
            />
            <ChangeControl
              id="ch-mod"
              label="Modalidade"
              current={sub.modality}
              value={modality}
              onChange={(v) => setModality(v as Modality)}
              options={MODALITY_ORDER.map((m) => ({ value: m, label: MODALITIES[m].label }))}
              onApply={() => { if (modality && act((d) => changeModality(d, sub.id, modality), `Modalidade alterada para ${MODALITIES[modality].label}. ${applyNote}`).ok) setModality(''); }}
            />
            <ChangeControl
              id="ch-freq"
              label="Frequência"
              current={sub.frequency}
              value={freq}
              onChange={(v) => setFreq(v as Frequency)}
              options={(Object.keys(FREQUENCIES) as Frequency[]).map((f) => ({ value: f, label: FREQUENCIES[f].label }))}
              onApply={() => { if (freq && act((d) => changeFrequency(d, sub.id, freq), `Frequência alterada para "${FREQUENCIES[freq].label}". ${applyNote}`).ok) setFreq(''); }}
            />
          </div>
        </section>
      )}

      <section className="card p-5 sm:p-6" aria-labelledby="sub-hist">
        <h2 id="sub-hist" className="text-lg font-semibold">Histórico da subscrição</h2>
        <ol className="mt-3 space-y-2">
          {[...sub.history].reverse().map((h, i) => (
            <li key={i} className="flex flex-wrap gap-x-3 gap-y-0.5 border-b border-sand-200 pb-2 text-sm last:border-0">
              <time className="w-24 shrink-0 text-ink-muted" dateTime={h.at}>{formatShortDate(h.at)}</time>
              <span className="font-semibold text-abyss-900">{EVENT_LABEL[h.type]}</span>
              {h.detail && <span className="text-ink-soft">{/^\d{4}-\d{2}-\d{2}$/.test(h.detail) ? formatDate(h.detail) : h.detail}</span>}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function ChangeControl({
  id,
  label,
  current,
  value,
  onChange,
  options,
  onApply,
}: {
  id: string;
  label: string;
  current: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  onApply: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-sand-50 p-4 ring-1 ring-sand-300">
      <label htmlFor={id} className="text-sm font-semibold">{label}</label>
      <select id={id} className="input" value={value || current} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}{o.value === current ? ' (atual)' : ''}</option>
        ))}
      </select>
      <Button size="sm" variant="dark" disabled={!value || value === current} onClick={onApply}>
        Aplicar ao próximo ciclo
      </Button>
    </div>
  );
}
