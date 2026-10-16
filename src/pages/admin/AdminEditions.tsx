import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Boxes, Plus, Trash2 } from 'lucide-react';
import { Badge, Button, EmptyState, LinkButton, Notice, PageHeader, RadioCards } from '../../components/ui';
import { BackLink } from '../../components/commerce';
import { ProductArt } from '../../components/art';
import { MODALITIES, MODALITY_ORDER, PLAN_ORDER, PLANS, PRODUCT_CATEGORIES } from '../../config/business';
import { saveEdition, validateEdition, type EditionInput } from '../../domain/editions';
import type { EditionStatus, Modality, PlanId } from '../../domain/types';
import { useAction } from '../../store/hooks';
import { useDemo } from '../../store/store';
import { formatMonth, monthKey } from '../../utils/dates';
import { formatEUR } from '../../utils/money';
import { cx } from '../../utils/cx';

export function AdminEditions() {
  const data = useDemo();
  const [mod, setMod] = useState<Modality | 'todas'>('todas');
  const list = data.editions
    .filter((e) => mod === 'todas' || e.modality === mod)
    .sort((a, b) => b.month.localeCompare(a.month) || a.modality.localeCompare(b.modality) || PLAN_ORDER.indexOf(a.planId) - PLAN_ORDER.indexOf(b.planId));
  return (
    <div>
      <PageHeader
        title="Edições das boxes"
        intro="Uma edição por mês, modalidade e plano. Na expedição, cada encomenda recebe a edição pronta mais recente até ao seu mês."
        actions={<LinkButton to="/gestao/edicoes/nova"><Plus className="h-4 w-4" aria-hidden /> Nova edição</LinkButton>}
      />
      <div className="mb-4 max-w-xs">
        <label htmlFor="ed-mod" className="mb-1 block text-sm font-semibold">Modalidade</label>
        <select id="ed-mod" className="input" value={mod} onChange={(e) => setMod(e.target.value as Modality | 'todas')}>
          <option value="todas">Todas</option>
          {MODALITY_ORDER.map((m) => <option key={m} value={m}>{MODALITIES[m].label}</option>)}
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-sand-50 text-ink-muted"><tr><th className="px-4 py-3">Edição</th><th className="px-4 py-3">Mês</th><th className="px-4 py-3">Modalidade</th><th className="px-4 py-3">Plano</th><th className="px-4 py-3">Artigos</th><th className="px-4 py-3">Estado</th></tr></thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id} className="border-t border-sand-200">
                <td className="px-4 py-3"><Link className="link" to={`/gestao/edicoes/${e.id}`}>{e.name}</Link></td>
                <td className="px-4 py-3">{formatMonth(e.month)}</td>
                <td className="px-4 py-3">{MODALITIES[e.modality].short}</td>
                <td className="px-4 py-3">{PLANS[e.planId].name}</td>
                <td className="px-4 py-3">{e.items.reduce((s, i) => s + i.quantity, 0)}</td>
                <td className="px-4 py-3"><Badge tone={e.status === 'ready' ? 'tide' : 'sand'}>{e.status === 'ready' ? 'Pronta' : 'Rascunho'}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminEditionEdit() {
  const { id } = useParams();
  const data = useDemo();
  const act = useAction();
  const navigate = useNavigate();
  const existing = data.editions.find((e) => e.id === id);
  const isNew = id === 'nova';
  const [form, setForm] = useState<EditionInput>(() =>
    existing
      ? structuredClone(existing)
      : { name: '', month: monthKey(data.clock), modality: 'spinning-mar', planId: 'explorador', status: 'draft', items: [], notes: '' },
  );
  const [showErrors, setShowErrors] = useState(false);
  const errors = useMemo(() => validateEdition(data, form), [data, form]);
  const compatible = data.products.filter((p) => p.modalities.includes(form.modality));

  if (!existing && !isNew) {
    return <EmptyState icon={<Boxes className="h-6 w-6" />} title="Edição não encontrada" action={<LinkButton to="/gestao/edicoes">Voltar</LinkButton>} />;
  }

  const plan = PLANS[form.planId];
  const units = form.items.reduce((s, i) => s + i.quantity, 0);
  const cost = form.items.reduce((s, i) => s + (data.products.find((p) => p.id === i.productId)?.unitCostCents ?? 0) * i.quantity, 0);
  const ref = form.items.reduce((s, i) => s + (data.products.find((p) => p.id === i.productId)?.referencePriceCents ?? 0) * i.quantity, 0);
  const outOfRange = units < plan.itemsRange[0] || units > plan.itemsRange[1];
  const setItem = (idx: number, patch: Partial<EditionInput['items'][number]>) => setForm({ ...form, items: form.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) });

  return (
    <div>
      <BackLink to="/gestao/edicoes">Edições</BackLink>
      <PageHeader title={isNew ? 'Nova edição' : `Editar: ${existing?.name}`} />
      <form
        noValidate
        className="grid gap-6 xl:grid-cols-[1fr_360px]"
        onSubmit={(e) => {
          e.preventDefault();
          setShowErrors(true);
          if (errors.length) return;
          const r = act((d) => saveEdition(d, form), (v) => `Edição "${v.name}" guardada como ${v.status === 'ready' ? 'pronta' : 'rascunho'}.`);
          if (r.ok) navigate(`/gestao/edicoes/${r.value.id}`, { replace: true });
        }}
      >
        <div className="min-w-0 space-y-5">
          <div className="card grid gap-4 p-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="ed-name" className="mb-1.5 block text-sm font-semibold">Nome</label>
              <input id="ed-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Novembro 2026 · Spinning · Explorador" />
            </div>
            <div>
              <label htmlFor="ed-month" className="mb-1.5 block text-sm font-semibold">Mês</label>
              <input id="ed-month" type="month" className="input" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
            </div>
            <div>
              <label htmlFor="ed-plan" className="mb-1.5 block text-sm font-semibold">Plano</label>
              <select id="ed-plan" className="input" value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value as PlanId })}>
                {PLAN_ORDER.map((p) => <option key={p} value={p}>{PLANS[p].name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="ed-modality" className="mb-1.5 block text-sm font-semibold">Modalidade</label>
              <select id="ed-modality" className="input" value={form.modality} onChange={(e) => setForm({ ...form, modality: e.target.value as Modality })}>
                {MODALITY_ORDER.map((m) => <option key={m} value={m}>{MODALITIES[m].label}</option>)}
              </select>
            </div>
            <RadioCards
              name="ed-status"
              legend="Estado"
              columns={2}
              value={form.status}
              onChange={(v: EditionStatus) => setForm({ ...form, status: v })}
              options={[{ value: 'draft' as EditionStatus, label: 'Rascunho' }, { value: 'ready' as EditionStatus, label: 'Pronta' }]}
            />
          </div>

          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Produtos e quantidades</h2>
              <Button
                size="sm"
                variant="secondary"
                disabled={compatible.length === 0}
                onClick={() => {
                  const free = compatible.find((p) => !form.items.some((i) => i.productId === p.id));
                  if (free) setForm({ ...form, items: [...form.items, { productId: free.id, quantity: 1 }] });
                }}
              >
                <Plus className="h-4 w-4" aria-hidden /> Adicionar produto
              </Button>
            </div>
            {form.items.length === 0 ? (
              <p className="mt-3 text-ink-soft">Sem produtos. Adiciona produtos compatíveis com {MODALITIES[form.modality].label.toLowerCase()}.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {form.items.map((it, idx) => (
                  <li key={idx} className="grid gap-2 rounded-xl bg-sand-50 p-3 ring-1 ring-sand-300 sm:grid-cols-[1fr_110px_auto] sm:items-end">
                    <div>
                      <label htmlFor={`it-p-${idx}`} className="mb-1 block text-xs font-semibold">Produto {idx + 1}</label>
                      <select id={`it-p-${idx}`} className="input" value={it.productId} onChange={(e) => setItem(idx, { productId: e.target.value })}>
                        {data.products
                          .filter((p) => p.modalities.includes(form.modality) || p.id === it.productId)
                          .map((p) => <option key={p.id} value={p.id}>{p.name}{!p.modalities.includes(form.modality) ? ' (incompatível)' : ''}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`it-q-${idx}`} className="mb-1 block text-xs font-semibold">Quantidade</label>
                      <input id={`it-q-${idx}`} type="number" min={1} step={1} className="input" value={it.quantity} onChange={(e) => setItem(idx, { quantity: Number(e.target.value) })} />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })} aria-label={`Remover produto ${idx + 1}`}>
                      <Trash2 className="h-4 w-4" aria-hidden /> Remover
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <label htmlFor="ed-notes" className="mb-1.5 block text-sm font-semibold">Notas internas (opcional)</label>
              <textarea id="ed-notes" rows={2} className="input" value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>

          {showErrors && errors.length > 0 && (
            <div role="alert">
              <Notice tone="warning" title="Corrige antes de guardar">
                <ul className="list-disc pl-4">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
              </Notice>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <Button type="submit">Guardar edição</Button>
            <LinkButton to="/gestao/edicoes" variant="secondary">Cancelar</LinkButton>
          </div>
        </div>

        <aside aria-labelledby="prev-h" className="xl:sticky xl:top-24 xl:self-start">
          <div className="card overflow-hidden">
            <div className="bg-abyss-800 px-5 py-3 text-sand-100">
              <h2 id="prev-h" className="font-display font-semibold text-white">Pré-visualização</h2>
              <p className="text-xs text-sand-100/75">Como o cliente vê a box depois da expedição</p>
            </div>
            <div className="p-5">
              <p className="font-semibold">{form.name || 'Sem nome'}</p>
              <p className="text-sm text-ink-muted">{formatMonth(form.month || monthKey(data.clock))} · {MODALITIES[form.modality].label} · {plan.name}</p>
              <ul className="mt-4 grid grid-cols-3 gap-2">
                {form.items.map((it, idx) => {
                  const p = data.products.find((x) => x.id === it.productId);
                  return p ? (
                    <li key={idx} className="text-center">
                      <ProductArt category={p.category} className="aspect-square w-full" />
                      <p className="mt-1 text-[11px] leading-tight">{p.name}{it.quantity > 1 && ` ×${it.quantity}`}</p>
                    </li>
                  ) : null;
                })}
              </ul>
              <dl className="mt-4 space-y-1 border-t border-sand-300 pt-3 text-sm">
                <div className="flex justify-between"><dt className="text-ink-muted">Artigos</dt><dd className={cx('font-semibold', outOfRange && 'text-coral-600')}>{units} (indicativo: {plan.itemsRange[0]}–{plan.itemsRange[1]})</dd></div>
                <div className="flex justify-between"><dt className="text-ink-muted">Custo simulado</dt><dd className="font-semibold">{formatEUR(cost)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-muted">Preço de referência simulado</dt><dd className="font-semibold">{formatEUR(ref)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-muted">Preço da box</dt><dd className="font-semibold">{formatEUR(plan.priceCents)}</dd></div>
              </dl>
              {outOfRange && <p className="mt-2 text-xs text-coral-600">Fora da quantidade indicativa do plano (aviso, não bloqueia).</p>}
              <p className="mt-2 text-xs text-ink-muted">Uso interno. Os valores de referência não são comunicados como "valor da box".</p>
              <p className="mt-2 text-xs text-ink-muted">Categorias: {[...new Set(form.items.map((i) => data.products.find((p) => p.id === i.productId)?.category).filter(Boolean))].map((c) => PRODUCT_CATEGORIES[c!]).join(', ') || '—'}</p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
