import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, FastForward, PackageCheck, RefreshCw, RotateCcw, UserPlus, Users } from 'lucide-react';
import { Dialog } from './Dialog';
import { Button } from './ui';
import { useFeedback } from './feedback';
import { MODALITIES, MODALITY_ORDER } from '../config/business';
import { loadScenario, SCENARIOS, type ScenarioKey } from '../data/scenarios';
import { advanceToDelivered, ORDER_STATUS_LABEL } from '../domain/orders';
import { runDueRenewals, simulateNextRenewal } from '../domain/renewals';
import type { Modality } from '../domain/types';
import { useAction, useActiveCustomer } from '../store/hooks';
import { store } from '../store/store';
import { addDays, addMonths, formatDate } from '../utils/dates';

function Section({ title, icon, children, hint }: { title: string; icon: React.ReactNode; children: React.ReactNode; hint?: string }) {
  return (
    <section className="border-b border-sand-300 py-4 first:pt-0 last:border-0">
      <h3 className="flex items-center gap-2 text-base font-semibold">
        <span className="text-tide-600" aria-hidden>{icon}</span>
        {title}
      </h3>
      {hint && <p className="mt-1 text-sm text-ink-muted">{hint}</p>}
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

export function DemoTools({ open, onClose, customerName }: { open: boolean; onClose: () => void; customerName: string }) {
  const { data, customer } = useActiveCustomer();
  const act = useAction();
  const fb = useFeedback();
  const navigate = useNavigate();
  const [modality, setModality] = useState<Modality>('spinning-mar');
  const openOrders = useMemo(
    () => data.orders.filter((o) => o.customerId === customer.id && o.status !== 'delivered').sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data.orders, customer.id],
  );
  const [orderId, setOrderId] = useState<string>('');
  const selectedOrder = openOrders.find((o) => o.id === orderId) ?? openOrders[0];

  const scenario = (key: ScenarioKey) => {
    act(
      (d) => ({ ok: true, value: loadScenario(d, key, modality) }),
      (c) => `Cenário carregado: ${c.name}. Estás agora a ver a conta deste cliente.`,
    );
    onClose();
    navigate('/conta');
  };

  const shiftClock = (label: string, fn: (date: string) => string) =>
    act((d) => {
      d.clock = fn(d.clock);
      return { ok: true, value: d.clock };
    }, (v) => `Relógio avançado ${label}: ${formatDate(v)}.`);

  return (
    <Dialog open={open} onClose={onClose} side title="Ferramentas de demonstração">
      <p className="mb-4 text-sm text-ink-soft">
        Estas ferramentas simulam a passagem do tempo e operações internas. Afetam apenas os dados guardados neste navegador.
      </p>

      <Section title="Cliente em visualização" icon={<Users className="h-4 w-4" />}>
        <label htmlFor="dt-customer" className="sr-only">Cliente em visualização</label>
        <select
          id="dt-customer"
          className="input"
          value={customer.id}
          onChange={(e) =>
            act((d) => {
              d.activeCustomerId = e.target.value;
              return { ok: true, value: null };
            }, 'Cliente em visualização alterado.')
          }
        >
          {data.customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <p className="text-xs text-ink-muted">A ver agora: <strong>{customerName}</strong></p>
      </Section>

      <Section title="Carregar cenário" icon={<UserPlus className="h-4 w-4" />} hint="Cria um cliente fictício novo (plano Explorador, mensal) e passa a vê-lo.">
        <label htmlFor="dt-mod" className="block text-sm font-semibold">Modalidade do cenário</label>
        <select id="dt-mod" className="input" value={modality} onChange={(e) => setModality(e.target.value as Modality)}>
          {MODALITY_ORDER.map((m) => (
            <option key={m} value={m}>{MODALITIES[m].label}</option>
          ))}
        </select>
        <div className="grid gap-2 pt-1">
          {(Object.keys(SCENARIOS) as ScenarioKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => scenario(k)}
              className="flex flex-col items-start rounded-xl border border-abyss-800/20 bg-white px-4 py-2.5 text-left transition-colors hover:border-abyss-800/40 hover:bg-sand-50"
            >
              <span className="font-semibold text-abyss-800">{SCENARIOS[k].label}</span>
              <span className="text-xs text-ink-muted">{SCENARIOS[k].description}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Renovação" icon={<RefreshCw className="h-4 w-4" />} hint="Avança o relógio até à próxima cobrança do cliente em visualização e gera a encomenda desse ciclo.">
        <Button
          className="w-full"
          onClick={() =>
            act((d) => simulateNextRenewal(d, customer.id), (outs) =>
              outs.map((o) => (o.skipped ? `Ciclo de ${formatDate(o.cycleDate)} saltado.` : `Renovação simulada: encomenda ${o.order!.number} criada.`)).join(' '),
            )
          }
        >
          <RefreshCw className="h-4 w-4" aria-hidden /> Simular próxima renovação
        </Button>
      </Section>

      <Section title="Encomendas" icon={<PackageCheck className="h-4 w-4" />} hint="Avança uma encomenda em curso do cliente por preparação, expedição e entrega.">
        {openOrders.length === 0 ? (
          <p className="rounded-lg bg-sand-200 p-3 text-sm text-ink-soft">Este cliente não tem encomendas em curso. Simula uma renovação ou faz uma compra.</p>
        ) : (
          <>
            <label htmlFor="dt-order" className="block text-sm font-semibold">Encomenda</label>
            <select id="dt-order" className="input" value={selectedOrder?.id} onChange={(e) => setOrderId(e.target.value)}>
              {openOrders.map((o) => (
                <option key={o.id} value={o.id}>{o.number} · {ORDER_STATUS_LABEL[o.status]}</option>
              ))}
            </select>
            <Button
              className="w-full"
              onClick={() => {
                if (!selectedOrder) return;
                const r = act((d) => advanceToDelivered(d, selectedOrder.id), (v) =>
                  v.unlocked.length
                    ? `Encomenda ${v.order.number} entregue. Desbloqueaste a recompensa de nível ${v.unlocked.join(' e ')}!`
                    : `Encomenda ${v.order.number} entregue.`,
                );
                // Fecha o painel para a celebração do marco ficar em primeiro plano.
                if (r.ok && r.value.unlocked.length && data.activeCustomerId === selectedOrder.customerId) onClose();
              }}
            >
              <FastForward className="h-4 w-4" aria-hidden /> Avançar até à entrega
            </Button>
          </>
        )}
      </Section>

      <Section title="Relógio de demonstração" icon={<CalendarClock className="h-4 w-4" />} hint={`Data atual da demonstração: ${formatDate(data.clock)}.`}>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" size="sm" onClick={() => shiftClock('1 dia', (c) => addDays(c, 1))}>+1 dia</Button>
          <Button variant="secondary" size="sm" onClick={() => shiftClock('1 semana', (c) => addDays(c, 7))}>+1 semana</Button>
          <Button variant="secondary" size="sm" onClick={() => shiftClock('1 mês', (c) => addMonths(c, 1))}>+1 mês</Button>
        </div>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => act((d) => ({ ok: true, value: runDueRenewals(d) }), (r) => (r.length ? `${r.length} ciclo(s) vencido(s) processado(s).` : 'Não havia renovações vencidas.'))}
        >
          Processar renovações vencidas (todos os clientes)
        </Button>
      </Section>

      <Section title="Repor dados" icon={<RotateCcw className="h-4 w-4" />} hint="Apaga as alterações feitas neste navegador e volta aos dados iniciais da demonstração.">
        <Button
          variant="danger"
          className="w-full"
          onClick={async () => {
            const yes = await fb.confirm({
              title: 'Repor todos os dados da demonstração?',
              body: 'Encomendas, subscrições, recompensas e cenários criados neste navegador serão apagados. Não afeta mais nada.',
              confirmLabel: 'Repor dados',
              tone: 'danger',
            });
            if (yes) {
              store.reset();
              fb.success('Dados da demonstração repostos.');
              onClose();
              navigate('/');
            }
          }}
        >
          <RotateCcw className="h-4 w-4" aria-hidden /> Repor dados iniciais
        </Button>
      </Section>
    </Dialog>
  );
}
