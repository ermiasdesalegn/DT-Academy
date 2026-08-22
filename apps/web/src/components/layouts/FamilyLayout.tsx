import { NavLink, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { NAV } from './nav';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function FamilyLayout() {
  const user = useAuthStore((s) => s.user)!;
  const logout = useAuthStore((s) => s.logout);
  const links = NAV[user.role];
  const greeting = user.role === 'PARENT' ? 'Family portal' : 'My school';
  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{initials || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-teal-800/70">DT Academy</p>
              <p className="text-lg font-semibold tracking-tight">{greeting}</p>
              <p className="text-sm text-muted-foreground">Hello, {user.name.split(' ')[0]}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
          >
            <LogOut />
            Sign out
          </Button>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 pb-3 sm:px-5">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                `inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                  isActive ? 'bg-teal-800 text-white' : 'text-stone-600 hover:bg-stone-100'
                }`
              }
            >
              <l.icon size={15} />
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-5">
        <Outlet />
      </main>
    </div>
  );
}
