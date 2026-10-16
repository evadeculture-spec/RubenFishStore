import { EXPERIENCE, MODALITIES, MODALITY_ORDER, PRODUCT_CATEGORIES } from '../config/business';
import type { ExperienceLevel, FishingProfile, Modality, ProductCategory } from '../domain/types';
import { RadioCards } from './ui';

const CATS = Object.keys(PRODUCT_CATEGORIES) as ProductCategory[];

export function ProfileFields({ value, onChange, errors }: { value: FishingProfile; onChange: (p: FishingProfile) => void; errors?: { modality?: string; experience?: string } }) {
  const toggle = (list: 'preferredCategories' | 'avoidCategories', cat: ProductCategory, on: boolean) => {
    const other = list === 'preferredCategories' ? 'avoidCategories' : 'preferredCategories';
    const next = { ...value, [list]: on ? [...value[list], cat] : value[list].filter((c) => c !== cat) };
    if (on) next[other] = value[other].filter((c) => c !== cat);
    onChange(next);
  };
  return (
    <div className="space-y-6">
      <RadioCards
        name="pf-modality"
        legend="Modalidade"
        value={value.modality}
        onChange={(m: Modality) => onChange({ ...value, modality: m })}
        error={errors?.modality}
        options={MODALITY_ORDER.map((m) => ({ value: m, label: MODALITIES[m].label, description: MODALITIES[m].description }))}
      />
      <RadioCards
        name="pf-exp"
        legend="Experiência"
        value={value.experience}
        onChange={(e: ExperienceLevel) => onChange({ ...value, experience: e })}
        error={errors?.experience}
        options={(Object.keys(EXPERIENCE) as ExperienceLevel[]).map((e) => ({ value: e, label: EXPERIENCE[e].label, description: EXPERIENCE[e].description }))}
      />
      <div className="grid gap-6 md:grid-cols-2">
        {(['preferredCategories', 'avoidCategories'] as const).map((list) => (
          <fieldset key={list} className="rounded-xl border border-sand-300 bg-white p-4">
            <legend className="px-1 text-sm font-semibold text-abyss-900">
              {list === 'preferredCategories' ? 'Tipos de produto preferidos' : 'Produtos que gostaria de evitar'} <span className="font-normal text-ink-muted">(opcional)</span>
            </legend>
            <div className="mt-1 grid gap-1 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
              {CATS.map((c) => (
                <label key={c} className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1.5 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-tide-600" checked={value[list].includes(c)} onChange={(e) => toggle(list, c, e.target.checked)} />
                  {PRODUCT_CATEGORIES[c]}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <p className="text-sm text-ink-muted">
        Regra aplicada: um artigo de uma categoria a evitar é trocado por outro produto compatível de preço de referência semelhante, quando houver stock.
      </p>
    </div>
  );
}
