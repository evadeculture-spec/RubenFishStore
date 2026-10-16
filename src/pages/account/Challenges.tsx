import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, Footprints, NotebookPen } from 'lucide-react';
import { Badge, Button, Field } from '../../components/ui';
import { SEED_CHALLENGES } from '../../data/catalog';
import { logTrip, validateTrip, type TripInput } from '../../domain/challenges';
import { MODALITIES, MODALITY_ORDER } from '../../config/business';
import { useAction, useActiveCustomer } from '../../store/hooks';
import { formatDate } from '../../utils/dates';
import { cx } from '../../utils/cx';

const ICONS = { read_guide: BookOpen, try_rig: Footprints, log_trip: NotebookPen };

export function Challenges() {
  const { data, customer } = useActiveCustomer();
  const act = useAction();
  const done = new Map(data.challengeCompletions.filter((c) => c.customerId === customer.id).map((c) => [c.challengeId, c]));
  const logs = data.fishingLogs.filter((l) => l.customerId === customer.id).slice().reverse();
  const empty: TripInput = { date: data.clock, spot: '', modality: customer.profile.modality, species: '', notes: '' };
  const [trip, setTrip] = useState<TripInput>(empty);
  const [errors, setErrors] = useState<ReturnType<typeof validateTrip>>({});

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Desafios</h1>
        <p className="mt-1 text-ink-soft">Opcionais e leves. Dão distintivos visuais, sem valor monetário, e não alteram as recompensas em produto.</p>
      </div>

      <ul className="grid gap-4 md:grid-cols-3">
        {SEED_CHALLENGES.map((c) => {
          const Icon = ICONS[c.kind];
          const completion = done.get(c.id);
          return (
            <li key={c.id} className={cx('card p-5', completion && 'ring-2 ring-tide-300')}>
              <div className="flex items-center justify-between gap-2">
                <span className={cx('grid h-11 w-11 place-items-center rounded-full', completion ? 'bg-tide-600 text-white' : 'bg-sand-200 text-ink-soft')}>
                  {completion ? <Award className="h-5 w-5" aria-hidden /> : <Icon className="h-5 w-5" aria-hidden />}
                </span>
                <Badge tone={completion ? 'tide' : 'sand'}>{completion ? 'Concluído' : 'Por fazer'}</Badge>
              </div>
              <h2 className="mt-3 text-lg font-semibold">{c.title}</h2>
              <p className="mt-1 text-sm text-ink-soft">{c.description}</p>
              <p className="mt-3 text-sm">
                Distintivo: <strong className="text-abyss-900">{c.badge}</strong>
                {completion && <span className="text-ink-muted"> · {formatDate(completion.at)}</span>}
              </p>
              {!completion && c.kind !== 'log_trip' && (
                <Link to="/conta/aprender" className="link mt-3 inline-block text-sm">Ir para os guias</Link>
              )}
            </li>
          );
        })}
      </ul>

      <section className="card p-5 sm:p-6" aria-labelledby="trip-h">
        <h2 id="trip-h" className="text-lg font-semibold">Registar uma saída de pesca (demonstração)</h2>
        <p className="mt-1 text-sm text-ink-muted">Sem fotografias nem partilhas. Usa dados fictícios.</p>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const v = validateTrip(trip);
            setErrors(v);
            if (Object.keys(v).length) return;
            const r = act((d) => logTrip(d, customer.id, trip), (x) => (x.badge ? 'Saída registada. Ganhaste o distintivo "Diário de bordo"!' : 'Saída registada.'));
            if (r.ok) setTrip(empty);
          }}
        >
          <Field label="Data" required error={errors.date}>
            {(p) => <input {...p} type="date" className="input" value={trip.date} onChange={(e) => setTrip({ ...trip, date: e.target.value })} />}
          </Field>
          <Field label="Local" required hint="Ex.: Praia fictícia do Norte" error={errors.spot}>
            {(p) => <input {...p} className="input" value={trip.spot} onChange={(e) => setTrip({ ...trip, spot: e.target.value })} />}
          </Field>
          <Field label="Modalidade">
            {(p) => (
              <select {...p} className="input" value={trip.modality} onChange={(e) => setTrip({ ...trip, modality: e.target.value as TripInput['modality'] })}>
                {MODALITY_ORDER.map((m) => <option key={m} value={m}>{MODALITIES[m].label}</option>)}
              </select>
            )}
          </Field>
          <Field label="Espécies (opcional)">
            {(p) => <input {...p} className="input" value={trip.species} onChange={(e) => setTrip({ ...trip, species: e.target.value })} />}
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notas (opcional)" hint="O que correu bem? Que montagem usaste?">
              {(p) => <textarea {...p} rows={3} className="input" value={trip.notes} onChange={(e) => setTrip({ ...trip, notes: e.target.value })} />}
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit">Registar saída</Button>
          </div>
        </form>
      </section>

      {logs.length > 0 && (
        <section className="card p-5 sm:p-6" aria-labelledby="logs-h">
          <h2 id="logs-h" className="text-lg font-semibold">As tuas saídas</h2>
          <ul className="mt-3 divide-y divide-sand-200">
            {logs.map((l) => (
              <li key={l.id} className="py-3">
                <p className="font-semibold text-abyss-900">{formatDate(l.date)} · {l.spot}</p>
                <p className="text-sm text-ink-soft">{MODALITIES[l.modality].label}{l.species && ` · ${l.species}`}</p>
                {l.notes && <p className="mt-1 text-sm text-ink-soft">{l.notes}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
