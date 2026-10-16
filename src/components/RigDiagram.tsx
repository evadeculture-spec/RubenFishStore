/** Esquema vertical de uma montagem, desenhado localmente em SVG + HTML. */
export function RigDiagram({ name, parts }: { name: string; parts: string[] }) {
  return (
    <figure className="rounded-2xl bg-abyss-800 p-5 text-sand-100">
      <figcaption className="mb-4 font-display text-lg font-semibold text-white">{name}</figcaption>
      <ol className="relative ml-3 space-y-4 border-l-2 border-dashed border-tide-300/70 pl-6">
        {parts.map((p, i) => (
          <li key={p} className="relative">
            <span aria-hidden className="absolute -left-[33px] top-0.5 grid h-4 w-4 place-items-center rounded-full bg-tide-300 ring-4 ring-abyss-800">
              {i === parts.length - 1 && <span className="h-1.5 w-1.5 rounded-full bg-abyss-900" />}
            </span>
            <span className="text-sm font-semibold">{p}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-sand-100/70">Esquema ilustrativo, de cima (linha principal) para baixo.</p>
    </figure>
  );
}
