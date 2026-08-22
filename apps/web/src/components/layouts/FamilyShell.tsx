import { NavLink, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { NAV } from './nav';

export function FamilyShell() {
  const user = useAuthStore((s) => s.user)!;
  const logout = useAuthStore((s) => s.logout);
  const links = NAV[user.role];
  const greeting = user.role === 'PARENT' ? 'Family portal' : 'My school';

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200/80 bg-white">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-teal-800/70">
              DT Academy
            </p>
            <p className="mt-0.5 text-lg font-semibold tracking-tight text-stone-900">{greeting}</p>
            <p className="text-sm text-stone-500">Hello, {user.name.split(' ')[0]}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="btn-press inline-flex items-center gap-1.5 self-start rounded-full border border-stone-200 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-50"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-1 px-5 pb-3">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-teal-800 text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`
              }
            >
              <l.icon size={15} />
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  );
}
