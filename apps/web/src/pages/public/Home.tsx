import { DEFAULT_SITE_CONTENT } from '@dt-academy/types';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  GraduationCap,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  School,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CountUp } from '../../components/motion/CountUp';
import { Tilt3D } from '../../components/motion/Tilt3D';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { useSiteContent } from '../../hooks/useSiteContent';
import { PHOTOS, STUDENT } from '../../lib/schoolPhotos';

const HERO = PHOTOS.hands;
const WELCOME = PHOTOS.classroom;
const P1 = PHOTOS.classroom;
const P2 = PHOTOS.children;
const P3 = PHOTOS.outdoors;
const PARENT = PHOTOS.parent;
const KIDS = [STUDENT, PHOTOS.children, PHOTOS.outdoors, PHOTOS.student, PHOTOS.arrival];

const PROGRAMS = [
  {
    id: 'kg',
    label: 'Kindergarten',
    title: 'Kindergarten',
    body: 'Play, language, and first classroom habits. Pickup is at the KG gate. Families use the parent portal. There is no student login at this age.',
  },
  {
    id: 'primary',
    label: 'Elementary',
    title: 'Grades 1–8',
    body: 'Literacy, numeracy, and subjects with class teachers. Grades 1–4 stay on the family login. The office admits every child; the Director signs official grades.',
  },
  {
    id: 'prep',
    label: 'Prep',
    title: 'Prep',
    body: 'Exam years and subject teachers. From Grade 5 the office may enable a student login. Report cards stay locked until tuition is verified.',
  },
];

const QUOTES = [
  {
    name: 'Ms. Helen Tesfaye',
    role: 'Parent',
    text: 'The office is clear about admission and pickup. Our daughter is in KG and we only use the family login. That is how it should be.',
  },
  {
    name: 'Mr. Abebe Kebede',
    role: 'Parent',
    text: 'Teachers submit the class sheet; the Director approves it. We see school life without a public marketplace of accounts.',
  },
];

export function HomePage() {
  const [program, setProgram] = useState(0);
  const [quote, setQuote] = useState(0);
  const stage = PROGRAMS[program];
  const { data: site = DEFAULT_SITE_CONTENT } = useSiteContent();
  const reduced = useReducedMotion();
  const hero = useScrollProgress<HTMLDivElement>();
  const stats = useScrollProgress<HTMLDivElement>();
  const desks = useScrollProgress<HTMLElement>();
  const welcome = useScrollProgress<HTMLElement>();
  const journey = useScrollProgress<HTMLElement>();
  const grow = useScrollProgress<HTMLElement>();
  const yearbook = useScrollProgress<HTMLElement>();

  const faces = [STUDENT, PHOTOS.student, PHOTOS.outdoors];
  const hp = reduced ? 0.55 : hero.progress;
  const sp = reduced ? 1 : stats.progress;
  const dp = reduced ? 1 : desks.progress;
  const wp = reduced ? 1 : welcome.progress;
  const jp = reduced ? 1 : journey.progress;
  const gp = reduced ? 1 : grow.progress;
  const yp = reduced ? 1 : yearbook.progress;

  return (
    <div className="bg-[#f7f4ee] text-stone-900">
      <section className="relative bg-[#f7f4ee]">
        <div
          ref={hero.ref}
          className="scene-3d relative mx-4 mt-4 grid min-h-[480px] overflow-hidden rounded-[2rem] bg-[#f7f4ee] sm:mx-6 lg:min-h-[520px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"
        >
          <div
            className="relative z-10 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14"
            style={
              reduced
                ? undefined
                : {
                    transform: `translateZ(${(1 - hp) * 28}px) rotateX(${(1 - hp) * 8}deg)`,
                    transformOrigin: 'left center',
                  }
            }
          >
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-600">
              <GraduationCap size={14} />
              {site.heroTagline}
            </p>
            <h1 className="mt-5 text-4xl font-bold uppercase leading-[1.05] tracking-tight text-[#1A2B3C] sm:text-6xl">
              {site.heroTitle}
            </h1>
            <p className="mt-3 text-base font-medium text-stone-600">
              Kindergarten to Grade 8 · {site.city}, {site.country}
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-500">{site.heroBlurb}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/admissions"
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold uppercase text-white hover:bg-red-700"
              >
                Enquire now
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold uppercase text-[#1A2B3C] hover:bg-stone-100"
              >
                About us
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex">
                {faces.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="-ml-2 h-9 w-9 rounded-full object-cover ring-2 ring-white first:ml-0"
                  />
                ))}
                <span className="relative -ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#1A2B3C] text-[10px] font-bold text-white ring-2 ring-white">
                  +2K
                </span>
              </div>
              <p className="text-sm text-stone-500">Trusted by parents from {site.city}.</p>
            </div>
          </div>
          <div className="relative min-h-[280px] overflow-hidden lg:min-h-full">
            <div
              className="hero-window absolute inset-0"
              style={
                reduced
                  ? undefined
                  : {
                      transform: `rotateY(${-14 + hp * 16}deg) translateZ(${hp * 36}px) scale(${1.08 - hp * 0.05})`,
                    }
              }
            >
              <img
                src={HERO}
                alt="Students in class at DT Academy"
                className="absolute inset-0 h-full w-full object-cover object-[center_28%]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-[#f7f4ee] via-[#f7f4ee]/70 to-transparent lg:w-[28%]"
              />
            </div>
          </div>
        </div>

        <div
          ref={stats.ref}
          className="scene-3d relative z-10 mx-4 -mt-8 grid max-w-6xl grid-cols-2 gap-px overflow-visible rounded-2xl bg-stone-200 shadow-lg sm:mx-6 sm:grid-cols-4 lg:mx-auto"
        >
          {[
            { icon: Users, title: <><CountUp to={2000} suffix="+" /></>, label: 'Happy students' },
            { icon: GraduationCap, title: <><CountUp to={60} suffix="+" /></>, label: 'Qualified teachers' },
            { icon: School, title: 'KG – Grade 8', label: 'Quality education' },
            { icon: MapPin, title: site.city, label: site.country },
          ].map((item, i) => (
            <div
              key={item.label}
              className="hinge-slate flex items-center gap-3 bg-white px-4 py-4 sm:px-6"
              style={
                reduced
                  ? undefined
                  : {
                      transform: `rotateX(${(1 - Math.min(1, Math.max(0, sp * 1.4 - i * 0.12))) * 72}deg)`,
                      opacity: 0.35 + Math.min(1, Math.max(0, sp * 1.4 - i * 0.12)) * 0.65,
                    }
              }
            >
              <item.icon className="h-8 w-8 shrink-0 text-red-600" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-bold text-[#1A2B3C]">{item.title}</p>
                <p className="text-xs text-stone-500">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section ref={desks.ref} className="scene-3d-deep mx-auto grid max-w-6xl gap-5 px-4 py-14 sm:px-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            to: '/about',
            icon: Building2,
            title: 'Our school',
            body: 'A closed K–8 campus in Debre Tabor. The office admits every child.',
            link: 'Learn more',
          },
          {
            to: '/academics',
            icon: Award,
            title: 'Our programs',
            body: 'Kindergarten through Grade 8, with class teachers and a Director-signed report.',
            link: 'View programs',
          },
          {
            to: '/admissions',
            icon: Users,
            title: 'Enroll your child',
            body: 'Come to the office with the family. There is no public sign-up form.',
            link: 'How to apply',
          },
          {
            to: '/contact',
            icon: MessageCircle,
            title: 'Contact us',
            body: 'Gate hours, pickup, and tuition questions are handled at the front office.',
            link: 'Get in touch',
          },
        ].map((card, i) => {
          const spread = (i - 1.5) * (22 - dp * 18);
          const lift = (1 - dp) * 48;
          return (
            <Tilt3D key={card.title} className="h-full">
              <article
                className="fan-card h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-100"
                style={
                  reduced
                    ? undefined
                    : {
                        transform: `rotateY(${spread}deg) rotateX(${(1 - dp) * 16}deg) translateY(${lift}px) translateZ(${dp * 28}px)`,
                      }
                }
              >
                <card.icon className="h-8 w-8 text-red-600" strokeWidth={1.5} />
                <h2 className="mt-4 text-lg font-bold text-[#1A2B3C]">{card.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">{card.body}</p>
                <Link to={card.to} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-red-600">
                  {card.link}
                  <ArrowRight size={14} />
                </Link>
              </article>
            </Tilt3D>
          );
        })}
      </section>

      <section className="bg-[#1A2B3C]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 text-red-400" />
            <div>
              <p className="text-sm font-semibold text-white">Have questions?</p>
              <p className="text-sm text-white/70">
                {site.phone} · {site.hours}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-red-400" />
            <p className="text-sm text-white/70">{site.addressLine}</p>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.schoolName} ${site.addressLine}`)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold uppercase text-white hover:bg-red-700"
          >
            Get directions
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <section ref={welcome.ref} className="scene-3d mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div
          style={
            reduced
              ? undefined
              : { transform: `translateX(${(1 - wp) * -36}px) rotateY(${(1 - wp) * -12}deg)` }
          }
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-600">Case to story</p>
          <h2 className="mt-3 text-3xl font-bold uppercase leading-tight sm:text-4xl">
            Welcome to <span className="text-red-600">{site.schoolName}</span>
          </h2>
          <p className="mt-6 text-sm uppercase leading-relaxed tracking-wide text-stone-600">{site.welcomeBody}</p>
        </div>
        <img
          src={WELCOME}
          alt="DT Academy student"
          className="h-[380px] w-full rounded-3xl object-cover object-top shadow-xl"
          style={
            reduced
              ? undefined
              : {
                  transform: `translateY(${(0.5 - wp) * 48}px) rotateY(${18 - wp * 22}deg) scale(${0.92 + wp * 0.08})`,
                }
          }
        />
      </section>

      <section ref={journey.ref} className="scene-3d mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Our program</p>
            <h2 className="mt-2 text-3xl font-bold uppercase sm:text-4xl">
              Journey of education at <span className="text-red-600">DT</span>
            </h2>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300"
              onClick={() => setProgram((i) => (i + 2) % 3)}
              aria-label="Previous program"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300"
              onClick={() => setProgram((i) => (i + 1) % 3)}
              aria-label="Next program"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="mt-8 flex gap-6 border-b border-stone-300 text-xs font-bold uppercase tracking-wider">
          {PROGRAMS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setProgram(i)}
              className={`pb-3 ${i === program ? 'border-b-2 border-red-600 text-red-600' : 'text-stone-500'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-2">
          <div className="preserve-3d grid grid-cols-2 gap-3">
            <img
              src={P1}
              alt=""
              className="col-span-2 h-56 w-full rounded-2xl object-cover"
              style={
                reduced
                  ? undefined
                  : { transform: `rotateX(${(1 - jp) * 18}deg) translateZ(${jp * 20}px)` }
              }
            />
            <img
              src={P2}
              alt=""
              className="h-36 w-full rounded-2xl object-cover"
              style={
                reduced
                  ? undefined
                  : { transform: `rotateY(${-16 + jp * 16}deg) translateX(${(1 - jp) * -20}px)` }
              }
            />
            <img
              src={P3}
              alt=""
              className="h-36 w-full rounded-2xl object-cover"
              style={
                reduced
                  ? undefined
                  : { transform: `rotateY(${16 - jp * 16}deg) translateX(${(1 - jp) * 20}px)` }
              }
            />
          </div>
          <div>
            <h3 className="text-3xl font-bold uppercase">{stage.title}</h3>
            <p className="mt-4 text-sm uppercase leading-relaxed tracking-wide text-stone-600">{stage.body}</p>
            <Link
              to="/academics"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold uppercase text-white"
            >
              Read more
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-red-600">
                <ArrowUpRight size={14} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section ref={grow.ref} className="scene-3d mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase text-stone-800">Why DT Academy</p>
          <div className="mt-10 space-y-8">
            {[
              ['One school, every year', 'Kindergarten through Grade 8 on one roll, with the same office and the same standard.'],
              ['Teachers own the gradebook', 'Marks stay in draft until the Director approves a class sheet.'],
              ['Families, not a marketplace', 'Parent logins are issued at admission. KG to Grade 4 use the family portal only.'],
            ].map(([t, b]) => (
              <article key={t}>
                <h3 className="text-xl font-bold text-[#1A2B3C]">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{b}</p>
              </article>
            ))}
          </div>
        </div>
        <img
          src="/images/grow.png"
          alt="Teachers help students grow"
          className="mx-auto w-full max-w-md"
          style={
            reduced
              ? undefined
              : {
                  transform: `rotateY(${-28 + gp * 36}deg) rotateX(${8 - gp * 8}deg) translateZ(${gp * 40}px)`,
                }
          }
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-600">Testimonial</p>
            <h2 className="mt-3 text-3xl font-bold uppercase sm:text-4xl">What parents say about us</h2>
            <p className="mt-8 font-serif text-6xl leading-none text-red-600">“</p>
            <p className="text-sm uppercase leading-relaxed tracking-wide text-stone-700">{QUOTES[quote].text}</p>
            <div className="mt-8 flex items-center gap-4">
              <img src={PARENT} alt="" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="text-sm font-bold uppercase">{QUOTES[quote].name}</p>
                <p className="text-xs font-semibold uppercase text-red-600">{QUOTES[quote].role}</p>
              </div>
            </div>
            <div className="mt-6 flex h-16 max-w-md items-center justify-center rounded-full bg-[#1A2B3C] text-white">
              <Play size={22} fill="currentColor" />
            </div>
          </div>
          <div className="hidden flex-col items-center gap-2 pt-16 md:flex">
            <button type="button" onClick={() => setQuote((q) => (q + QUOTES.length - 1) % QUOTES.length)} aria-label="Previous">
              <ChevronUp />
            </button>
            {QUOTES.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`h-2 w-2 rounded-full ${i === quote ? 'bg-red-600' : 'bg-stone-300'}`}
                onClick={() => setQuote(i)}
                aria-label={`Quote ${i + 1}`}
              />
            ))}
            <button type="button" onClick={() => setQuote((q) => (q + 1) % QUOTES.length)} aria-label="Next">
              <ChevronDown />
            </button>
          </div>
        </div>
      </section>

      <section ref={yearbook.ref} className="px-4 pb-16 sm:px-6">
        <div className="scene-3d relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#1A2B3C] px-6 py-16 text-center text-white">
          <div className="mb-8 flex justify-center">
            {KIDS.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                className="yearbook-tile -ml-3 h-16 w-12 rounded-lg object-cover ring-2 ring-[#1A2B3C] sm:h-24 sm:w-16"
                style={
                  reduced
                    ? undefined
                    : {
                        transform: `translateY(${Math.sin((yp + i * 0.2) * Math.PI) * -18}px) rotateY(${(i - 2) * (18 - yp * 14)}deg) translateZ(${yp * 32}px)`,
                      }
                }
              />
            ))}
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-red-400">Work together</p>
          <h2 className="mt-3 text-3xl font-bold uppercase sm:text-5xl">Let’s secure your kid’s future</h2>
          <Link
            to="/admissions"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-red-600 px-8 py-3 text-sm font-semibold uppercase hover:bg-red-700"
          >
            Join now
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-600">
              <ArrowUpRight size={14} />
            </span>
          </Link>
          <p className="mt-4 text-xs text-white/50">Join now opens admissions. The office still creates every account.</p>
        </div>
      </section>
    </div>
  );
}
