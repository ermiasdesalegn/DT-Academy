import { Link } from 'react-router-dom';
import { BookOpen, CalendarCheck } from 'lucide-react';
import { PHOTOS } from '../lib/schoolPhotos';
import { PageLoader } from '../components/layouts/PageLoader';
import { useStudentPortal } from '../hooks/useFamily';
import { useFormat } from '../hooks/useFormat';
import { useT } from '../hooks/useT';
import { attendanceStatusLabel } from '../lib/labels';
import { useAuthStore } from '../store/authStore';

export function StudentDashboard() {
  const t = useT();
  const { date } = useFormat();
  const name = useAuthStore((s) => s.user?.name ?? 'Student');
  const first = name.split(' ')[0];
  const { data, isLoading, error } = useStudentPortal();
  const child = data?.child;
  const results = child?.results ?? [];
  const attendance = child?.attendance ?? [];
  const notices = data?.announcements ?? [];

  return (
    <div className="bg-[#f7f4ee] pb-16">
      <section className="relative mx-4 mt-4 overflow-hidden rounded-[2rem] sm:mx-6">
        <img src={PHOTOS.hands} alt="" className="h-56 w-full object-cover object-[center_30%] sm:h-72" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B3C] via-[#1A2B3C]/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end px-6 py-8 sm:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">{t('portal.student')}</p>
          <h1 className="mt-1 font-serif text-4xl font-medium tracking-tight text-white sm:text-5xl">{t('portal.hi', { name: first })}</h1>
          <p className="mt-2 max-w-lg text-sm text-white/75">
            {t('portal.studentSub')}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        {isLoading ? <PageLoader label={t('portal.loadReport')} variant="portal" /> : null}
        {error ? <p className="text-sm text-red-600">{t('portal.studentError')}</p> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
              <BookOpen size={14} />
              {t('portal.overall')}
            </p>
            {results.length === 0 ? (
              <>
                <p className="mt-3 font-serif text-2xl text-stone-800">{t('portal.noMarks')}</p>
                <p className="mt-2 text-sm text-stone-500">{t('portal.noMarksHint')}</p>
              </>
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {results.map((r) => (
                  <li key={`${r.subject}-${r.term}`} className="flex justify-between gap-3">
                    <span className="text-stone-600">
                      {r.subject} · {t('portal.termN', { n: r.term })}
                    </span>
                    <span className="font-semibold text-teal-900">
                      {r.letterGrade} <span className="font-normal text-stone-400">{r.totalScore}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-[1.5rem] bg-teal-800 p-6 text-white shadow-sm">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-teal-100/80">
              <CalendarCheck size={14} />
              {t('portal.attendance')}
            </p>
            {attendance.length === 0 ? (
              <>
                <p className="mt-3 font-serif text-2xl">{t('portal.noRollYet')}</p>
                <p className="mt-2 text-sm text-teal-100/80">{t('portal.noRollHint')}</p>
              </>
            ) : (
              <ul className="mt-4 space-y-2 text-sm text-teal-50">
                {attendance.slice(0, 8).map((row) => (
                  <li key={`${row.courseName}-${row.date}`} className="flex justify-between gap-3">
                    <span>
                      {row.courseName}
                      <span className="ml-2 text-teal-200/70">{date(row.date)}</span>
                    </span>
                    <span className="font-semibold">{attendanceStatusLabel(row.status)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <section className="mt-10">
          <h2 className="font-serif text-2xl text-stone-900">{t('portal.notices')}</h2>
          {notices.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">{t('portal.noStudentNotices')}</p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {notices.map((n) => (
                <li key={n._id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="font-medium text-stone-900">{n.title}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-stone-600">{n.content}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mt-8 text-sm text-stone-500">
          {t('portal.pickupStudent')}{' '}
          <Link to="/contact" className="font-medium text-teal-800 hover:underline">
            {t('portal.frontOffice')}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
