import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Play } from 'lucide-react';
import { DEFAULT_SITE_CONTENT } from '@dt-academy/types';
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

  return (
    <div className="bg-[#f7f4ee] text-stone-900">
      <section className="relative mx-4 mt-4 overflow-hidden rounded-[2rem] sm:mx-6">
        <img
          src={HERO}
          alt="Students in class at DT Academy"
          className="h-[82vh] min-h-[540px] w-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B3C]/80 via-[#1A2B3C]/25 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end px-6 py-14 sm:px-12 lg:px-16">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">{site.heroTagline}</p>
          <h1 className="mt-3 max-w-xl text-4xl font-bold uppercase leading-tight text-white sm:text-6xl">
            {site.heroTitle}
          </h1>
          <p className="mt-4 max-w-lg text-sm uppercase tracking-wide text-white/85 sm:text-base">{site.heroBlurb}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/admissions"
              className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold uppercase text-white hover:bg-red-700"
            >
              Enquire now
            </Link>
            <Link
              to="/about"
              className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold uppercase text-[#1A2B3C]"
            >
              About us
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
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
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
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
          <div className="grid grid-cols-2 gap-3">
            <img src={P1} alt="" className="col-span-2 h-56 w-full rounded-2xl object-cover" />
            <img src={P2} alt="" className="h-36 w-full rounded-2xl object-cover" />
            <img src={P3} alt="" className="h-36 w-full rounded-2xl object-cover" />
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

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
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

      <section className="px-4 pb-16 sm:px-6">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#1A2B3C] px-6 py-16 text-center text-white">
          <div className="mb-8 flex justify-center">
            {KIDS.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="-ml-3 h-16 w-12 rounded-lg object-cover ring-2 ring-[#1A2B3C] sm:h-24 sm:w-16"
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
