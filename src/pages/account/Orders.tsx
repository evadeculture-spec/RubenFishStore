import { Link, useParams } from 'react-router-dom';
import { Package, PackageSearch } from 'lucide-react';
import { EmptyState, LinkButton } from '../../components/ui';
import { BackLink, OrderStatusBadge } from '../../components/commerce';
import { OrderDetailView } from '../../components/OrderDetailView';
import { MODALITIES, PLANS } from '../../config/business';
import { useActiveCustomer } from '../../store/hooks';
import { formatDate } from '../../utils/dates';
import { formatEUR } from '../../utils/money';

export function Orders() {
  const { data, customer } = useActiveCustomer();
  const orders = data.orders.filter((o) => o.customerId === customer.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.number.localeCompare(a.number));
  return (
    <div>
      <h1 className="mb-5 text-2xl font-semibold">Encomendas</h1>
      {orders.length === 0 ? (
        <EmptyState icon={<Package className="h-6 w-6" />} title="Sem encomendas" action={<LinkButton to="/planos">Escolher uma box</LinkButton>}>
          As tuas encomendas aparecem aqui depois da primeira compra simulada.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link to={`/conta/encomendas/${o.id}`} className="card flex flex-wrap items-center justify-between gap-3 p-4 transition-shadow hover:shadow-lift sm:p-5">
                <div>
                  <p className="font-display text-lg font-semibold text-abyss-900">{o.number}</p>
                  <p className="text-sm text-ink-muted">
                    {formatDate(o.createdAt)} · {PLANS[o.planId].name} · {MODALITIES[o.modality].short} · {o.kind === 'single' ? 'Avulsa' : 'Subscrição'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatEUR(o.totalCents)}</span>
                  <OrderStatusBadge status={o.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const { data, customer } = useActiveCustomer();
  const order = data.orders.find((o) => o.id === id && o.customerId === customer.id);
  return (
    <div>
      <BackLink to="/conta/encomendas">Todas as encomendas</BackLink>
      {order ? (
        <OrderDetailView data={data} order={order} />
      ) : (
        <EmptyState icon={<PackageSearch className="h-6 w-6" />} title="Encomenda não encontrada">
          Esta encomenda não pertence ao cliente em visualização ou já não existe.
        </EmptyState>
      )}
    </div>
  );
}
