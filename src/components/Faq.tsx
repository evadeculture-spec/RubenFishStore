import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '../content/faq';

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-sand-300 rounded-2xl border border-sand-300 bg-white">
      {items.map((f) => (
        <details key={f.q} className="group px-5 py-1 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-4 font-semibold text-abyss-900">
            {f.q}
            <ChevronDown className="h-5 w-5 shrink-0 text-tide-600 transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <p className="pb-4 leading-relaxed text-ink-soft">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
