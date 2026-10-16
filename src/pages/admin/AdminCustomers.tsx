import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, Users } from 'lucide-react';
import { Badge, Button, EmptyState, PageHeader } from '../../components/ui';
import { BackLink, KeyValue, MilestoneStateBadge, OrderStatusBadge } from '../../components/commerce';
import { EXPERIENCE, FREQUENCIES, MODALITIES, PLANS, PRODUCT_CATEGORIES } from '../../config/business';
import { countEligibleBoxes, milestoneState, MILESTONES } from '../../domain/loyalty';
import { latestSubscription, SUBSCRIPTION_STATUS_LABEL } from '../../domain/subscriptions';
import { useAction } from '../../store/hooks';
import { useDemo } from '../../store/store';
import { formatDate, formatShortDate } from '../../utils/dates';
import { formatEUR } from '../../utils/money';
import { useNavigate } from 'react-router-dom';

export function AdminCustomers() {
  const data = useDemo();
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();
  const list = data.customers.filter((c) => !term || c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term));
  return (
    <div>
      <PageHeader title="Clientes" intro={`${data.customers.length} clientes fictícios.`} />
      <div className="relative mb-4 max-w-md">
        <label htmlFor="cs" className="sr-only">Pesquisar por nome ou email</label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
        <input id="cs" type="search" className="input pl-9" placeholder="Pesquisar por nome ou email" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title="Nenhum cliente encontrado">Experimenta outro termo de pesquisa.</EmptyState>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-sand-50 text-ink-muted">
              <tr><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Modalidade</th><th className="px-4 py-3">Subscrição</th><th className="px-4 py-3">Boxes entregues</th><th className="px-4 py-3">Encomendas</th></tr>
            </thead>
            <tbody>
              {list.map((c) => {
                const sub = latestSubscription(data, c.id);
                return (
                  <tr key={c.id} className="border-t border-sand-200">
                    <td className="px-4 py-3"><Link className="link" to={`/gestao/clientes/${c.id}`}>{c.name}</Link><p className="text-xs text-ink-muted">{c.email}</p></td>
                    <td className="px-4 py-3">{MODALITIES[c.profile.modality].label}</td>
                    <td className="px-4 py-3">{sub ? <>{PLANS[sub.planId].name} · <Badge tone={sub.status === 'active' ? 'tide' : 'sand'}>{SUBSCRIPTION_STATUS_LABEL[sub.status]}</Badge></> : <span className="text-ink-muted">Sem subscrição</span>}</td>
                    <td className="px-4 py-3">{countEligibleBoxes(data.progressEvents, c.id)}</td>
                    <td className="px-4 py-3">{data.orders.filter((o) => o.customerId === c.id).length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function AdminCustomerDetail() {
  const { id } = useParams();
  const data = useDemo();
  const act = useAction();
  const navigate = useNavigate();
  const c = data.customers.find((x) => x.id === id);
  if (!c) return <EmptyState icon={<Users className="h-6 w-6" />} title="Cliente não encontrado" />;
  const sub = latestSubscription(data, c.id);
  const orders = data.orders.filter((o) => o.customerId === c.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const reds = data.redemptions.filter((r) => r.customerId === c.id);
  return (
    <div className="space-y-5">
      <BackLink to="/gestao/clientes">Clientes</BackLink>
      <PageHeader
        title={c.name}
        intro={c.email}
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              const r = act((d) => { d.activeCustomerId = c.id; return { ok: true, value: null }; }, `A ver a conta de ${c.name}.`);
              if (r.ok) navigate('/conta');
            }}
          >
            Ver como este cliente
          </Button>
        }
      />
      <section className="card p-5" aria-labelledby="cd-prof">
        <h2 id="cd-prof" className="mb-3 text-lg font-semibold">Perfil</h2>
        <KeyValue
          items={[
            ['Modalidade', MODALITIES[c.profile.modality].label],
            ['Experiência', EXPERIENCE[c.profile.experience].label],
            ['Prefere', c.profile.preferredCategories.map((x) => PRODUCT_CATEGORIES[x]).join(', ') || '—'],
            ['Evitar', c.profile.avoidCategories.map((x) => PRODUCT_CATEGORIES[x]).join(', ') || '—'],
            ['Cliente desde', formatDate(c.createdAt)],
            ['Localidade (fictícia)', c.address?.city ?? '—'],
          ]}
        />
      </section>
      <section className="card p-5" aria-labelledby="cd-sub">
        <h2 id="cd-sub" className="mb-3 text-lg font-semibold">Subscrição</h2>
        {sub ? (
          <KeyValue
            items={[
              ['Plano', PLANS[sub.planId].name],
              ['Frequência', FREQUENCIES[sub.frequency].label],
              ['Estado', SUBSCRIPTION_STATUS_LABEL[sub.status]],
              ['Próxima cobrança', sub.status === 'active' ? formatDate(sub.nextBillingDate) + (sub.skipNext ? ' (a saltar)' : '') : '—'],
            ]}
          />
        ) : (
          <p className="text-ink-soft">Sem subscrição.</p>
        )}
      </section>
      <section className="card p-5" aria-labelledby="cd-rw">
        <h2 id="cd-rw" className="mb-3 text-lg font-semibold">Recompensas · {countEligibleBoxes(data.progressEvents, c.id)} boxes elegíveis</h2>
        <ul className="grid gap-2 sm:grid-cols-3">
          {MILESTONES.map((m) => {
            const r = reds.find((x) => x.level === m.level);
            return (
              <li key={m.level} className="rounded-xl bg-sand-50 p-3 ring-1 ring-sand-300">
                <div className="flex items-center justify-between gap-2"><span className="font-semibold">{m.title}</span><MilestoneStateBadge state={milestoneState(data, c.id, m.level)} /></div>
                {r && <p className="mt-1 text-sm text-ink-soft">{data.rewardItems.find((i) => i.id === r.rewardItemId)?.name}</p>}
              </li>
            );
          })}
        </ul>
      </section>
      <section className="card p-5" aria-labelledby="cd-ord">
        <h2 id="cd-ord" className="mb-3 text-lg font-semibold">Encomendas</h2>
        {orders.length === 0 ? <p className="text-ink-soft">Sem encomendas.</p> : (
          <ul className="divide-y divide-sand-200">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <Link className="link" to={`/gestao/encomendas/${o.id}`}>{o.number}</Link>
                <span className="text-sm text-ink-muted">{formatShortDate(o.createdAt)} · {PLANS[o.planId].name} · {formatEUR(o.totalCents)}</span>
                <OrderStatusBadge status={o.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
