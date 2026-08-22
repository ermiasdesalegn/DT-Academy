import { NavLink, Outlet } from 'react-router-dom';
import { GraduationCap, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { NAV } from './nav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function FamilyLayout() {
  const user = useAuthStore((s) => s.user)!;
  const logout = useAuthStore((s) => s.logout);
  const links = NAV[user.role];
  const first = user.name.split(' ')[0];
  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 sm:max-w-xl sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-800 text-white">
              <GraduationCap size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-800/70">DT Academy</p>
              <p className="truncate text-base font-semibold tracking-tight text-stone-900">
                {user.role === 'PARENT' ? 'Family' : 'Student'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-stone-800">Hello, {first}</p>
              <p className="text-xs text-stone-500">{user.role === 'PARENT' ? 'Parent' : 'Student'}</p>
            </div>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-teal-800 text-xs text-white">{initials || 'U'}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
              aria-label="Sign out"
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
        {links.length > 0 ? (
        <nav className="mx-auto flex max-w-lg gap-1 px-4 pb-3 sm:max-w-xl sm:px-5">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `inline-flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-teal-800 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                }`
              }
            >
              <l.icon size={15} />
              {l.label}
            </NavLink>
          ))}
        </nav>
        ) : null}
      </header>
      <main className="mx-auto max-w-lg px-4 py-8 sm:max-w-xl sm:px-5">
        <Outlet />
      </main>
    </div>
  );
}
