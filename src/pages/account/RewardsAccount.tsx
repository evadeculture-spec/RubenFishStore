import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift } from 'lucide-react';
import { Badge, Button, Notice } from '../../components/ui';
import { useFeedback } from '../../components/feedback';
import { MilestoneStateBadge, MilestoneTrack } from '../../components/commerce';
import { MODALITIES } from '../../config/business';
import { milestoneState, MILESTONES, progressSummary, redemptionForLevel } from '../../domain/loyalty';
import { compatibleRewardItems, hasUpcomingBox, reserveReward, rewardStock } from '../../domain/rewards';
import type { RewardLevel } from '../../domain/types';
import { useAction, useActiveCustomer } from '../../store/hooks';
import { formatDate, formatShortDate } from '../../utils/dates';
import { cx } from '../../utils/cx';

export function RewardsAccount() {
  const { data, customer } = useActiveCustomer();
  const progress = progressSummary(data, customer.id);
  const states = Object.fromEntries(MILESTONES.map((m) => [m.level, milestoneState(data, customer.id, m.level)])) as Record<RewardLevel, ReturnType<typeof milestoneState>>;
  const history = data.redemptions.filter((r) => r.customerId === customer.id);
  const events = data.progressEvents.filter((e) => e.customerId === customer.id).slice().reverse();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Recompensas</h1>

      <section className="card p-5 sm:p-6" aria-labelledby="rw-prog">
        <h2 id="rw-prog" className="text-lg font-semibold">O teu progresso</h2>
        <p className="mt-2 text-ink-soft">
          <strong className="text-abyss-900">{progress.count}</strong> {progress.count === 1 ? 'box elegível entregue' : 'boxes elegíveis entregues'}. {progress.message}
        </p>
        <MilestoneTrack count={progress.count} states={states} />
      </section>

      {MILESTONES.map((m) => (
        <LevelCard key={m.level} level={m.level} />
      ))}

      <section className="card p-5 sm:p-6" aria-labelledby="rw-hist">
        <h2 id="rw-hist" className="text-lg font-semibold">Histórico de resgates</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-ink-soft">Ainda não resgataste nenhuma recompensa.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-ink-muted">
                <tr><th className="py-2 pr-3 font-semibold">Nível</th><th className="py-2 pr-3 font-semibold">Produto</th><th className="py-2 pr-3 font-semibold">Reservada</th><th className="py-2 pr-3 font-semibold">Encomenda</th><th className="py-2 font-semibold">Estado</th></tr>
              </thead>
              <tbody>
                {history.map((r) => {
                  const order = data.orders.find((o) => o.id === r.orderId);
                  return (
                    <tr key={r.id} className="border-t border-sand-200">
                      <td className="py-2 pr-3">{r.level}</td>
                      <td className="py-2 pr-3 font-semibold">{data.rewardItems.find((i) => i.id === r.rewardItemId)?.name}</td>
                      <td className="py-2 pr-3">{formatShortDate(r.reservedAt)}</td>
                      <td className="py-2 pr-3">{order ? <Link className="link" to={`/conta/encomendas/${order.id}`}>{order.number}</Link> : 'Próxima box'}</td>
                      <td className="py-2"><MilestoneStateBadge state={r.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card p-5 sm:p-6" aria-labelledby="rw-ev">
        <h2 id="rw-ev" className="text-lg font-semibold">Histórico de progresso</h2>
        <p className="mt-1 text-sm text-ink-muted">Cada entrega elegível fica registada uma única vez. Saltar, pausar ou cancelar não apaga este histórico.</p>
        {events.length === 0 ? (
          <p className="mt-3 text-ink-soft">Ainda sem boxes entregues.</p>
        ) : (
          <ol className="mt-3 space-y-1.5 text-sm">
            {events.map((e) => {
              const order = data.orders.find((o) => o.id === e.orderId);
              return (
                <li key={e.id} className="flex flex-wrap gap-x-3">
                  <time className="w-24 shrink-0 text-ink-muted" dateTime={e.at}>{formatShortDate(e.at)}</time>
                  {e.type === 'box_delivered' ? (
                    <span>Box entregue · <Link className="link" to={`/conta/encomendas/${e.orderId}`}>{order?.number}</Link></span>
                  ) : (
                    <span className="font-semibold text-tide-700">Marco de nível {e.level} desbloqueado</span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}

function LevelCard({ level }: { level: RewardLevel }) {
  const { data, customer } = useActiveCustomer();
  const act = useAction();
  const fb = useFeedback();
  const m = MILESTONES.find((x) => x.level === level)!;
  const state = milestoneState(data, customer.id, level);
  const red = redemptionForLevel(data.redemptions, customer.id, level);
  const items = compatibleRewardItems(data, customer.id, level);
  const [choice, setChoice] = useState<string>('');
  const upcoming = hasUpcomingBox(data, customer.id);

  return (
    <section className={cx('card p-5 sm:p-6', state === 'available' && 'ring-2 ring-coral/40')} aria-labelledby={`lvl-${level}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={`lvl-${level}`} className="text-lg font-semibold">{m.title} · {m.boxes} boxes</h2>
        <MilestoneStateBadge state={state} />
      </div>
      <p className="mt-1 text-sm text-ink-soft">{m.summary}. Opções para {MODALITIES[customer.profile.modality].label.toLowerCase()}.</p>

      {red && (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-tide-50 p-4 ring-1 ring-tide-200">
          <Gift className="mt-0.5 h-5 w-5 shrink-0 text-tide-600" aria-hidden />
          <div>
            <p className="font-semibold text-abyss-900">{data.rewardItems.find((i) => i.id === red.rewardItemId)?.name}</p>
            <p className="text-sm text-ink-soft">
              {red.status === 'reserved' && `Reservada em ${formatDate(red.reservedAt)}. Segue na tua próxima box.`}
              {red.status === 'shipped' && `Expedida em ${formatDate(red.shippedAt!)} com a encomenda ${data.orders.find((o) => o.id === red.orderId)?.number}.`}
              {red.status === 'received' && `Recebida em ${formatDate(red.receivedAt!)} com a encomenda ${data.orders.find((o) => o.id === red.orderId)?.number}.`}
            </p>
          </div>
        </div>
      )}

      {state === 'available' && !upcoming && (
        <Notice tone="info" className="mt-4">
          Não tens uma próxima box prevista. A recompensa mantém-se disponível e podes escolhê-la quando fizeres uma nova compra ou retomares a subscrição.
        </Notice>
      )}

      {(state === 'available' || state === 'locked') && (
        <fieldset className="mt-4" disabled={state === 'locked' || !upcoming}>
          <legend className="mb-2 text-sm font-semibold">{state === 'locked' ? 'Opções deste nível (bloqueadas)' : 'Escolhe o teu produto'}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((i) => {
              const stock = rewardStock(data, i.id);
              const out = stock.available <= 0;
              return (
                <label key={i.id} className={cx('flex gap-3 rounded-xl border bg-white p-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-tide-400', choice === i.id ? 'border-tide-500 ring-1 ring-tide-500' : 'border-sand-400', (state === 'locked' || out || !upcoming) ? 'cursor-not-allowed opacity-70' : 'cursor-pointer')}>
                  <input type="radio" name={`rw-${level}`} value={i.id} disabled={out} checked={choice === i.id} onChange={() => setChoice(i.id)} className="mt-1 h-4 w-4 accent-tide-600" />
                  <span>
                    <span className="block font-semibold text-abyss-900">{i.name}</span>
                    <span className="block text-sm text-ink-soft">{i.description}</span>
                    <span className="mt-1 block text-xs text-ink-muted">{out ? 'Sem stock disponível' : `${stock.available} disponíveis`}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {state === 'available' && (
            <Button
              className="mt-4"
              disabled={!choice}
              onClick={async () => {
                const item = items.find((i) => i.id === choice);
                if (!item) return;
                const yes = await fb.confirm({
                  title: 'Reservar esta recompensa?',
                  body: `"${item.name}" fica reservado e segue na tua próxima box. Cada recompensa só pode ser resgatada uma vez.`,
                  confirmLabel: 'Reservar',
                });
                if (yes) act((d) => reserveReward(d, customer.id, level, item.id), `"${item.name}" reservado para a tua próxima box.`);
              }}
            >
              Reservar para a próxima box
            </Button>
          )}
          {state === 'locked' && <p className="mt-3 text-sm text-ink-muted"><Badge tone="sand">Bloqueada</Badge> Desbloqueia ao chegar a {m.boxes} boxes entregues.</p>}
        </fieldset>
      )}
    </section>
  );
}
