import { Link, useParams } from 'react-router-dom';
import { BookOpen, CircleCheck, Clock3 } from 'lucide-react';
import { Badge, Button, EmptyState } from '../../components/ui';
import { BackLink } from '../../components/commerce';
import { RigDiagram } from '../../components/RigDiagram';
import { GUIDES, guidesFor } from '../../content/guides';
import { MODALITIES } from '../../config/business';
import { markGuideRead, markRigTried, CHALLENGE_IDS } from '../../domain/challenges';
import { useAction, useActiveCustomer } from '../../store/hooks';

export function Learn() {
  const { data, customer } = useActiveCustomer();
  const mine = guidesFor(customer.profile.modality);
  const others = GUIDES.filter((g) => !mine.includes(g));
  const read = new Set(data.guidesRead.filter((g) => g.customerId === customer.id).map((g) => g.guideId));
  const card = (g: (typeof GUIDES)[number]) => (
    <li key={g.id}>
      <Link to={`/conta/aprender/${g.id}`} className="card flex h-full flex-col p-5 transition-shadow hover:shadow-lift">
        <div className="flex flex-wrap gap-2">
          <Badge tone="tide">{g.modality === 'todas' ? 'Todas as modalidades' : MODALITIES[g.modality].label}</Badge>
          <Badge tone="sand"><Clock3 className="h-3 w-3" aria-hidden />{g.minutes} min</Badge>
          {read.has(g.id) && <Badge tone="dark"><CircleCheck className="h-3 w-3" aria-hidden />Lido</Badge>}
        </div>
        <h3 className="mt-3 text-lg font-semibold">{g.title}</h3>
        <p className="mt-1 flex-1 text-sm text-ink-soft">{g.summary}</p>
        {g.rig && <p className="mt-3 text-xs font-bold uppercase tracking-wide text-tide-600">Inclui esquema de montagem</p>}
      </Link>
    </li>
  );
  return (
    <div>
      <h1 className="text-2xl font-semibold">Aprender</h1>
      <p className="mt-1 text-ink-soft">Guias curtos para tirares partido do material. Conteúdo de demonstração, sem vídeos.</p>
      <h2 className="mb-3 mt-6 text-lg font-semibold">Para {MODALITIES[customer.profile.modality].label.toLowerCase()}</h2>
      <ul className="grid gap-4 md:grid-cols-2">{mine.map(card)}</ul>
      <h2 className="mb-3 mt-8 text-lg font-semibold">Outras modalidades</h2>
      <ul className="grid gap-4 md:grid-cols-2">{others.map(card)}</ul>
    </div>
  );
}

export function GuideDetail() {
  const { guideId } = useParams();
  const { data, customer } = useActiveCustomer();
  const act = useAction();
  const g = GUIDES.find((x) => x.id === guideId);
  if (!g) {
    return (
      <div>
        <BackLink to="/conta/aprender">Todos os guias</BackLink>
        <EmptyState icon={<BookOpen className="h-6 w-6" />} title="Guia não encontrado" />
      </div>
    );
  }
  const isRead = data.guidesRead.some((x) => x.customerId === customer.id && x.guideId === g.id);
  const rigDone = data.challengeCompletions.some((c) => c.customerId === customer.id && c.challengeId === CHALLENGE_IDS.try_rig);
  return (
    <article>
      <BackLink to="/conta/aprender">Todos os guias</BackLink>
      <div className="flex flex-wrap gap-2">
        <Badge tone="tide">{g.modality === 'todas' ? 'Todas as modalidades' : MODALITIES[g.modality].label}</Badge>
        <Badge tone="sand">{g.level}</Badge>
        <Badge tone="sand">{g.minutes} min de leitura</Badge>
      </div>
      <h1 className="mt-3 text-3xl font-semibold">{g.title}</h1>
      <p className="mt-2 text-lg text-ink-soft">{g.summary}</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="prose-demo card p-5 sm:p-6">
          {g.sections.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              {s.text && <p>{s.text}</p>}
              {s.steps && <ol>{s.steps.map((st) => <li key={st}>{st}</li>)}</ol>}
            </section>
          ))}
        </div>
        <div className="space-y-4">
          {g.rig && <RigDiagram name={g.rig.name} parts={g.rig.parts} />}
          <div className="card space-y-3 p-5">
            <Button
              className="w-full"
              variant={isRead ? 'secondary' : 'primary'}
              disabled={isRead}
              onClick={() => act((d) => markGuideRead(d, customer.id, g.id), (v) => (v.badge ? 'Guia marcado como lido. Ganhaste o distintivo "Leitor de maré"!' : 'Guia marcado como lido.'))}
            >
              <CircleCheck className="h-4 w-4" aria-hidden /> {isRead ? 'Guia lido' : 'Marcar como lido'}
            </Button>
            {g.rig && (
              <Button
                className="w-full"
                variant="secondary"
                disabled={rigDone}
                onClick={() => act((d) => markRigTried(d, customer.id, g.id), (v) => (v.badge ? 'Boa! Ganhaste o distintivo "Mãos na linha".' : 'Registado.'))}
              >
                {rigDone ? 'Desafio de montagem concluído' : 'Experimentei esta montagem'}
              </Button>
            )}
            <p className="text-xs text-ink-muted">Os desafios dão distintivos visuais, sem valor monetário.</p>
          </div>
        </div>
      </div>
    </article>
  );
}
