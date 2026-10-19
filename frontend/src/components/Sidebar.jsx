import { NavLink, Link } from 'react-router-dom';
import { CheckCircle2, LogOut, X } from 'lucide-react';
import { NAV } from '../lib/nav.js';
import { ROLE_HOME } from '../lib/format.js';

export function Brand({ light = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <img src="/campuscare.png" alt="" className="h-8 w-8 rounded-lg object-contain" />
      <span className={`text-lg font-bold tracking-tight ${light ? 'text-white' : 'text-brand-900'}`}>CampusCare</span>
    </span>
  );
}

export default function Sidebar({ user, mobileOpen, onClose, onLogout }) {
  const items = NAV[user.role] ?? [];
  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <Link to={ROLE_HOME[user.role]} aria-label="CampusCare home"><Brand /></Link>
        <button type="button" className="btn-ghost !min-h-9 !px-2 lg:hidden" onClick={onClose} aria-label="Close menu">
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Main">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-3">
        <div className="mb-2 px-3">
          <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
          <p className="truncate text-xs capitalize text-slate-500">{user.role}{user.department?.name ? ` · ${user.department.name}` : ''}</p>
        </div>
        <button type="button" onClick={onLogout} className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100">
          <LogOut size={18} aria-hidden="true" /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white shadow-xl">{content}</aside>
        </div>
      )}
    </>
  );
}
