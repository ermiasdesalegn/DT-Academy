import { NavLink, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { NAV } from './nav';

export function StaffShell() {
  const user = useAuthStore((s) => s.user)!;
  const logout = useAuthStore((s) => s.logout);
  const links = NAV[user.role];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="flex w-60 shrink-0 flex-col bg-slate-900 text-slate-300">
        <div className="border-b border-white/10 px-5 py-6">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">School</p>
          <p className="mt-1 text-sm font-semibold text-white">DT Academy</p>
          <p className="mt-3 text-xs text-slate-500">{user.role.replaceAll('_', ' ')}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <l.icon size={16} />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <p className="truncate px-3 text-xs text-slate-500">{user.name}</p>
          <button
            type="button"
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/5 hover:text-white"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="border-b border-slate-200 bg-white px-8 py-4">
          <p className="text-sm font-medium text-slate-900">Operations</p>
          <p className="text-xs text-slate-500">Grades, people, payments, and attendance</p>
        </header>
        <main className="px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
