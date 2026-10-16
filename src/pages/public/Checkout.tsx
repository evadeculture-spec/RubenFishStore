import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CreditCard, FlaskConical, ShieldCheck } from 'lucide-react';
import { Button, Checkbox, Field, Notice, RadioCards } from '../../components/ui';
import { PlanSummaryLine, PriceSummary } from '../../components/commerce';
import { ProfileFields } from '../../components/ProfileFields';
import { EXPERIENCE, FREQUENCIES, MODALITIES, PLAN_ORDER, PLANS, PRODUCT_CATEGORIES } from '../../config/business';
import { placeOrder, validateAddress, type AddressErrors } from '../../domain/checkout';
import { quote } from '../../domain/pricing';
import { currentSubscription } from '../../domain/subscriptions';
import type { Address, FishingProfile, PaymentMethod, PlanId, PurchaseMode } from '../../domain/types';
import { useAction, useActiveCustomer } from '../../store/hooks';
import { formatEUR } from '../../utils/money';
import { addMonths, formatDate } from '../../utils/dates';
import { MODE_LABEL, parseModality, parseMode, parsePlan } from '../../utils/selection';
import { cx } from '../../utils/cx';

const STEPS = ['Revisão', 'Perfil de pesca', 'Morada', 'Pagamento', 'Confirmação'];

const DEMO_ADDRESS: Address = { fullName: 'Marta Exemplo (fictícia)', line1: 'Rua das Marés Fictícias, 10, 2.º Dto.', postalCode: '2520-123', city: 'Peniche' };

function newToken() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `t-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function Checkout() {
  const [params] = useSearchParams();
  const { data, customer } = useActiveCustomer();
  const act = useAction();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [planId, setPlanId] = useState<PlanId>(parsePlan(params.get('plano')));
  const [mode, setMode] = useState<PurchaseMode>(parseMode(params.get('modo')));
  const [profile, setProfile] = useState<FishingProfile>({ ...customer.profile, modality: parseModality(params.get('modalidade'), customer.profile.modality) });
  const [address, setAddress] = useState<Address>(customer.address ?? DEMO_ADDRESS);
  const [addrErrors, setAddrErrors] = useState<AddressErrors>({});
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [consent, setConsent] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [token] = useState(newToken);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const recurring = mode !== 'avulsa';
  const existingSub = currentSubscription(data, customer.id);
  const blockedBySub = recurring && Boolean(existingSub);
  const q = quote(planId, mode);

  const next = () => {
    setStepError(null);
    if (step === 0 && blockedBySub) {
      setStepError('Já tens uma subscrição. Escolhe "Compra avulsa" ou gere a subscrição na tua conta.');
      return;
    }
    if (step === 2) {
      const e = validateAddress(address);
      setAddrErrors(e);
      if (Object.keys(e).length) {
        setStepError('Corrige os campos assinalados.');
        return;
      }
    }
    if (step === 3) {
      if (!payment) return setStepError('Escolhe um método de pagamento simulado.');
      if (recurring && !consent) return setStepError('Para continuar, confirma que aceitas a renovação recorrente simulada.');
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const submit = () => {
    if (submittingRef.current) return; // proteção contra duplo clique
    submittingRef.current = true;
    setSubmitting(true);
    const r = act((d) =>
      placeOrder(d, { customerId: customer.id, planId, mode, profile, address, paymentMethod: payment, subscriptionConsent: consent, checkoutToken: token }),
    );
    if (r.ok) {
      navigate(`/checkout/confirmado/${r.value.order.id}`, { replace: true });
    } else {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-8 sm:py-12">
      <Notice tone="warning" title="Checkout de demonstração" className="mb-6">
        Usa apenas dados fictícios. Nenhuma cobrança será efetuada e não pedimos dados de cartão nem credenciais bancárias.
      </Notice>

      <nav aria-label="Passos do checkout" className="mb-8">
        <ol className="flex gap-1 overflow-x-auto pb-1 sm:gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="min-w-0 flex-1">
              <button
                type="button"
                disabled={i > step}
                onClick={() => i < step && setStep(i)}
                aria-current={i === step ? 'step' : undefined}
                className={cx('flex w-full flex-col items-start gap-1 rounded-lg border-t-4 pt-2 text-left text-xs font-semibold sm:text-sm', i < step ? 'border-tide-500 text-tide-700' : i === step ? 'border-abyss-800 text-abyss-900' : 'border-abyss-800/15 text-ink-muted')}
              >
                <span className="flex items-center gap-1">
                  {i < step ? <Check className="h-3.5 w-3.5" aria-hidden /> : <span aria-hidden>{i + 1}.</span>}
                  <span className={cx(i !== step && 'hidden sm:inline')}>{s}</span>
                  <span className="sr-only">{i < step ? ' (concluído)' : i === step ? ' (atual)' : ' (por fazer)'}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <form
          className="min-w-0"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (step === STEPS.length - 1) submit();
            else next();
          }}
        >
          <h1 ref={headingRef} tabIndex={-1} className="mb-5 text-2xl font-semibold focus:outline-none sm:text-3xl">
            <span className="text-tide-600">{step + 1}.</span> {STEPS[step]}
          </h1>

          {step === 0 && (
            <div className="space-y-6">
              <fieldset>
                <legend className="mb-2 text-sm font-semibold">Plano</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {PLAN_ORDER.map((p) => (
                    <label key={p} className={cx('flex cursor-pointer items-center gap-2 rounded-xl border bg-white p-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-tide-400', p === planId ? 'border-tide-500 ring-1 ring-tide-500' : 'border-sand-400')}>
                      <input type="radio" name="co-plan" className="h-4 w-4 accent-tide-600" checked={p === planId} onChange={() => setPlanId(p)} />
                      <span className="font-semibold">{PLANS[p].name}</span>
                      <span className="ml-auto text-sm text-ink-soft">{formatEUR(PLANS[p].priceCents)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <RadioCards
                name="co-mode"
                legend="Frequência"
                value={mode}
                onChange={(v) => setMode(v)}
                options={[
                  { value: 'mensal' as PurchaseMode, label: FREQUENCIES.mensal.label, description: 'Renovação recorrente todos os meses.' },
                  { value: 'bimestral' as PurchaseMode, label: FREQUENCIES.bimestral.label, description: 'Renovação recorrente a cada dois meses.' },
                  { value: 'avulsa' as PurchaseMode, label: 'Compra avulsa', description: 'Uma única box, sem renovação.' },
                ]}
              />
              {blockedBySub && (
                <Notice tone="warning" title="Já tens uma subscrição">
                  Para alterar plano ou frequência, usa <Link to="/conta/subscricao" className="link">A minha subscrição</Link>. Também podes escolher "Compra avulsa".
                </Notice>
              )}
              <div className="card p-5">
                <PriceSummary planId={planId} mode={mode} />
              </div>
            </div>
          )}

          {step === 1 && <ProfileFields value={profile} onChange={setProfile} />}

          {step === 2 && (
            <div className="space-y-4">
              <Notice tone="info">Morada fictícia pré-preenchida. Entregas apenas em Portugal Continental (códigos postais 1000-000 a 8999-999).</Notice>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Nome (fictício)" required error={addrErrors.fullName}>
                    {(p) => <input {...p} className="input" autoComplete="off" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />}
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Morada (fictícia)" required error={addrErrors.line1}>
                    {(p) => <input {...p} className="input" autoComplete="off" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />}
                  </Field>
                </div>
                <Field label="Código postal" required hint="Formato 0000-000" error={addrErrors.postalCode}>
                  {(p) => <input {...p} className="input" inputMode="numeric" autoComplete="off" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />}
                </Field>
                <Field label="Localidade" required error={addrErrors.city}>
                  {(p) => <input {...p} className="input" autoComplete="off" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />}
                </Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <RadioCards
                name="co-pay"
                legend="Método de pagamento simulado"
                columns={2}
                value={payment}
                onChange={setPayment}
                options={[
                  { value: 'cartao-demo' as PaymentMethod, label: <span className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4 text-tide-600" aria-hidden />Cartão de demonstração</span>, description: 'Simula um pagamento aprovado. Não pede dados de cartão.' },
                  { value: 'pagamento-teste' as PaymentMethod, label: <span className="inline-flex items-center gap-2"><FlaskConical className="h-4 w-4 text-tide-600" aria-hidden />Pagamento de teste</span>, description: 'Confirmação imediata, sem qualquer cobrança.' },
                ]}
              />
              {recurring ? (
                <div className="rounded-xl border border-sand-400 bg-white p-4">
                  <p className="mb-2 font-semibold text-abyss-900">Renovação recorrente</p>
                  <p className="mb-3 text-sm text-ink-soft">
                    Esta é uma subscrição: a box renova {FREQUENCIES[mode].short}, por {formatEUR(q.totalCents)} por box, até pausares ou cancelares. Próxima cobrança simulada: {formatDate(addMonths(data.clock, FREQUENCIES[mode].months))}.
                  </p>
                  <Checkbox
                    checked={consent}
                    onChange={setConsent}
                    label="Aceito a renovação recorrente simulada desta subscrição."
                    description="Podes pausar ou cancelar a qualquer momento na área de cliente."
                  />
                </div>
              ) : (
                <Notice tone="info">Compra avulsa: não há renovação nem cobranças futuras.</Notice>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="card divide-y divide-sand-300">
                <SummaryRow label="Escolha" onEdit={() => setStep(0)}>
                  Box {PLANS[planId].name} · {MODE_LABEL[mode]}
                </SummaryRow>
                <SummaryRow label="Perfil de pesca" onEdit={() => setStep(1)}>
                  {MODALITIES[profile.modality].label} · {EXPERIENCE[profile.experience].label}
                  {profile.avoidCategories.length > 0 && <> · Evitar: {profile.avoidCategories.map((c) => PRODUCT_CATEGORIES[c]).join(', ')}</>}
                </SummaryRow>
                <SummaryRow label="Morada" onEdit={() => setStep(2)}>
                  {address.fullName}, {address.line1}, {address.postalCode} {address.city}
                </SummaryRow>
                <SummaryRow label="Pagamento" onEdit={() => setStep(3)}>
                  {payment === 'cartao-demo' ? 'Cartão de demonstração' : 'Pagamento de teste'}
                  {recurring && ' · Renovação recorrente aceite'}
                </SummaryRow>
              </div>
              <Notice tone="info" title="Nenhuma cobrança será efetuada">
                Ao confirmar, é criada uma encomenda de demonstração no estado "Pagamento simulado confirmado". A entrega é simulada à parte.
              </Notice>
            </div>
          )}

          {stepError && (
            <p role="alert" className="mt-5 rounded-lg bg-coral/10 px-4 py-3 text-sm font-semibold text-[#7A2E14]">
              {stepError}
            </p>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {step > 0 ? (
              <Button variant="secondary" onClick={() => { setStepError(null); setStep((s) => s - 1); }}>
                <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar
              </Button>
            ) : (
              <Link to="/planos" className="link self-center text-sm">Voltar aos planos</Link>
            )}
            {step < STEPS.length - 1 ? (
              <Button type="submit" size="lg">
                Continuar <ArrowRight className="h-5 w-5" aria-hidden />
              </Button>
            ) : (
              <Button type="submit" size="lg" loading={submitting}>
                <ShieldCheck className="h-5 w-5" aria-hidden /> Confirmar encomenda simulada · {formatEUR(q.totalCents)}
              </Button>
            )}
          </div>
        </form>

        <aside aria-labelledby="co-sum" className="lg:sticky lg:top-24 lg:self-start">
          <div className="card space-y-4 p-5">
            <h2 id="co-sum" className="text-lg font-semibold">Resumo</h2>
            <PlanSummaryLine planId={planId} />
            <p className="text-sm"><span className="text-ink-muted">Modalidade:</span> <strong>{MODALITIES[profile.modality].label}</strong></p>
            <p className="text-sm"><span className="text-ink-muted">Frequência:</span> <strong>{recurring ? FREQUENCIES[mode].label : 'Compra avulsa'}</strong></p>
            <PriceSummary planId={planId} mode={mode} className="border-t border-sand-300 pt-4" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function SummaryRow({ label, children, onEdit }: { label: string; children: React.ReactNode; onEdit: () => void }) {
  return (
    <div className="flex flex-col gap-1 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div>
        <p className="text-sm text-ink-muted">{label}</p>
        <p className="font-semibold text-abyss-900">{children}</p>
      </div>
      <button type="button" className="link self-start text-sm" onClick={onEdit}>
        Alterar<span className="sr-only"> {label.toLowerCase()}</span>
      </button>
    </div>
  );
}
