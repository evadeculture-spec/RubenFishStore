import { Link } from 'react-router-dom';
import { Euro, Gift, Package, PauseCircle, Users, XCircle } from 'lucide-react';
import { PageHeader, Stat } from '../../components/ui';
import { ORDER_FLOW, ORDER_STATUS_LABEL } from '../../domain/orders';
import { adminOverview } from '../../domain/kpis';
import { FREQUENCIES, PLAN_ORDER, PLANS } from '../../config/business';
import { monthlyEquivalentCents } from '../../domain/pricing';
import { useDemo } from '../../store/store';
import { formatEUR } from '../../utils/money';
import { formatMonth, monthKey } from '../../utils/dates';

export function AdminOverview() {
  const data = useDemo();
  const k = adminOverview(data);
  const maxPlan = Math.max(1, ...PLAN_ORDER.map((p) => k.activeSubscriptionsByPlan[p]));
  const active = data.subscriptions.filter((s) => s.status === 'active');
  return (
    <div className="space-y-6">
      <PageHeader title="Visão geral" intro={`Indicadores calculados a partir dos dados de demonstração. Período: ${formatMonth(monthKey(data.clock))}.`} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat label="Clientes ativos" value={k.activeCustomers} hint="Com subscrição ativa" icon={<Users className="h-5 w-5" />} />
        <Stat label="Receita recorrente mensal equivalente" value={formatEUR(k.mrrCents)} hint="Simulada, bruta, IVA incluído, sem portes" icon={<Euro className="h-5 w-5" />} />
        <Stat label="Encomendas do período" value={k.ordersThisMonth} hint="Criadas no mês do relógio" icon={<Package className="h-5 w-5" />} />
        <Stat label="Subscrições pausadas" value={k.paused} icon={<PauseCircle className="h-5 w-5" />} />
        <Stat label="Subscrições canceladas" value={k.cancelled} icon={<XCircle className="h-5 w-5" />} />
        <Stat label="Recompensas" value={`${k.rewardsAvailable} / ${k.rewardsReserved}`} hint="Disponíveis para reserva / reservadas" icon={<Gift className="h-5 w-5" />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="card p-5" aria-labelledby="ao-plan">
          <h2 id="ao-plan" className="text-lg font-semibold">Subscrições ativas por plano</h2>
          <ul className="mt-4 space-y-3">
            {PLAN_ORDER.map((p) => (
              <li key={p}>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{PLANS[p].name}</span>
                  <span>{k.activeSubscriptionsByPlan[p]}</span>
                </div>
                <div className="mt-1 h-2.5 rounded-full bg-abyss-800/10" aria-hidden>
                  <div className="h-full rounded-full bg-abyss-700" style={{ width: `${(k.activeSubscriptionsByPlan[p] / maxPlan) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-muted">Total: {k.activeSubscriptions} subscrições ativas. {k.pendingRenewals > 0 && `${k.pendingRenewals} com renovação vencida por processar (ferramentas de demonstração).`}</p>
        </section>

        <section className="card p-5" aria-labelledby="ao-orders">
          <h2 id="ao-orders" className="text-lg font-semibold">Encomendas por estado (total)</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {ORDER_FLOW.map((s) => (
              <li key={s}>
                <Link to={`/gestao/encomendas?estado=${s}`} className="block rounded-xl bg-sand-50 p-3 ring-1 ring-sand-300 hover:ring-abyss-800/30">
                  <p className="text-sm text-ink-muted">{ORDER_STATUS_LABEL[s]}</p>
                  <p className="font-display text-2xl font-semibold">{k.ordersByStatus[s]}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card p-5" aria-labelledby="ao-mrr">
        <h2 id="ao-mrr" className="text-lg font-semibold">Como é calculada a receita mensal equivalente</h2>
        <p className="mt-1 text-sm text-ink-soft">Mensal: valor do plano. De dois em dois meses: metade do valor do plano. Excluídas compras avulsas, subscrições pausadas e canceladas, e portes.</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-ink-muted"><tr><th className="py-2 pr-3">Cliente</th><th className="py-2 pr-3">Plano</th><th className="py-2 pr-3">Frequência</th><th className="py-2 text-right">Equivalente mensal</th></tr></thead>
            <tbody>
              {active.map((s) => (
                <tr key={s.id} className="border-t border-sand-200">
                  <td className="py-2 pr-3"><Link className="link" to={`/gestao/clientes/${s.customerId}`}>{data.customers.find((c) => c.id === s.customerId)?.name}</Link></td>
                  <td className="py-2 pr-3">{PLANS[s.planId].name}</td>
                  <td className="py-2 pr-3">{FREQUENCIES[s.frequency].label}</td>
                  <td className="py-2 text-right">{formatEUR(monthlyEquivalentCents(s.planId, s.frequency))}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-abyss-800/30 font-semibold"><td className="py-2" colSpan={3}>Total</td><td className="py-2 text-right">{formatEUR(k.mrrCents)}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
