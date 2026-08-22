import { NavLink, Outlet } from 'react-router-dom';
import { Bell, GraduationCap, LogOut, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { NAV, STAFF_NAV_GROUPS, type NavItem } from './nav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function linkClass(isActive: boolean) {
  return [
    'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
    isActive
      ? 'bg-teal-50 font-medium text-teal-900'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
  ].join(' ');
}

function SideLink({ item }: { item: NavItem }) {
  return (
    <NavLink to={item.to} end={item.end} className={({ isActive }) => linkClass(isActive)}>
      <item.icon size={16} className="shrink-0 opacity-80" />
      {item.label}
    </NavLink>
  );
}

export function StaffLayout() {
  const user = useAuthStore((s) => s.user)!;
  const logout = useAuthStore((s) => s.logout);
  const groups = STAFF_NAV_GROUPS[user.role];
  const flat = NAV[user.role];
  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200/80 bg-white">
        <div className="flex h-14 items-center gap-2.5 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-800 text-white">
            <GraduationCap size={15} />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-semibold">DT Academy</p>
            <p className="text-[11px] text-muted-foreground">Operations</p>
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {groups
            ? groups.map((g) => (
                <div key={g.title}>
                  <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {g.title}
                  </p>
                  <div className="space-y-0.5">
                    {g.items.map((item) => (
                      <SideLink key={item.label} item={item} />
                    ))}
                  </div>
                </div>
              ))
            : flat.map((item) => <SideLink key={item.label} item={item} />)}
        </nav>

        <div className="border-t border-slate-200/80 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-500"
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
          >
            <LogOut />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="grid h-14 grid-cols-[1fr_minmax(12rem,28rem)_1fr] items-center gap-4 border-b border-slate-200/80 bg-white px-5">
          <div />
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              readOnly
              placeholder="Search students, staff, classes"
              className="h-9 rounded-lg border-slate-200 bg-slate-50/80 pl-9 pr-12 text-[13px] shadow-none"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-px font-mono text-[10px] text-slate-400 sm:inline">
              Ctrl K
            </kbd>
          </div>
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" className="relative h-9 w-9 text-slate-500" type="button">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="ml-1 flex items-center gap-2 pl-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-teal-800 text-[11px] text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden leading-tight lg:block">
                <p className="text-[13px] font-medium">{user.name}</p>
                <p className="text-[11px] capitalize text-muted-foreground">
                  {user.role.replaceAll('_', ' ').toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
