import { Link, NavLink, Outlet } from 'react-router-dom';
import { Facebook, GraduationCap, Instagram, Youtube } from 'lucide-react';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/academics', label: 'Academics' },
  { to: '/admissions', label: 'Admissions' },
  { to: '/contact', label: 'Contact' },
];

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-stone-800">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-800 text-white">
              <GraduationCap size={18} />
            </span>
            <span>
              <span className="block font-serif text-lg leading-none text-stone-900">DT Academy</span>
              <span className="mt-1 block text-[10px] uppercase tracking-[0.18em] text-stone-500">K–G8 · Debre Tabor</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'text-teal-900' : 'hover:text-teal-900')}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/admissions"
              className="rounded-full bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900"
            >
              Apply Now
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-teal-800 hover:text-teal-900"
            >
              Login
            </Link>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-stone-100 px-4 py-2 lg:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `shrink-0 rounded-full px-3 py-1 text-xs font-medium ${isActive ? 'bg-teal-800 text-white' : 'text-stone-600'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-teal-950 text-teal-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-serif text-2xl text-white">DT Academy</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-teal-100/80">
              A closed Kindergarten to Grade 8 school in Debre Tabor, Ethiopia. Public pages tell the story; the office admits students
              and issues family logins.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="Facebook">
                <Facebook size={16} />
              </a>
              <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="Instagram">
                <Instagram size={16} />
              </a>
              <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="YouTube">
                <Youtube size={16} />
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200/70">Visit</p>
            <p className="mt-3 text-sm leading-relaxed text-teal-100/90">
              Main gate, Debre Tabor, Ethiopia
              <br />
              Mon–Fri 8:00–16:00
              <br />
              011 661 4400
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200/70">Quick links</p>
            <ul className="mt-3 space-y-2 text-sm text-teal-100/90">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/login" className="hover:text-white">
                  Family & staff login
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="border-t border-white/10 px-4 py-4 text-center text-xs text-teal-200/50">
          © 2026 DT Academy
        </p>
      </footer>
    </div>
  );
}
