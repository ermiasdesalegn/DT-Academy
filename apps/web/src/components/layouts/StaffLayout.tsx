import { NavLink, Outlet } from 'react-router-dom';
import { GraduationCap, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { NAV, STAFF_NAV_GROUPS, type NavItem } from './nav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

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
        <header className="flex h-14 items-center justify-end gap-3 border-b border-slate-200/80 bg-white px-5">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-teal-800 text-[11px] text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden leading-tight lg:block">
            <p className="text-[13px] font-medium">{user.name}</p>
            <p className="text-[11px] capitalize text-muted-foreground">
              {user.role.replaceAll('_', ' ').toLowerCase()}
            </p>
          </div>
        </header>
        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
