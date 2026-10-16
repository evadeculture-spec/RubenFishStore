import { Link, useNavigate } from 'react-router-dom';
import { Button, LinkButton, Notice, PageHeader } from '../../components/ui';
import { loadScenario } from '../../data/scenarios';
import { useAction } from '../../store/hooks';

const TOUR = [
  { t: 'Explora a loja', d: 'Vê a página inicial, compara planos e abre o detalhe de uma box.' },
  { t: 'Faz uma compra simulada', d: 'Escolhe modalidade e plano, preenche os dados fictícios e confirma. Nenhuma cobrança é efetuada.' },
  { t: 'Visita a área de cliente', d: 'Consulta a subscrição, as encomendas e o progresso nas recompensas.' },
  { t: 'Usa as ferramentas de demonstração', d: 'Avança encomendas até à entrega, simula renovações e controla o relógio da demonstração.' },
  { t: 'Desbloqueia uma recompensa', d: 'Carrega o cenário "2 caixas elegíveis", simula a renovação e avança a encomenda até à entrega.' },
  { t: 'Vê o lado da gestão', d: 'Usa o seletor "Ver como gestor" para ver indicadores, encomendas, edições, produtos e recompensas.' },
];

export function DemoAbout() {
  const act = useAction();
  const navigate = useNavigate();
  return (
    <div className="container-page max-w-4xl py-10 sm:py-14">
      <PageHeader eyebrow="Modo demonstração" title="Sobre esta demonstração" intro="Uma versão de teste da Maré Box para conversar com potenciais clientes sobre a proposta." />

      <Notice tone="info" title="O que precisas de saber" className="mb-8">
        Todos os dados são fictícios. Não há pagamentos reais, envios reais nem recolha de dados pessoais: tudo fica guardado apenas no armazenamento local deste navegador e podes repor tudo nas ferramentas de demonstração.
      </Notice>

      <section aria-labelledby="tour" className="card p-6">
        <h2 id="tour" className="text-xl font-semibold">Percurso sugerido</h2>
        <ol className="mt-4 space-y-4">
          {TOUR.map((s, i) => (
            <li key={s.t} className="flex gap-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-tide-600 font-display text-sm font-bold text-white">{i + 1}</span>
              <div>
                <p className="font-semibold text-abyss-900">{s.t}</p>
                <p className="text-ink-soft">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <LinkButton to="/planos">Começar pela loja</LinkButton>
          <Button
            variant="dark"
            onClick={() => {
              const r = act((d) => ({ ok: true, value: loadScenario(d, 'boxes-2', 'spinning-mar') }), 'Cenário com 2 caixas elegíveis carregado.');
              if (r.ok) navigate('/conta');
            }}
          >
            Ir direto ao cenário de recompensas
          </Button>
          <Button variant="secondary" onClick={() => window.dispatchEvent(new Event('mare:open-tools'))}>
            Abrir ferramentas de demonstração
          </Button>
        </div>
      </section>

      <section aria-labelledby="priv" className="prose-demo mt-10">
        <h2 id="priv">Privacidade e dados</h2>
        <p>Esta demonstração não envia dados para nenhum servidor. Usa dados fictícios pré-preenchidos; por favor não introduzas dados pessoais reais.</p>
        <h2>Seletor cliente / gestor</h2>
        <p>O seletor "Ver como cliente / Ver como gestor" existe apenas para a demonstração. Não é autenticação nem controlo de acesso.</p>
        <h2>Valores e condições</h2>
        <p>Preços, portes, marcos de recompensa e produtos são hipóteses de teste do piloto. Não existem avaliações de clientes, certificações, parcerias ou números de vendas reais nesta demonstração.</p>
        <p>
          <Link to="/" className="link">Voltar à página inicial</Link>
        </p>
      </section>
    </div>
  );
}
