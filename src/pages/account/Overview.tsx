import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Gift, Package, RefreshCw, UserRound } from 'lucide-react';
import { EmptyState, LinkButton, ProgressBar, Badge } from '../../components/ui';
import { OrderStatusBadge, PlanSummaryLine } from '../../components/commerce';
import { FREQUENCIES, MODALITIES, PLANS } from '../../config/business';
import { progressSummary, milestoneState, MILESTONES } from '../../domain/loyalty';
import { latestSubscription, nextBoxShipDate, nextChargedBillingDate, SUBSCRIPTION_STATUS_LABEL } from '../../domain/subscriptions';
import { quote } from '../../domain/pricing';
import { useActiveCustomer } from '../../store/hooks';
import { formatDate } from '../../utils/dates';
import { formatEUR } from '../../utils/money';

export function Overview() {
  const { data, customer } = useActiveCustomer();
  const sub = latestSubscription(data, customer.id);
  const orders = data.orders.filter((o) => o.customerId === customer.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.number.localeCompare(a.number));
  const last = orders[0];
  const progress = progressSummary(data, customer.id);
  const available = MILESTONES.filter((m) => milestoneState(data, customer.id, m.level) === 'available');

  if (!sub && orders.length === 0) {
    return (
      <EmptyState icon={<Package className="h-6 w-6" />} title="Ainda não tens nenhuma box" action={<LinkButton to="/planos">Descobrir a minha box</LinkButton>}>
        Escolhe a modalidade e o plano para fazeres a primeira compra simulada. Também podes carregar um cenário nas ferramentas de demonstração.
      </EmptyState>
    );
  }

  const billing = sub ? nextChargedBillingDate(sub) : undefined;
  const ship = sub ? nextBoxShipDate(sub) : undefined;

  return (
    <div className="space-y-5">
      <h1 className="sr-only">Resumo da conta</h1>
      {available.length > 0 && (
        <Link to="/conta/recompensas" className="flex items-center gap-3 rounded-2xl bg-coral/10 p-4 ring-1 ring-coral/30 transition-colors hover:bg-coral/15">
          <Gift className="h-6 w-6 shrink-0 text-coral-600" aria-hidden />
          <span className="flex-1 font-semibold text-[#7A2E14]">
            Tens {available.length === 1 ? 'uma recompensa disponível' : `${available.length} recompensas disponíveis`} para escolher.
          </span>
          <ArrowRight className="h-5 w-5 text-coral-600" aria-hidden />
        </Link>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="card p-5 sm:p-6" aria-labelledby="ov-sub">
          <div className="flex items-center justify-between gap-2">
            <h2 id="ov-sub" className="text-lg font-semibold">Subscrição</h2>
            {sub && <Badge tone={sub.status === 'active' ? 'tide' : sub.status === 'paused' ? 'sand' : 'coral'}>{SUBSCRIPTION_STATUS_LABEL[sub.status]}</Badge>}
          </div>
          {sub ? (
            <div className="mt-4 space-y-3">
              <PlanSummaryLine planId={sub.planId} />
              <p className="text-sm text-ink-soft">{MODALITIES[sub.modality].label} · {FREQUENCIES[sub.frequency].label} · {formatEUR(quote(sub.planId, sub.frequency).totalCents)} por box</p>
              <dl className="grid gap-3 rounded-xl bg-sand-50 p-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-ink-muted">Próxima cobrança simulada</dt>
                  <dd className="font-semibold">{billing ? formatDate(billing) : sub.status === 'paused' ? 'Nenhuma (pausada)' : 'Nenhuma (cancelada)'}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Próxima box (expedição prevista)</dt>
                  <dd className="font-semibold">{ship ? formatDate(ship) : '—'}</dd>
                </div>
              </dl>
              {sub.skipNext && <p className="text-sm font-semibold text-coral-600">A entrega de {formatDate(sub.nextBillingDate)} vai ser saltada.</p>}
              <Link to="/conta/subscricao" className="link text-sm">Gerir subscrição</Link>
            </div>
          ) : (
            <div className="mt-3 text-ink-soft">
              <p>Não tens subscrição: as tuas compras são avulsas.</p>
              <Link to="/planos" className="link mt-2 inline-block text-sm">Ver planos</Link>
            </div>
          )}
        </section>

        <section className="card p-5 sm:p-6" aria-labelledby="ov-rew">
          <h2 id="ov-rew" className="text-lg font-semibold">Progresso nas recompensas</h2>
          <p className="mt-3 font-display text-4xl font-semibold text-abyss-900">
            {progress.count}
            <span className="ml-2 font-sans text-base font-semibold text-ink-soft">{progress.count === 1 ? 'box elegível entregue' : 'boxes elegíveis entregues'}</span>
          </p>
          <ProgressBar className="mt-4" value={progress.ratioToNext} label={progress.next ? `Progresso até ao ${progress.next.title}` : 'Todos os marcos conquistados'} />
          <p className="mt-2 text-sm font-semibold text-abyss-900">{progress.message}</p>
          {progress.next && <p className="text-sm text-ink-muted">Próximo marco: {progress.next.title} aos {progress.next.boxes} boxes · {progress.next.summary}</p>}
          <Link to="/conta/recompensas" className="link mt-3 inline-block text-sm">Ver recompensas</Link>
        </section>
      </div>

      <section className="card p-5 sm:p-6" aria-labelledby="ov-last">
        <div className="flex items-center justify-between gap-2">
          <h2 id="ov-last" className="text-lg font-semibold">Última encomenda</h2>
          <Link to="/conta/encomendas" className="link text-sm">Todas</Link>
        </div>
        {last ? (
          <Link to={`/conta/encomendas/${last.id}`} className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sand-50 p-4 hover:bg-sand-200/60">
            <div>
              <p className="font-semibold text-abyss-900">{last.number}</p>
              <p className="text-sm text-ink-muted">{PLANS[last.planId].name} · {formatDate(last.createdAt)} · {formatEUR(last.totalCents)}</p>
            </div>
            <OrderStatusBadge status={last.status} />
          </Link>
        ) : (
          <p className="mt-3 text-ink-soft">Sem encomendas.</p>
        )}
      </section>

      <section aria-labelledby="ov-short">
        <h2 id="ov-short" className="mb-3 text-lg font-semibold">Atalhos</h2>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { to: '/conta/subscricao', icon: RefreshCw, label: 'Saltar ou pausar' },
            { to: '/conta/perfil', icon: UserRound, label: 'Editar perfil de pesca' },
            { to: '/conta/aprender', icon: BookOpen, label: 'Guias da modalidade' },
            { to: '/planos?modo=avulsa', icon: Package, label: 'Comprar box avulsa' },
          ].map((s) => (
            <li key={s.to}>
              <Link to={s.to} className="card flex items-center gap-3 p-4 font-semibold text-abyss-900 transition-shadow hover:shadow-lift">
                <s.icon className="h-5 w-5 text-tide-600" aria-hidden />
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
