import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Bell, Clock, GraduationCap, MapPin, Phone } from 'lucide-react';
import { DEFAULT_SITE_CONTENT } from '@dt-academy/types';
import { useAuthStore } from '../../store/authStore';
import { homePath } from '../../lib/homePath';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSiteContent } from '../../hooks/useSiteContent';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About Us' },
  { to: '/service', label: 'Service' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/faq', label: 'FAQ' },
];

export function WebsiteLayout() {
  const user = useAuthStore((s) => s.user);
  const { pathname } = useLocation();
  const isPortal = pathname.startsWith('/portal');
  const { data: site = DEFAULT_SITE_CONTENT } = useSiteContent();
  const initials = user?.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-white text-stone-800">
      <header className="sticky top-0 z-40 bg-[#1A2B3C] text-white">
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
                className={({ isActive }) => (isActive ? 'text-white' : 'hover:text-white')}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to={homePath(user.role)} className="text-xs font-semibold uppercase tracking-wide text-white/90 hover:text-white">
                  Dashboard
                </Link>
                <button type="button" className="relative rounded-full p-2 text-white/80 hover:bg-white/10" aria-label="Notifications">
                  <Bell size={18} />
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                </button>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-teal-700 text-[10px] text-white">{initials || 'U'}</AvatarFallback>
                </Avatar>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#1A2B3C] hover:bg-stone-100"
              >
                Sign In / Sign Up
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
              {item.label}
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">Explore</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">Admissions</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>
                <Link to="/admissions" className="hover:text-white">
                  How to apply
                </Link>
              </li>
              <li>
                <Link to="/academics" className="hover:text-white">
                  Academics
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white">
                  Family &amp; staff login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">Visit</p>
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
          © 2026 DT Academy. Enrolment is handled by the office.
        </div>
      </footer>
      )}
    </div>
  );
}
