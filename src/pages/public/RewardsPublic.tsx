import { useState } from 'react';
import { Badge, LinkButton, PageHeader } from '../../components/ui';
import { MilestoneTrack } from '../../components/commerce';
import { LOYALTY, MODALITIES, MODALITY_ORDER } from '../../config/business';
import type { Modality } from '../../domain/types';
import { useDemo } from '../../store/store';
import { cx } from '../../utils/cx';

export function RewardsPublic() {
  const data = useDemo();
  const [modality, setModality] = useState<Modality>('spinning-mar');
  return (
    <div className="container-page py-10 sm:py-14">
      <PageHeader
        eyebrow="Programa de recompensas"
        title="Recompensas em produto, com regras conhecidas"
        intro="O conteúdo das boxes é surpresa. As recompensas não: sabes exatamente quando chegam e podes escolher o produto."
      />

      <section aria-labelledby="funciona" className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 id="funciona" className="text-xl font-semibold">Como funciona</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-ink-soft">
            <li>Cada box com pagamento confirmado e entregue conta <strong>uma vez</strong> para o teu progresso.</li>
            <li>Ao chegares a {LOYALTY.milestones.map((m) => m.boxes).join(', ').replace(/, (\d+)$/, ' e $1')} boxes, desbloqueias o marco correspondente.</li>
            <li>Escolhes um produto entre as opções desse nível compatíveis com a tua modalidade.</li>
            <li>O produto fica reservado e segue na tua próxima box. Ao ser entregue, passa a "recebida".</li>
          </ol>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Marcos</h2>
          <MilestoneTrack count={0} />
        </div>
      </section>

      <section aria-labelledby="catalogo" className="mt-12">
        <h2 id="catalogo" className="text-2xl font-semibold">Catálogo de exemplo</h2>
        <p className="mt-2 text-ink-soft">Produtos fictícios. As opções dependem da tua modalidade.</p>
        <div role="group" aria-label="Filtrar por modalidade" className="my-5 flex flex-wrap gap-2">
          {MODALITY_ORDER.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={m === modality}
              onClick={() => setModality(m)}
              className={cx('rounded-full px-4 py-2 text-sm font-semibold', m === modality ? 'bg-abyss-800 text-sand-100' : 'bg-white ring-1 ring-abyss-800/15 hover:ring-abyss-800/40')}
            >
              {MODALITIES[m].label}
            </button>
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {LOYALTY.milestones.map((m) => (
            <div key={m.level} className="card p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{m.title}</h3>
                <Badge tone="dark">{m.boxes} boxes</Badge>
              </div>
              <p className="mt-1 text-sm text-ink-soft">{m.summary}</p>
              <ul className="mt-4 space-y-2">
                {data.rewardItems
                  .filter((r) => r.level === m.level && r.modalities.includes(modality))
                  .map((r) => (
                    <li key={r.id} className="rounded-xl bg-sand-50 p-3 ring-1 ring-sand-300">
                      <p className="font-semibold text-abyss-900">{r.name}</p>
                      <p className="text-sm text-ink-soft">{r.description}</p>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="condicoes" className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 id="condicoes" className="text-xl font-semibold">Condições simples</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-soft">
            <li>Contam boxes de subscrição e compras avulsas. O plano não altera a contagem.</li>
            <li>Saltar entregas ou pausar não apaga o progresso.</li>
            <li>Cancelar não apaga o histórico nem as recompensas já conquistadas.</li>
            <li>Cada marco é conquistado uma vez e cada recompensa resgatada uma vez.</li>
            <li>Sem próxima box prevista, a recompensa fica disponível para uma compra futura.</li>
            <li>As recompensas não têm valor monetário nem são convertíveis em dinheiro.</li>
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Compras e progresso</h2>
          <p className="mt-3 text-ink-soft">
            Exemplo: com uma subscrição mensal, o primeiro marco chega com a terceira box entregue, cerca de três meses depois da primeira compra. Com subscrição de dois em dois meses, demora cerca do dobro. Uma compra avulsa adicional também conta.
          </p>
          <p className="mt-3 text-ink-soft">Desafios e distintivos da área "Aprender" são opcionais e não alteram as recompensas em produto.</p>
          <LinkButton to="/planos" className="mt-5">Começar</LinkButton>
        </div>
      </section>
    </div>
  );
}
