import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen, Gift, LayoutDashboard, Medal, Package, RefreshCw, UserRound } from 'lucide-react';
import { useActiveCustomer } from '../../store/hooks';
import { MODALITIES } from '../../config/business';
import { cx } from '../../utils/cx';

const LINKS = [
  { to: '/conta', label: 'Resumo', icon: LayoutDashboard, end: true },
  { to: '/conta/subscricao', label: 'A minha subscrição', icon: RefreshCw },
  { to: '/conta/encomendas', label: 'Encomendas', icon: Package },
  { to: '/conta/perfil', label: 'Perfil de pesca', icon: UserRound },
  { to: '/conta/recompensas', label: 'Recompensas', icon: Gift },
  { to: '/conta/aprender', label: 'Aprender', icon: BookOpen },
  { to: '/conta/desafios', label: 'Desafios', icon: Medal },
];

export function AccountLayout() {
  const { customer } = useActiveCustomer();
  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Área de cliente · demonstração</p>
          <p className="mt-1 font-display text-2xl font-semibold text-abyss-900 sm:text-3xl">Olá, {customer.name.split(' (')[0].split(' ')[0]}</p>
          <p className="text-sm text-ink-muted">{customer.name} · {MODALITIES[customer.profile.modality].label}</p>
        </div>
        <p className="max-w-xs text-xs text-ink-muted">Sem conta nem palavra-passe: estás a ver um cliente fictício. Muda de cliente nas ferramentas de demonstração.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
        <nav aria-label="Área de cliente" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          <ul className="flex gap-1 lg:flex-col">
            {LINKS.map((l) => (
              <li key={l.to} className="shrink-0">
                <NavLink
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    cx('flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors', isActive ? 'bg-abyss-800 text-sand-100' : 'text-ink-soft hover:bg-abyss-800/5 hover:text-abyss-900')
                  }
                >
                  <l.icon className="h-4 w-4" aria-hidden />
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0" key={customer.id}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
