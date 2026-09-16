import { Link } from 'react-router-dom';
import { OverallTable } from './ClassesOfficePage';
import { PageLoader } from '../components/layouts/PageLoader';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { useTeachingHome } from '../hooks/useClasses';
import { useT } from '../hooks/useT';
import { gradeLabel } from '../lib/labels';

export function TeacherDashboard() {
  const t = useT();
  const { data, isLoading, error } = useTeachingHome();
  const notices = useAnnouncements();
  const homes = data?.homerooms ?? [];
  const courses = data?.courses ?? [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{t('teaching.eyebrow')}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{t('teaching.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('teaching.hint')}</p>
      </div>

      {isLoading ? (
        <PageLoader label={t('teaching.loading')} />
      ) : error ? (
        <p className="text-sm text-red-600">{t('teaching.loadError')}</p>
      ) : (
        <>
          <section>
            <h2 className="text-sm font-semibold text-slate-900">{t('teaching.subjects')}</h2>
            {courses.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">{t('teaching.noSubjects')}</p>
            ) : (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {courses.map((c) => (
                  <li key={c._id}>
                    <Link
                      to={`/admin/teaching/sheets/${c._id}?term=2`}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 hover:border-teal-200"
                    >
                      <span>
                        {gradeLabel(c.gradeLevel)}
                        {c.section} · {c.name}
                      </span>
                      <span className="text-xs font-medium text-teal-800">{t('teaching.gradebook')}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">{t('teaching.notices')}</h2>
            {(notices.data ?? []).length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">{t('teaching.noNotices')}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {(notices.data ?? []).slice(0, 5).map((n) => (
                  <li key={n._id} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{n.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{n.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">{t('teaching.homeroom')}</h2>
            {homes.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">{t('teaching.noHomeroom')}</p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                {t('teaching.holdClasses', {
                  classes: homes.map((h) => `${gradeLabel(h.gradeLevel)} ${h.section}`).join(', '),
                })}
              </p>
            )}
          </section>

          {homes.length ? (
            <OverallTable
              loading={false}
              overall={data?.overall ?? undefined}
              empty={t('teaching.overallEmpty')}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
