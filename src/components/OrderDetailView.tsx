import { Gift, Lock } from 'lucide-react';
import { KeyValue, OrderStatusBadge, OrderTimeline } from './commerce';
import { ProductArt } from './art';
import { Badge } from './ui';
import { FREQUENCIES, MODALITIES, PLANS, PRODUCT_CATEGORIES } from '../config/business';
import { isContentRevealed } from '../domain/orders';
import type { DemoData, Order } from '../domain/types';
import { formatDate } from '../utils/dates';
import { formatEUR } from '../utils/money';

export function OrderDetailView({ data, order, showContentsAlways }: { data: DemoData; order: Order; showContentsAlways?: boolean }) {
  const rewards = data.redemptions.filter((r) => r.orderId === order.id);
  const revealed = isContentRevealed(order);
  const edition = data.editions.find((e) => e.id === order.editionId);
  return (
    <div className="space-y-5">
      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Encomenda {order.number}</h1>
            <p className="text-sm text-ink-muted">Criada em {formatDate(order.createdAt)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="mt-5">
          <OrderTimeline order={order} />
        </div>
        <div className="mt-6 border-t border-sand-300 pt-5">
          <KeyValue
            items={[
              ['Box', `${PLANS[order.planId].name} · ${MODALITIES[order.modality].label}`],
              ['Tipo', order.kind === 'single' ? 'Compra avulsa' : `Subscrição · ${FREQUENCIES[order.frequency!].label}`],
              ['Preço da box', formatEUR(order.priceCents)],
              ['Portes', order.shippingCents ? formatEUR(order.shippingCents) : 'Incluídos'],
              ['Total (simulado, IVA incluído)', formatEUR(order.totalCents)],
              ['Pagamento', order.paymentMethod === 'cartao-demo' ? 'Cartão de demonstração' : 'Pagamento de teste'],
              ['Morada (fictícia)', `${order.shippingAddress.fullName}, ${order.shippingAddress.line1}, ${order.shippingAddress.postalCode} ${order.shippingAddress.city}`],
              ['Edição', edition ? edition.name : 'Atribuída na expedição'],
            ]}
          />
        </div>
      </div>

      <section className="card p-5 sm:p-6" aria-labelledby="od-cont">
        <h2 id="od-cont" className="text-lg font-semibold">Conteúdo da box</h2>
        {revealed && order.contents ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {order.contents.map((c) => (
              <li key={c.productId} className="flex items-center gap-3 rounded-xl bg-sand-50 p-3">
                <ProductArt category={c.category} className="h-14 w-14 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold leading-snug text-abyss-900">{c.name}</p>
                  <p className="text-sm text-ink-muted">{PRODUCT_CATEGORIES[c.category]} · {c.quantity} un.</p>
                  {c.substitutedFor && <p className="text-xs text-tide-700">Substitui "{c.substitutedFor}" (preferência: evitar)</p>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 flex items-start gap-3 rounded-xl bg-sand-200/60 p-4 text-ink-soft">
            <Lock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p>
              O conteúdo é surpresa e só é revelado depois da expedição simulada.
              {showContentsAlways && ' (Vista de gestão: a edição é atribuída no momento da expedição.)'}
            </p>
          </div>
        )}
      </section>

      <section className="card p-5 sm:p-6" aria-labelledby="od-rew">
        <h2 id="od-rew" className="text-lg font-semibold">Recompensa incluída</h2>
        {rewards.length ? (
          <ul className="mt-3 space-y-2">
            {rewards.map((r) => {
              const item = data.rewardItems.find((i) => i.id === r.rewardItemId);
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-tide-50 p-3 ring-1 ring-tide-200">
                  <Gift className="h-5 w-5 text-tide-600" aria-hidden />
                  <span className="font-semibold text-abyss-900">{item?.name}</span>
                  <Badge tone="dark">Nível {r.level}</Badge>
                  <Badge tone={r.status === 'received' ? 'tide' : 'neutral'}>{r.status === 'received' ? 'Recebida' : 'A caminho'}</Badge>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-ink-soft">
            {revealed ? 'Esta encomenda não inclui recompensas.' : 'Se tiveres uma recompensa reservada, é associada a esta encomenda quando for expedida.'}
          </p>
        )}
      </section>
    </div>
  );
}
