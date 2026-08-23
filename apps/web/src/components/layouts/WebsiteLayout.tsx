import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Clock, GraduationCap, MapPin, Phone } from 'lucide-react';
import { DEFAULT_SITE_CONTENT } from '@dt-academy/types';
import { useAuthStore } from '../../store/authStore';
import { homePath } from '../../lib/homePath';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLocalizedSite } from '../../hooks/useLocalizedSite';
import { useT } from '../../hooks/useT';
import { LanguageSwitch } from '../LanguageSwitch';

const NAV = [
  { to: '/', labelKey: 'nav.home', end: true },
  { to: '/about', labelKey: 'nav.about' },
  { to: '/service', labelKey: 'nav.service' },
  { to: '/blog', labelKey: 'nav.blog' },
  { to: '/contact', labelKey: 'nav.contact' },
  { to: '/faq', labelKey: 'nav.faq' },
];

export function WebsiteLayout() {
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const isPortal = pathname.startsWith('/portal');
  const { data: site = DEFAULT_SITE_CONTENT } = useLocalizedSite();
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
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1A2B3C]/95 text-white backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1A2B3C]">
              <GraduationCap size={18} />
            </span>
            <span className="font-semibold tracking-tight">DT-Academy</span>
          </Link>
          <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-wide text-white/80 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'text-white' : 'hover:text-white'}`
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitch variant="dark" />
            {user ? (
              <>
                <Link to={homePath(user.role)} className="text-xs font-semibold uppercase tracking-wide text-white/90 hover:text-white">
                  {t('common.dashboard')}
                </Link>
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    className="rounded-full ring-offset-2 ring-offset-[#1A2B3C] focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-expanded={profileOpen}
                    aria-haspopup="menu"
                    aria-label={t('common.accountMenu')}
                    onClick={() => setProfileOpen((open) => !open)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-teal-700 text-[10px] text-white">{initials || 'U'}</AvatarFallback>
                    </Avatar>
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
        <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-4 py-2 lg:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${isActive ? 'bg-white text-[#1A2B3C]' : 'text-white/80'}`
              }
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className={`min-h-[70vh] flex-1 ${isPortal ? 'bg-[#f7f4ee]' : ''}`}>
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
              {NAV.map((item) => (
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
                {site.hours}
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
