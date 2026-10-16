import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, PackageSearch } from 'lucide-react';
import { Button, EmptyState, Notice, PageHeader } from '../../components/ui';
import { BackLink, OrderStatusBadge } from '../../components/commerce';
import { OrderDetailView } from '../../components/OrderDetailView';
import { MODALITIES, PLANS } from '../../config/business';
import { nextStatus, ORDER_FLOW, ORDER_STATUS_LABEL, resolveEdition, transitionOrder } from '../../domain/orders';
import type { OrderStatus } from '../../domain/types';
import { useAction } from '../../store/hooks';
import { useDemo } from '../../store/store';
import { formatShortDate } from '../../utils/dates';
import { formatEUR } from '../../utils/money';
import { cx } from '../../utils/cx';

export function AdminOrders() {
  const data = useDemo();
  const [params, setParams] = useSearchParams();
  const filter = params.get('estado') as OrderStatus | null;
  const valid = filter && ORDER_FLOW.includes(filter) ? filter : null;
  const list = data.orders.filter((o) => !valid || o.status === valid).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.number.localeCompare(a.number));
  return (
    <div>
      <PageHeader title="Encomendas" intro={`${data.orders.length} encomendas de demonstração.`} />
      <div role="group" aria-label="Filtrar por estado" className="mb-4 flex flex-wrap gap-2">
        {[null, ...ORDER_FLOW].map((s) => (
          <button
            key={s ?? 'all'}
            type="button"
            aria-pressed={valid === s}
            onClick={() => setParams(s ? { estado: s } : {}, { replace: true })}
            className={cx('rounded-full px-3.5 py-1.5 text-sm font-semibold', valid === s ? 'bg-abyss-800 text-sand-100' : 'bg-white ring-1 ring-abyss-800/15 hover:ring-abyss-800/40')}
          >
            {s ? ORDER_STATUS_LABEL[s] : 'Todas'} ({s ? data.orders.filter((o) => o.status === s).length : data.orders.length})
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<PackageSearch className="h-6 w-6" />} title="Sem encomendas neste estado" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-sand-50 text-ink-muted">
              <tr><th className="px-4 py-3">Número</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Box</th><th className="px-4 py-3">Data</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Estado</th></tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id} className="border-t border-sand-200">
                  <td className="px-4 py-3"><Link className="link" to={`/gestao/encomendas/${o.id}`}>{o.number}</Link></td>
                  <td className="px-4 py-3">{data.customers.find((c) => c.id === o.customerId)?.name}</td>
                  <td className="px-4 py-3">{PLANS[o.planId].name} · {MODALITIES[o.modality].short}{o.kind === 'single' && ' · avulsa'}</td>
                  <td className="px-4 py-3">{formatShortDate(o.createdAt)}</td>
                  <td className="px-4 py-3">{formatEUR(o.totalCents)}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function AdminOrderDetail() {
  const { id } = useParams();
  const data = useDemo();
  const act = useAction();
  const order = data.orders.find((o) => o.id === id);
  if (!order) return <EmptyState icon={<PackageSearch className="h-6 w-6" />} title="Encomenda não encontrada" />;
  const next = nextStatus(order.status);
  const customer = data.customers.find((c) => c.id === order.customerId);
  const edition = order.status === 'preparing' ? resolveEdition(data, order) : undefined;
  return (
    <div className="space-y-5">
      <BackLink to="/gestao/encomendas">Encomendas</BackLink>
      <div className="card p-5">
        <h2 className="text-lg font-semibold">Transição de estado</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Cliente: <Link className="link" to={`/gestao/clientes/${order.customerId}`}>{customer?.name}</Link>. Só é possível avançar para o estado seguinte, uma vez.
        </p>
        {next ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={() => act((d) => transitionOrder(d, order.id, next), (v) => `Encomenda ${v.order.number}: ${ORDER_STATUS_LABEL[next]}.${v.unlocked.length ? ` Cliente desbloqueou o nível ${v.unlocked.join(', ')}.` : ''}`)}>
              Marcar como "{ORDER_STATUS_LABEL[next]}" <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
            {next === 'shipped' && (
              <p className="text-sm text-ink-muted">
                {edition ? <>Edição a atribuir: <strong>{edition.name}</strong>. Recompensas reservadas seguem com esta encomenda.</> : 'Não há edição pronta para esta combinação: a expedição será recusada.'}
              </p>
            )}
          </div>
        ) : (
          <Notice tone="success" className="mt-4">Encomenda entregue: não há mais transições.</Notice>
        )}
      </div>
      <OrderDetailView data={data} order={order} showContentsAlways />
    </div>
  );
}
