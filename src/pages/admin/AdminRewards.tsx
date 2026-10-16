import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, PageHeader } from '../../components/ui';
import { MilestoneStateBadge } from '../../components/commerce';
import { LOYALTY, MODALITIES } from '../../config/business';
import { setRewardStock } from '../../domain/catalog';
import { rewardStock } from '../../domain/rewards';
import { useAction } from '../../store/hooks';
import { useDemo } from '../../store/store';
import { formatShortDate } from '../../utils/dates';

export function AdminRewards() {
  const data = useDemo();
  const act = useAction();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const reds = data.redemptions.slice().sort((a, b) => b.reservedAt.localeCompare(a.reservedAt));
  return (
    <div className="space-y-6">
      <PageHeader title="Recompensas" intro="Stock físico inclui unidades reservadas ainda não expedidas. Disponível = stock − reservadas." />
      {LOYALTY.milestones.map((m) => (
        <section key={m.level} className="card overflow-x-auto" aria-labelledby={`ar-${m.level}`}>
          <h2 id={`ar-${m.level}`} className="px-4 pt-4 text-lg font-semibold">{m.title} · {m.boxes} boxes · {m.summary}</h2>
          <table className="mt-2 w-full min-w-[720px] text-left text-sm">
            <thead className="text-ink-muted"><tr><th className="px-4 py-2">Produto</th><th className="px-4 py-2">Compatibilidade</th><th className="px-4 py-2 text-right">Stock</th><th className="px-4 py-2 text-right">Reservadas</th><th className="px-4 py-2 text-right">Disponíveis</th><th className="px-4 py-2">Ajustar stock</th></tr></thead>
            <tbody>
              {data.rewardItems.filter((i) => i.level === m.level).map((i) => {
                const s = rewardStock(data, i.id);
                const draft = drafts[i.id] ?? String(i.stock);
                return (
                  <tr key={i.id} className="border-t border-sand-200">
                    <td className="px-4 py-2.5 font-semibold">{i.name}</td>
                    <td className="px-4 py-2.5">{i.modalities.map((x) => MODALITIES[x].short).join(', ')}</td>
                    <td className="px-4 py-2.5 text-right">{s.stock}</td>
                    <td className="px-4 py-2.5 text-right">{s.reserved}</td>
                    <td className="px-4 py-2.5 text-right font-semibold">{s.available}</td>
                    <td className="px-4 py-2.5">
                      <form
                        className="flex items-center gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const r = act((d) => setRewardStock(d, i.id, Number(draft)), `Stock de "${i.name}" atualizado.`);
                          if (r.ok) setDrafts((prev) => {
                            const next = { ...prev };
                            delete next[i.id];
                            return next;
                          });
                        }}
                      >
                        <label htmlFor={`rs-${i.id}`} className="sr-only">Stock de {i.name}</label>
                        <input id={`rs-${i.id}`} type="number" min={0} className="input w-20 py-1.5" value={draft} onChange={(e) => setDrafts({ ...drafts, [i.id]: e.target.value })} />
                        <Button type="submit" size="sm" variant="secondary" disabled={draft === String(i.stock)}>Guardar</Button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}

      <section className="card overflow-x-auto" aria-labelledby="ar-hist">
        <h2 id="ar-hist" className="px-4 pt-4 text-lg font-semibold">Histórico de resgates</h2>
        {reds.length === 0 ? <p className="p-4 text-ink-soft">Sem resgates.</p> : (
          <table className="mt-2 w-full min-w-[720px] text-left text-sm">
            <thead className="text-ink-muted"><tr><th className="px-4 py-2">Data</th><th className="px-4 py-2">Cliente</th><th className="px-4 py-2">Nível</th><th className="px-4 py-2">Produto</th><th className="px-4 py-2">Encomenda</th><th className="px-4 py-2">Estado</th></tr></thead>
            <tbody>
              {reds.map((r) => {
                const order = data.orders.find((o) => o.id === r.orderId);
                return (
                  <tr key={r.id} className="border-t border-sand-200">
                    <td className="px-4 py-2.5">{formatShortDate(r.reservedAt)}</td>
                    <td className="px-4 py-2.5"><Link className="link" to={`/gestao/clientes/${r.customerId}`}>{data.customers.find((c) => c.id === r.customerId)?.name}</Link></td>
                    <td className="px-4 py-2.5">{r.level}</td>
                    <td className="px-4 py-2.5">{data.rewardItems.find((i) => i.id === r.rewardItemId)?.name}</td>
                    <td className="px-4 py-2.5">{order ? <Link className="link" to={`/gestao/encomendas/${order.id}`}>{order.number}</Link> : '—'}</td>
                    <td className="px-4 py-2.5"><MilestoneStateBadge state={r.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
