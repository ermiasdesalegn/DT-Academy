import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ChevronDown, GraduationCap, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { NAV, STAFF_NAV_GROUPS, type NavItem } from './nav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LanguageSwitch } from '../LanguageSwitch';
import { useT } from '../../hooks/useT';

function linkClass(isActive: boolean) {
  return [
    'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
    isActive
      ? 'border-l-[3px] border-teal-600 bg-teal-50 font-medium text-teal-900'
      : 'border-l-[3px] border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900',
  ].join(' ');
}

function SideLink({ item }: { item: NavItem }) {
  const t = useT();
  return (
    <NavLink to={item.to} end={item.end} className={({ isActive }) => linkClass(isActive)}>
      <item.icon size={16} className="shrink-0 opacity-80" />
      {t(item.labelKey)}
    </NavLink>
  );
}

export function StaffLayout() {
  const t = useT();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user)!;
  const logout = useAuthStore((s) => s.logout);
  const groups = STAFF_NAV_GROUPS[user.role];
  const flat = NAV[user.role];
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function signOut() {
    setProfileOpen(false);
    logout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200/80 bg-white">
        <div className="flex h-14 items-center gap-2.5 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-800 text-white">
            <GraduationCap size={15} />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-semibold">DT Academy</p>
            <p className="text-[11px] text-muted-foreground">{t('common.operations')}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {groups
            ? groups.map((g) => (
                <div key={g.titleKey}>
                  <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {t(g.titleKey)}
                  </p>
                  <div className="space-y-0.5">
                    {g.items.map((item) => (
                      <SideLink key={item.labelKey} item={item} />
                    ))}
                  </div>
                </div>
              ))
            : flat.map((item) => <SideLink key={item.labelKey} item={item} />)}
        </nav>

        <div className="border-t border-slate-200/80 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-500"
            onClick={signOut}
          >
            <LogOut />
            {t('common.signOut')}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-end gap-3 border-b border-slate-200/80 bg-white px-5">
          <LanguageSwitch variant="light" />
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              className="flex items-center gap-2 rounded-md py-1 pl-1 pr-1.5 hover:bg-slate-50"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              aria-label={t('common.accountMenu')}
              onClick={() => setProfileOpen((open) => !open)}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-teal-800 text-[11px] text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden leading-tight text-left lg:block">
                <p className="text-[13px] font-medium">{user.name}</p>
                <p className="text-[11px] text-muted-foreground">{t(`role.${user.role}`)}</p>
              </div>
              <ChevronDown size={14} className="hidden text-slate-400 lg:block" />
            </button>
            {profileOpen ? (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-slate-800 shadow-lg"
              >
                <p className="truncate px-3 py-2 text-xs text-slate-500">{user.name}</p>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium hover:bg-slate-50"
                  onClick={signOut}
                >
                  <LogOut size={14} />
                  {t('common.signOut')}
                </button>
              </div>
            ) : null}
          </div>
        </header>
        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
