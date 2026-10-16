import { useParams } from 'react-router-dom';
import { CircleCheck, PackageSearch } from 'lucide-react';
import { EmptyState, LinkButton, Notice } from '../../components/ui';
import { KeyValue, OrderStatusBadge } from '../../components/commerce';
import { FREQUENCIES, MODALITIES, PLANS } from '../../config/business';
import { useDemo } from '../../store/store';
import { formatEUR } from '../../utils/money';
import { formatDate } from '../../utils/dates';
import { nextBoxShipDate } from '../../domain/subscriptions';

export function CheckoutDone() {
  const { orderId } = useParams();
  const data = useDemo();
  const order = data.orders.find((o) => o.id === orderId);
  if (!order) {
    return (
      <div className="container-page py-16">
        <EmptyState icon={<PackageSearch className="h-6 w-6" />} title="Encomenda não encontrada" action={<LinkButton to="/conta/encomendas">Ver encomendas</LinkButton>}>
          Pode ter sido apagada ao repor os dados da demonstração.
        </EmptyState>
      </div>
    );
  }
  const sub = data.subscriptions.find((s) => s.id === order.subscriptionId);
  const nextShip = sub ? nextBoxShipDate(sub) : undefined;
  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <div className="card overflow-hidden">
        <div className="on-dark bg-abyss-800 px-6 py-8 text-center text-sand-100">
          <CircleCheck className="mx-auto h-12 w-12 animate-pop text-tide-300" aria-hidden />
          <h1 className="mt-3 text-3xl font-semibold text-white">Encomenda confirmada</h1>
          <p className="mt-2 text-sand-100/80">
            Número da encomenda: <strong className="font-display text-lg text-white">{order.number}</strong>
          </p>
        </div>
        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <span className="text-sm text-ink-muted">Demonstração: nenhuma cobrança foi efetuada.</span>
          </div>
          <KeyValue
            items={[
              ['Box', `${PLANS[order.planId].name} · ${MODALITIES[order.modality].label}`],
              ['Tipo', order.kind === 'single' ? 'Compra avulsa' : `Subscrição ${FREQUENCIES[order.frequency!].label.toLowerCase()}`],
              ['Preço da box', formatEUR(order.priceCents)],
              ['Portes', order.shippingCents ? formatEUR(order.shippingCents) : 'Incluídos'],
              ['Total', formatEUR(order.totalCents)],
              ['Entrega (fictícia)', `${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`],
            ]}
          />
          <Notice tone="info" title="Próximo passo">
            A box vai ser preparada e expedida. O conteúdo fica visível na tua área de cliente quando for expedida.
            {sub && nextShip && <> A próxima cobrança simulada está agendada para {formatDate(sub.nextBillingDate)}.</>}
            {' '}Para avançar já a entrega, usa as ferramentas de demonstração.
          </Notice>
          <div className="flex flex-col gap-3 sm:flex-row">
            <LinkButton to={`/conta/encomendas/${order.id}`}>Ver encomenda</LinkButton>
            <LinkButton to="/conta" variant="secondary">Ir para a minha conta</LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
