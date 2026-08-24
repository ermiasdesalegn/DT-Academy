import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Clock, GraduationCap, MapPin, Phone } from 'lucide-react';
import { DEFAULT_SITE_CONTENT } from '@dt-academy/types';
import { useAuthStore } from '../../store/authStore';
import { homePath } from '../../lib/homePath';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLocalizedSite } from '../../hooks/useLocalizedSite';
import { useFormat } from '../../hooks/useFormat';
import { useT } from '../../hooks/useT';
import { LanguageSwitch } from '../LanguageSwitch';
import { isFamilyRole, NAV as ROLE_NAV } from './nav';

const PUBLIC_NAV = [
  { to: '/', labelKey: 'nav.home', end: true },
  { to: '/about', labelKey: 'nav.about' },
  { to: '/service', labelKey: 'nav.service' },
  { to: '/blog', labelKey: 'nav.blog' },
  { to: '/contact', labelKey: 'nav.contact' },
  { to: '/faq', labelKey: 'nav.faq' },
];

export function WebsiteLayout() {
  const t = useT();
  const { hours } = useFormat();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const isPortal = pathname.startsWith('/portal');
  const { data: site = DEFAULT_SITE_CONTENT } = useLocalizedSite();
  const headerNav =
    isPortal && user && isFamilyRole(user.role)
      ? ROLE_NAV[user.role].map((item) => ({ to: item.to, labelKey: item.labelKey, end: item.end }))
      : PUBLIC_NAV;
  const initials = user?.name
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

  return (
    <div className="flex min-h-screen flex-col bg-white text-stone-800">
      <header
        className={
            isPortal
            ? 'sticky top-0 z-40 border-b border-slate-200/80 bg-white text-slate-800'
            : 'sticky top-0 z-40 border-b border-white/10 bg-[#1A2B3C]/95 text-white backdrop-blur-md'
        }
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to={isPortal && user ? homePath(user.role) : '/'} className="flex items-center gap-2.5">
            <span
              className={
                isPortal
                  ? 'flex h-8 w-8 items-center justify-center rounded-md bg-teal-800 text-white'
                  : 'flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1A2B3C]'
              }
            >
              <GraduationCap size={18} />
            </span>
            <span className="font-semibold tracking-tight">DT-Academy</span>
          </Link>
          <nav
            className={
              isPortal
                ? 'hidden items-center gap-6 text-sm font-medium text-stone-500 lg:flex'
                : 'hidden items-center gap-6 text-xs font-semibold uppercase tracking-wide text-white/80 lg:flex'
            }
          >
            {headerNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isPortal
                    ? isActive
                      ? 'text-stone-900'
                      : 'hover:text-stone-800'
                    : `nav-link ${isActive ? 'text-white' : 'hover:text-white'}`
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitch variant={isPortal ? 'light' : 'dark'} />
            {user ? (
              <>
                {isPortal ? (
                  <button
                    type="button"
                    className="rounded-full p-2 text-stone-500 hover:bg-white hover:text-stone-800"
                    aria-label={t('common.notifications')}
                    onClick={() => navigate('/portal/dashboard')}
                  >
                    <Bell size={18} />
                  </button>
                ) : (
                  <Link to={homePath(user.role)} className="text-xs font-semibold uppercase tracking-wide text-white/90 hover:text-white">
                    {t('common.dashboard')}
                  </Link>
                )}
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    className={
                      isPortal
                        ? 'flex items-center gap-2 rounded-full py-0.5 pl-0.5 pr-2 hover:bg-white'
                        : 'rounded-full ring-offset-2 ring-offset-[#1A2B3C] focus:outline-none focus:ring-2 focus:ring-white/50'
                    }
                    aria-expanded={profileOpen}
                    aria-haspopup="menu"
                    aria-label={t('common.accountMenu')}
                    onClick={() => setProfileOpen((open) => !open)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={isPortal ? 'bg-stone-200 text-[10px] font-semibold text-stone-700' : 'bg-teal-700 text-[10px] text-white'}>
                        {initials || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isPortal ? (
                      <>
                        <span className="hidden max-w-[9rem] truncate text-sm font-medium text-stone-800 sm:inline">{user.name}</span>
                        <ChevronDown size={14} className="hidden text-stone-400 sm:block" />
                      </>
                    ) : null}
                  </button>
                  {profileOpen ? (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 text-stone-800 shadow-lg"
                    >
                      <p className="truncate px-3 py-2 text-xs text-stone-500">{user.name}</p>
                      <button
                        type="button"
                        role="menuitem"
                        className="w-full px-3 py-2 text-left text-sm font-medium hover:bg-stone-50"
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                          navigate('/login');
                        }}
                      >
                        {t('common.signOut')}
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#1A2B3C] hover:bg-stone-100"
              >
                {t('common.signIn')}
              </Link>
            )}
          </div>
        </div>
        <nav
          className={`flex gap-1 overflow-x-auto px-4 py-2 lg:hidden ${isPortal ? 'border-t border-stone-200/80' : 'border-t border-white/10'}`}
        >
          {headerNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isPortal
                  ? `shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${isActive ? 'bg-[#1A2B3C] text-white' : 'text-stone-600'}`
                  : `shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${isActive ? 'bg-white text-[#1A2B3C]' : 'text-white/80'}`
              }
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className={`min-h-[70vh] flex-1 ${isPortal ? 'bg-slate-50' : ''}`}>
        <Outlet />
      </main>
      {isPortal ? null : (
      <footer className="bg-[#1A2B3C] text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1A2B3C]">
                <GraduationCap size={18} />
              </span>
              <span className="font-semibold tracking-tight">DT-Academy</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/60">{site.footerBlurb}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">{t('footer.explore')}</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {PUBLIC_NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-white">
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">{t('footer.admissions')}</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>
                <Link to="/admissions" className="hover:text-white">
                  {t('nav.howToApply')}
                </Link>
              </li>
              <li>
                <Link to="/academics" className="hover:text-white">
                  {t('nav.academics')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white">
                  {t('nav.familyStaffLogin')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">{t('footer.visit')}</p>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-red-400" />
                {site.addressLine}
              </li>
              <li className="flex gap-2">
                <Phone size={16} className="mt-0.5 shrink-0 text-red-400" />
                {site.phone}
              </li>
              <li className="flex gap-2">
                <Clock size={16} className="mt-0.5 shrink-0 text-red-400" />
                {hours(site.hours)}
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/45 sm:px-6">
          {t('footer.copyright')}
        </div>
      </footer>
      )}
    </div>
  );
}
