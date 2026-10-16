import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FlaskConical, Menu, Wrench, X } from 'lucide-react';
import { LogoMark } from './art';
import { DemoTools } from './DemoTools';
import { Celebration } from './Celebration';
import { useActiveCustomer } from '../store/hooks';
import { cx } from '../utils/cx';
import { formatShortDate } from '../utils/dates';
import { store } from '../store/store';
import { Notice } from './ui';

const NAV = [
  { to: '/planos', label: 'Planos' },
  { to: '/como-funciona', label: 'Como funciona' },
  { to: '/recompensas', label: 'Recompensas' },
];

function RoleSwitch({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const manager = pathname.startsWith('/gestao');
  const go = (to: string) => {
    navigate(to);
    onNavigate?.();
  };
  return (
    <div className="flex flex-col gap-1">
      <div role="group" aria-label="Vista de demonstração" className="inline-flex rounded-full bg-abyss-800/[0.07] p-1 text-sm font-semibold">
        <button
          type="button"
          aria-pressed={!manager}
          onClick={() => go('/conta')}
          className={cx('rounded-full px-3 py-1.5 transition-colors', !manager ? 'bg-white text-abyss-900 shadow-sm' : 'text-ink-soft hover:text-abyss-900')}
        >
          Ver como cliente
        </button>
        <button
          type="button"
          aria-pressed={manager}
          onClick={() => go('/gestao')}
          className={cx('rounded-full px-3 py-1.5 transition-colors', manager ? 'bg-abyss-800 text-sand-100 shadow-sm' : 'text-ink-soft hover:text-abyss-900')}
        >
          Ver como gestor
        </button>
      </div>
    </div>
  );
}

export function Layout() {
  const { data, customer } = useActiveCustomer();
  const [menu, setMenu] = useState(false);
  const [tools, setTools] = useState(false);
  const [recovered, setRecovered] = useState(store.loadStatus === 'recovered');
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    const open = () => setTools(true);
    window.addEventListener('mare:open-tools', open);
    return () => window.removeEventListener('mare:open-tools', open);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#conteudo" className="sr-only z-[70] rounded-lg bg-white px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Saltar para o conteúdo
      </a>
      <div className="on-dark bg-abyss-900 text-sand-100">
        <div className="container-page flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1.5 text-xs sm:text-[13px]">
          <p className="flex items-center gap-1.5">
            <FlaskConical className="h-3.5 w-3.5 text-tide-300" aria-hidden />
            <strong className="font-bold">Modo demonstração</strong>
            <span className="text-sand-100/75">· dados fictícios, sem pagamentos nem envios reais</span>
          </p>
          <p className="flex items-center gap-3 text-sand-100/80">
            <span>
              Relógio: <time dateTime={data.clock}>{formatShortDate(data.clock)}</time>
            </span>
            <Link to="/demonstracao" className="underline decoration-tide-300 underline-offset-2 hover:text-white">
              Sobre a demonstração
            </Link>
          </p>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-sand-300/80 bg-sand-100/90 backdrop-blur supports-[backdrop-filter]:bg-sand-100/75">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 rounded-lg" aria-label="Maré Box — página inicial">
            <LogoMark className="h-9 w-9" />
            <span className="font-display text-xl font-bold tracking-tight text-abyss-900">Maré Box</span>
          </Link>
          <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cx('rounded-full px-3.5 py-2 text-[15px] font-semibold transition-colors', isActive ? 'bg-abyss-800/[0.07] text-abyss-900' : 'text-ink-soft hover:text-abyss-900')
                }
              >
                {n.label}
              </NavLink>
            ))}
            <NavLink
              to="/conta"
              className={({ isActive }) =>
                cx('rounded-full px-3.5 py-2 text-[15px] font-semibold transition-colors', isActive ? 'bg-abyss-800/[0.07] text-abyss-900' : 'text-ink-soft hover:text-abyss-900')
              }
            >
              A minha conta
            </NavLink>
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <RoleSwitch />
          </div>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full hover:bg-abyss-800/5 lg:hidden"
            aria-expanded={menu}
            aria-controls="menu-movel"
            aria-label={menu ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMenu((m) => !m)}
          >
            {menu ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
          </button>
        </div>
        {menu && (
          <div id="menu-movel" className="border-t border-sand-300 bg-sand-100 lg:hidden">
            <nav aria-label="Principal (móvel)" className="container-page flex flex-col gap-1 py-3">
              {[...NAV, { to: '/conta', label: 'A minha conta' }].map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  onClick={() => setMenu(false)}
                  className={({ isActive }) => cx('rounded-xl px-3 py-3 text-base font-semibold', isActive ? 'bg-abyss-800/[0.07]' : 'hover:bg-abyss-800/5')}
                >
                  {n.label}
                </NavLink>
              ))}
              <div className="mt-2 border-t border-sand-300 pt-3">
                <RoleSwitch onNavigate={() => setMenu(false)} />
                <p className="mt-2 text-xs text-ink-muted">Seletor apenas para demonstração: não é autenticação nem controlo de acesso.</p>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main id="conteudo" className="flex-1" tabIndex={-1}>
        {recovered && (
          <div className="container-page pt-4">
            <Notice tone="warning" title="Dados repostos">
              Os dados guardados neste navegador estavam incompletos ou eram de outra versão, por isso a demonstração foi reposta.{' '}
              <button type="button" className="link" onClick={() => setRecovered(false)}>
                Ocultar aviso
              </button>
            </Notice>
          </div>
        )}
        <Outlet />
      </main>

      <footer className="on-dark mt-16 bg-abyss-900 text-sand-100">
        <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-9 w-9" />
              <span className="font-display text-xl font-bold">Maré Box</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-sand-100/75">
              Demonstração de um serviço de boxes surpresa de pesca desportiva para Portugal Continental.
            </p>
          </div>
          <nav aria-label="Loja">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-tide-300">Loja</h2>
            <ul className="space-y-2 text-sm">
              <li><Link className="hover:underline" to="/planos">Planos e preços</Link></li>
              <li><Link className="hover:underline" to="/box/explorador">Detalhe da box</Link></li>
              <li><Link className="hover:underline" to="/como-funciona">Como funciona</Link></li>
              <li><Link className="hover:underline" to="/recompensas">Recompensas</Link></li>
              <li><Link className="hover:underline" to="/#perguntas">Perguntas frequentes</Link></li>
            </ul>
          </nav>
          <nav aria-label="Conta">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-tide-300">Conta</h2>
            <ul className="space-y-2 text-sm">
              <li><Link className="hover:underline" to="/conta">Resumo</Link></li>
              <li><Link className="hover:underline" to="/conta/subscricao">A minha subscrição</Link></li>
              <li><Link className="hover:underline" to="/conta/encomendas">Encomendas</Link></li>
              <li><Link className="hover:underline" to="/conta/aprender">Aprender</Link></li>
              <li><Link className="hover:underline" to="/gestao">Painel de gestão (demonstração)</Link></li>
            </ul>
          </nav>
          <div>
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-tide-300">Demonstração</h2>
            <ul className="space-y-2 text-sm">
              <li><Link className="hover:underline" to="/demonstracao">Sobre a demonstração e privacidade</Link></li>
              <li>
                <button type="button" className="hover:underline" onClick={() => setTools(true)}>
                  Ferramentas de demonstração
                </button>
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-sand-100/60">
              Preços com IVA incluído, apenas ilustrativos. Sem avaliações, parcerias ou certificações reais.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="container-page pb-20 pt-4 text-xs text-sand-100/60 sm:pb-4">Maré Box é um nome provisório. Demonstração sem fins comerciais.</p>
        </div>
      </footer>

      <button
        type="button"
        onClick={() => setTools(true)}
        className="fixed bottom-4 left-4 z-50 inline-flex items-center gap-2 rounded-full bg-abyss-800 px-4 py-3 text-sm font-semibold text-sand-100 shadow-lift transition-colors hover:bg-abyss-700"
        aria-haspopup="dialog"
      >
        <Wrench className="h-4 w-4 text-tide-300" aria-hidden />
        <span className="hidden sm:inline">Ferramentas de demonstração</span>
        <span className="sm:hidden">Demo</span>
      </button>
      <Celebration />
      <DemoTools open={tools} onClose={() => setTools(false)} customerName={customer.name} />
    </div>
  );
}
