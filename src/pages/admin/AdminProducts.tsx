import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { Badge, Button, Field, Notice, PageHeader } from '../../components/ui';
import { Dialog } from '../../components/Dialog';
import { ProductArt } from '../../components/art';
import { MODALITIES, MODALITY_ORDER, PRODUCT_CATEGORIES } from '../../config/business';
import { saveProduct, validateProduct, type ProductInput } from '../../domain/catalog';
import type { Modality, ProductCategory } from '../../domain/types';
import { useAction } from '../../store/hooks';
import { useDemo } from '../../store/store';
import { formatEUR } from '../../utils/money';

const toEuros = (c: number) => (c / 100).toFixed(2).replace('.', ',');
const toCents = (s: string) => Math.round(Number(s.replace(',', '.')) * 100);

export function AdminProducts() {
  const data = useDemo();
  const act = useAction();
  const [cat, setCat] = useState<ProductCategory | ''>('');
  const [editing, setEditing] = useState<(ProductInput & { costStr: string; refStr: string }) | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const list = data.products.filter((p) => !cat || p.category === cat);

  const open = (p?: ProductInput) => {
    const base: ProductInput = p ?? { name: '', category: 'acessorios', modalities: [], description: '', unitCostCents: 0, referencePriceCents: 0, stock: 0 };
    setErrors([]);
    setEditing({ ...base, costStr: toEuros(base.unitCostCents), refStr: toEuros(base.referencePriceCents) });
  };

  return (
    <div>
      <PageHeader title="Produtos" intro="Catálogo fictício. Custos e preços de referência são simulados e de uso interno." actions={<Button onClick={() => open()}><Plus className="h-4 w-4" aria-hidden /> Novo produto</Button>} />
      <div className="mb-4 max-w-xs">
        <label htmlFor="pc" className="mb-1 block text-sm font-semibold">Categoria</label>
        <select id="pc" className="input" value={cat} onChange={(e) => setCat(e.target.value as ProductCategory | '')}>
          <option value="">Todas</option>
          {(Object.keys(PRODUCT_CATEGORIES) as ProductCategory[]).map((c) => <option key={c} value={c}>{PRODUCT_CATEGORIES[c]}</option>)}
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-sand-50 text-ink-muted"><tr><th className="px-4 py-3">Produto</th><th className="px-4 py-3">Categoria</th><th className="px-4 py-3">Modalidades</th><th className="px-4 py-3 text-right">Custo</th><th className="px-4 py-3 text-right">Ref.</th><th className="px-4 py-3 text-right">Stock</th><th className="px-4 py-3"><span className="sr-only">Ações</span></th></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-sand-200">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ProductArt category={p.category} className="h-10 w-10 shrink-0" />
                    <div><p className="font-semibold">{p.name}</p>{p.featured && <Badge tone="tide">Produto principal</Badge>}</div>
                  </div>
                </td>
                <td className="px-4 py-3">{PRODUCT_CATEGORIES[p.category]}</td>
                <td className="px-4 py-3">{p.modalities.map((m) => MODALITIES[m].short).join(', ')}</td>
                <td className="px-4 py-3 text-right">{formatEUR(p.unitCostCents)}</td>
                <td className="px-4 py-3 text-right">{formatEUR(p.referencePriceCents)}</td>
                <td className="px-4 py-3 text-right">{p.stock < 10 ? <Badge tone="coral">{p.stock} · baixo</Badge> : p.stock}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => open(p)} aria-label={`Editar ${p.name}`}><Pencil className="h-4 w-4" aria-hidden /> Editar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Editar produto' : 'Novo produto'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!editing) return;
                const { costStr, refStr, ...rest } = editing;
                const input: ProductInput = { ...rest, unitCostCents: toCents(costStr), referencePriceCents: toCents(refStr) };
                const errs = validateProduct(input);
                setErrors(errs);
                if (errs.length) return;
                const r = act((d) => saveProduct(d, input), (v) => `Produto "${v.name}" guardado.`);
                if (r.ok) setEditing(null);
              }}
            >
              Guardar
            </Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            {errors.length > 0 && <div role="alert"><Notice tone="warning"><ul className="list-disc pl-4">{errors.map((e) => <li key={e}>{e}</li>)}</ul></Notice></div>}
            <Field label="Nome" required>{(p) => <input {...p} className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />}</Field>
            <Field label="Descrição">{(p) => <input {...p} className="input" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />}</Field>
            <Field label="Categoria">
              {(p) => (
                <select {...p} className="input" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as ProductCategory })}>
                  {(Object.keys(PRODUCT_CATEGORIES) as ProductCategory[]).map((c) => <option key={c} value={c}>{PRODUCT_CATEGORIES[c]}</option>)}
                </select>
              )}
            </Field>
            <fieldset>
              <legend className="mb-1.5 text-sm font-semibold">Modalidades compatíveis</legend>
              <div className="flex flex-wrap gap-4">
                {MODALITY_ORDER.map((m: Modality) => (
                  <label key={m} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="h-4 w-4 accent-tide-600" checked={editing.modalities.includes(m)} onChange={(e) => setEditing({ ...editing, modalities: e.target.checked ? [...editing.modalities, m] : editing.modalities.filter((x) => x !== m) })} />
                    {MODALITIES[m].label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Custo unitário (€)">{(p) => <input {...p} inputMode="decimal" className="input" value={editing.costStr} onChange={(e) => setEditing({ ...editing, costStr: e.target.value })} />}</Field>
              <Field label="Preço de referência (€)">{(p) => <input {...p} inputMode="decimal" className="input" value={editing.refStr} onChange={(e) => setEditing({ ...editing, refStr: e.target.value })} />}</Field>
              <Field label="Stock">{(p) => <input {...p} type="number" min={0} className="input" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} />}</Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-tide-600" checked={Boolean(editing.featured)} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
              Pode ser usado como produto principal
            </label>
          </div>
        )}
      </Dialog>
    </div>
  );
}
