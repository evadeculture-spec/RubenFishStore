import { NavLink, Outlet } from 'react-router-dom';
import { Boxes, Gift, LayoutDashboard, Package, Tag, Users } from 'lucide-react';
import { Notice } from '../../components/ui';
import { cx } from '../../utils/cx';

const LINKS = [
  { to: '/gestao', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/gestao/clientes', label: 'Clientes', icon: Users },
  { to: '/gestao/encomendas', label: 'Encomendas', icon: Package },
  { to: '/gestao/edicoes', label: 'Edições das boxes', icon: Boxes },
  { to: '/gestao/produtos', label: 'Produtos', icon: Tag },
  { to: '/gestao/recompensas', label: 'Recompensas', icon: Gift },
];

export function AdminLayout() {
  return (
    <div className="bg-[#F4F6F8]">
      <div className="container-page py-8 sm:py-10">
        <p className="eyebrow">Painel de gestão · demonstração</p>
        <Notice tone="warning" className="mb-6 mt-3">
          Vista de gestor apenas para demonstração. O seletor cliente/gestor não é autenticação nem controlo de acesso real.
        </Notice>
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <nav aria-label="Gestão" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            <ul className="flex gap-1 lg:flex-col">
              {LINKS.map((l) => (
                <li key={l.to} className="shrink-0">
                  <NavLink
                    to={l.to}
                    end={l.end}
                    className={({ isActive }) => cx('flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-[15px] font-semibold', isActive ? 'bg-abyss-800 text-sand-100' : 'text-ink-soft hover:bg-abyss-800/5 hover:text-abyss-900')}
                  >
                    <l.icon className="h-4 w-4" aria-hidden />
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
