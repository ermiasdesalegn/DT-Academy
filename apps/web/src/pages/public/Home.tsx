import { DEFAULT_HOME_PAGE, DEFAULT_SITE_CONTENT, parseStatCount } from '@dt-academy/types';
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
import { SplitHeadline } from '../../components/motion/SplitHeadline';
import { Tilt3D } from '../../components/motion/Tilt3D';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { useLocalizedSite } from '../../hooks/useLocalizedSite';
import { useFormat } from '../../hooks/useFormat';
import { useT } from '../../hooks/useT';

const STAT_ICONS = [Users, GraduationCap, School, MapPin];
const CARD_ICONS = [Building2, Award, Users, MessageCircle];

function StatTitle({ value }: { value: string }) {
  const parsed = parseStatCount(value);
  if (!parsed) return <>{value}</>;
  return <CountUp to={parsed.n} suffix={parsed.suffix} />;
}

export function HomePage() {
  const t = useT();
  const { hours } = useFormat();
  const [program, setProgram] = useState(0);
  const [quote, setQuote] = useState(0);
  const { data: site = DEFAULT_SITE_CONTENT } = useLocalizedSite();
  const h = site.home ?? DEFAULT_HOME_PAGE;
  const programs = h.programs;
  const quotesList = h.quotes;
  const stage = programs[Math.min(program, programs.length - 1)];
  const currentQuote = quotesList[Math.min(quote, quotesList.length - 1)];
  const reduced = useReducedMotion();
  const hero = useScrollProgress<HTMLDivElement>();
  const stats = useScrollProgress<HTMLDivElement>();
  const desks = useScrollProgress<HTMLElement>();
  const welcome = useScrollProgress<HTMLElement>();
  const journey = useScrollProgress<HTMLElement>();
  const grow = useScrollProgress<HTMLElement>();
  const yearbook = useScrollProgress<HTMLElement>();
  const quotes = useScrollProgress<HTMLElement>();
  const contact = useScrollProgress<HTMLElement>();
  const [look, setLook] = useState({ x: 0, y: 0 });

  const faces = h.faceImages;
  const hp = reduced ? 0.55 : hero.progress;
  const sp = reduced ? 1 : stats.progress;
  const dp = reduced ? 1 : desks.progress;
  const wp = reduced ? 1 : welcome.progress;
  const jp = reduced ? 1 : journey.progress;
  const gp = reduced ? 1 : grow.progress;
  const yp = reduced ? 1 : yearbook.progress;
  const qp = reduced ? 1 : quotes.progress;
  const cp = reduced ? 1 : contact.progress;

  return (
    <div className="bg-[#f7f4ee] text-stone-900">
      <section className="relative bg-[#f7f4ee]">
        <div
          ref={hero.ref}
          className="scene-3d relative mx-3 mt-3 grid min-h-[500px] overflow-hidden rounded-[1.75rem] bg-[#f3efe6] shadow-[0_30px_80px_-40px_rgb(26_43_60_/_0.45)] ring-1 ring-[#1A2B3C]/10 sm:mx-4 lg:min-h-[560px] lg:grid-cols-[minmax(22rem,0.85fr)_minmax(0,1.4fr)]"
          onMouseMove={(e) => {
            if (reduced) return;
            const r = e.currentTarget.getBoundingClientRect();
            setLook({
              x: (e.clientX - r.left) / r.width - 0.5,
              y: (e.clientY - r.top) / r.height - 0.5,
            });
          }}
          onMouseLeave={() => setLook({ x: 0, y: 0 })}
        >
          <div
            className="relative z-10 flex flex-col justify-center px-5 py-10 sm:px-8 lg:px-10"
            style={
              reduced
                ? undefined
                : {
                    transform: `translate3d(${look.x * -10}px, ${look.y * -8}px, ${(1 - hp) * 36}px) rotateX(${(1 - hp) * 7 + look.y * -4}deg)`,
                    transformOrigin: 'left center',
                  }
            }
          >
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-red-100 bg-white/90 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-600 shadow-sm">
              <GraduationCap size={14} />
              {site.heroTagline}
            </p>
            <SplitHeadline
              text={site.heroTitle}
              className="font-serif mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-[#1A2B3C] sm:text-6xl lg:text-7xl"
            />
            <p className="mt-4 max-w-lg border-l-4 border-red-600 pl-4 font-serif text-2xl font-semibold leading-snug text-red-700 sm:text-3xl">
              {t('common.motto')}
            </p>
            <p className="mt-4 text-lg text-stone-600">
              {h.heroLine} · {site.city}, {site.country}
            </p>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-stone-500">{site.heroBlurb}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/25 hover:bg-red-700"
              >
                {h.enquireLabel}
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/90 px-7 py-3 text-sm font-semibold text-[#1A2B3C] shadow-sm hover:bg-white"
              >
                {h.aboutLabel}
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-3">
              <div className="flex">
                {faces.map((src, i) => (
                  <img
                    key={`${src}-${i}`}
                    src={src}
                    alt=""
                    className="-ml-2 h-9 w-9 rounded-full object-cover ring-2 ring-white first:ml-0"
                  />
                ))}
                <span className="relative -ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#1A2B3C] text-[10px] font-bold text-white ring-2 ring-white">
                  {h.trustBadge}
                </span>
              </div>
              <p className="text-sm text-stone-500">{h.trustLine}</p>
            </div>
          </div>
          <div className="relative min-h-[280px] overflow-hidden lg:min-h-full">
            <div
              className="hero-window absolute inset-0"
              style={
                reduced
                  ? undefined
                  : {
                      transform: `rotateY(${-10 + hp * 12 + look.x * 6}deg) rotateX(${look.y * -4}deg) translateZ(${hp * 24}px)`,
                      boxShadow: `${-20 + look.x * 16}px 24px 50px -18px rgb(26 43 60 / ${0.18 + hp * 0.22})`,
                    }
              }
            >
              <img
                src={h.heroImage}
                alt={`${site.schoolName} students`}
                width={1024}
                height={682}
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-[38%_22%]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-[28%] bg-gradient-to-r from-[#f3efe6] via-[#f3efe6]/65 to-transparent lg:w-[18%]"
              />
              <div aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10" />
            </div>
          </div>
        </div>

        <div
          ref={stats.ref}
          className="relative z-10 mx-3 -mt-10 grid max-w-6xl grid-cols-2 overflow-hidden rounded-3xl bg-white/90 shadow-[0_24px_60px_-28px_rgb(26_43_60_/_0.4)] ring-1 ring-stone-200/80 backdrop-blur-sm sm:mx-4 sm:grid-cols-4 lg:mx-auto"
        >
          {h.stats.map((item, i) => {
            const Icon = STAT_ICONS[i] ?? Users;
            return (
            <div
              key={`${item.label}-${i}`}
              className="border-stone-300 max-sm:odd:border-r max-sm:[&:nth-child(-n+2)]:border-b sm:border-b-0 sm:[&:not(:first-child)]:border-l"
            >
              <div
                className="hinge-slate flex items-center gap-3 px-5 py-6"
                style={
                  reduced
                    ? undefined
                    : {
                        transform: `rotateX(${(1 - Math.min(1, Math.max(0, sp * 1.45 - i * 0.1))) * 48}deg) translateZ(${Math.min(1, Math.max(0, sp * 1.45 - i * 0.1)) * 12}px)`,
                      }
                }
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <div>
                  <p className="font-serif text-lg font-semibold text-[#1A2B3C]">
                    <StatTitle value={item.value} />
                  </p>
                  <p className="text-xs text-stone-500">{item.label}</p>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </section>

      <section ref={desks.ref} className="scene-3d-deep mx-auto grid max-w-6xl gap-5 px-4 py-14 sm:px-6 sm:grid-cols-2 lg:grid-cols-4">
        {h.cards.map((card, i) => {
          const Icon = CARD_ICONS[i] ?? Building2;
          const spread = (i - 1.5) * (10 - dp * 8);
          const lift = (1 - dp) * 28;
          return (
            <Tilt3D key={card.title} className="h-full">
              <article
                className="fan-card h-full rounded-3xl border border-stone-100/80 bg-white p-7"
                style={
                  reduced
                    ? undefined
                    : {
                        transform: `rotateY(${spread}deg) rotateX(${(1 - dp) * 10}deg) translateY(${lift}px) translateZ(${dp * 24}px)`,
                        boxShadow: `0 ${20 + dp * 12}px ${40 + dp * 16}px -24px rgb(26 43 60 / ${0.1 + dp * 0.12})`,
                      }
                }
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1A2B3C]/5 text-red-600">
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <h2 className="font-serif mt-5 text-xl font-semibold text-[#1A2B3C]">{card.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">{card.body}</p>
                <Link to={card.to} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-red-600">
                  {card.link}
                  <ArrowRight size={14} />
                </Link>
              </article>
            </Tilt3D>
          );
        })}
      </section>

      <section ref={contact.ref} className="px-4 sm:px-6">
        <div
          className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-3xl bg-[#1A2B3C] px-6 py-7 shadow-xl sm:px-8 lg:flex-row lg:items-center"
          style={
            reduced
              ? undefined
              : { transform: `translateY(${(1 - cp) * 28}px) rotateX(${(1 - cp) * 18}deg)`, transformOrigin: '50% 100%' }
          }
        >
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 text-red-400" />
            <div>
              <p className="text-sm font-semibold text-white">{h.contactPrompt}</p>
              <p className="text-sm text-white/70">
                {site.phone} · {hours(site.hours)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-red-400" />
            <p className="text-sm text-white/70">{site.addressLine}</p>
          </div>
          <a
            href={h.directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            {h.directionsLabel}
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
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-600">{h.welcomeEyebrow}</p>
          <h2 className="font-serif mt-3 text-4xl font-semibold leading-tight text-[#1A2B3C] sm:text-5xl">
            {h.welcomeTitle} <span className="text-red-600">{site.schoolName}</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-stone-600">{site.welcomeBody}</p>
        </div>
        <img
          src={h.welcomeImage}
          alt={`${site.schoolName} student`}
          className="h-[400px] w-full rounded-[1.75rem] object-cover object-top shadow-[0_28px_60px_-28px_rgb(26_43_60_/_0.45)] ring-1 ring-black/5"
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
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{h.programEyebrow}</p>
            <h2 className="font-serif mt-2 text-4xl font-semibold text-[#1A2B3C] sm:text-5xl">{h.programTitle}</h2>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300"
              onClick={() => setProgram((i) => (i + programs.length - 1) % programs.length)}
              aria-label={t('common.previousProgram')}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300"
              onClick={() => setProgram((i) => (i + 1) % programs.length)}
              aria-label={t('common.nextProgram')}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="mt-8 flex gap-6 border-b border-stone-300 text-xs font-bold uppercase tracking-wider">
          {programs.map((p, i) => (
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
          <div key={program} className="stage-swap preserve-3d grid grid-cols-2 gap-3">
            <img
              src={h.programImages[0]}
              alt=""
              className="col-span-2 h-56 w-full rounded-2xl object-cover shadow-md ring-1 ring-black/5"
              style={
                reduced
                  ? undefined
                  : { transform: `rotateX(${(1 - jp) * 18}deg) translateZ(${jp * 20}px)` }
              }
            />
            <img
              src={h.programImages[1]}
              alt=""
              className="h-36 w-full rounded-2xl object-cover shadow-md ring-1 ring-black/5"
              style={
                reduced
                  ? undefined
                  : { transform: `rotateY(${-16 + jp * 16}deg) translateX(${(1 - jp) * -20}px)` }
              }
            />
            <img
              src={h.programImages[2]}
              alt=""
              className="h-36 w-full rounded-2xl object-cover shadow-md ring-1 ring-black/5"
              style={
                reduced
                  ? undefined
                  : { transform: `rotateY(${16 - jp * 16}deg) translateX(${(1 - jp) * 20}px)` }
              }
            />
          </div>
          <div key={`copy-${program}`} className="stage-swap">
            <h3 className="font-serif text-3xl font-semibold text-[#1A2B3C]">{stage.title}</h3>
            <p className="mt-4 text-base leading-relaxed text-stone-600">{stage.body}</p>
            <Link
              to="/academics"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20"
            >
              {t('common.readMore')}
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-red-600">
                <ArrowUpRight size={14} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section ref={grow.ref} className="scene-3d mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-600">{h.whyEyebrow}</p>
          <div className="mt-10 space-y-8">
            {h.why.map((item, i) => (
              <article
                key={item.title}
                style={
                  reduced
                    ? undefined
                    : {
                        transform: `rotateX(${(1 - Math.min(1, Math.max(0, gp * 1.3 - i * 0.14))) * 42}deg) translateY(${(1 - Math.min(1, Math.max(0, gp * 1.3 - i * 0.14))) * 24}px)`,
                        opacity: 0.2 + Math.min(1, Math.max(0, gp * 1.3 - i * 0.14)) * 0.8,
                      }
                }
              >
                <h3 className="font-serif text-2xl font-semibold text-[#1A2B3C]">{item.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-stone-600">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
        <img
          src={h.growImage}
          alt=""
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

      <section ref={quotes.ref} className="scene-3d mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div
          className="flex items-start justify-between gap-6"
          style={
            reduced
              ? undefined
              : { transform: `rotateX(${(1 - qp) * 12}deg) translateZ(${qp * 20}px)` }
          }
        >
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-600">{h.quotesEyebrow}</p>
            <h2 className="font-serif mt-3 text-4xl font-semibold text-[#1A2B3C] sm:text-5xl">{h.quotesTitle}</h2>
            <div key={quote} className="quote-flip">
              <p className="font-serif mt-8 text-7xl leading-none text-red-600/80">“</p>
              <p className="font-serif -mt-4 text-xl leading-relaxed text-stone-700 sm:text-2xl">{currentQuote.text}</p>
              <div className="mt-8 flex items-center gap-4">
                <img src={h.quoteImage} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow-md" />
                <div>
                  <p className="text-sm font-semibold text-[#1A2B3C]">{currentQuote.name}</p>
                  <p className="text-xs font-medium uppercase tracking-wider text-red-600">{currentQuote.role}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex h-16 max-w-md items-center justify-center rounded-full bg-[#1A2B3C] text-white">
              <Play size={22} fill="currentColor" />
            </div>
          </div>
          <div className="hidden flex-col items-center gap-2 pt-16 md:flex">
            <button type="button" onClick={() => setQuote((q) => (q + quotesList.length - 1) % quotesList.length)} aria-label={t('common.previous')}>
              <ChevronUp />
            </button>
            {quotesList.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`h-2 w-2 rounded-full ${i === quote ? 'bg-red-600' : 'bg-stone-300'}`}
                onClick={() => setQuote(i)}
                aria-label={t('common.quoteN', { n: i + 1 })}
              />
            ))}
            <button type="button" onClick={() => setQuote((q) => (q + 1) % quotesList.length)} aria-label={t('common.next')}>
              <ChevronDown />
            </button>
          </div>
        </div>
      </section>

      <section ref={yearbook.ref} className="px-4 pb-16 sm:px-6">
        <div className="scene-3d relative mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#1A2B3C] to-[#12202c] px-6 pb-20 pt-16 text-center text-white shadow-[0_40px_80px_-36px_rgb(26_43_60_/_0.7)]">
          <div className="mb-10 flex h-36 items-center justify-center sm:h-44">
            {h.yearbookImages.map((src, i) => {
              const raw = Math.min(1, Math.max(0, (yp - 0.08 - Math.abs(i - 2) * 0.04) / 0.42));
              const settle = raw * raw * (3 - 2 * raw);
              const wave = (1 - settle) * 38;
              const lift = (i % 2 === 0 ? -1 : 1) * wave;
              return (
                <img
                  key={`${src}-${i}`}
                  src={src}
                  alt=""
                  className="yearbook-tile relative -ml-3 h-[4.5rem] w-14 rounded-xl object-cover shadow-lg ring-2 ring-white/15 sm:h-28 sm:w-20"
                  style={
                    reduced
                      ? undefined
                      : {
                          transform: `translateY(${lift}px) rotateY(${(i - 2) * 12 * (1 - settle)}deg) translateZ(${(1 - settle) * 24}px)`,
                        }
                  }
                />
              );
            })}
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-400">{h.ctaEyebrow}</p>
          <h2 className="font-serif mt-4 text-4xl font-semibold sm:text-5xl">{h.ctaTitle}</h2>
          <Link
            to="/admissions"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-red-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-900/30 hover:bg-red-700"
          >
            {h.ctaButton}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-600">
              <ArrowUpRight size={14} />
            </span>
          </Link>
          <p className="mt-4 text-xs text-white/50">{h.ctaNote}</p>
        </div>
      </section>
    </div>
  );
}
