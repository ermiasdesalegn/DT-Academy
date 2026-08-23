import { Link } from 'react-router-dom';
import { OverallTable } from './ClassesOfficePage';
import { PageLoader } from '../components/layouts/PageLoader';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { useTeachingHome } from '../hooks/useClasses';
import { gradeLabel } from '../lib/labels';

export function TeacherDashboard() {
  const { data, isLoading, error } = useTeachingHome();
  const notices = useAnnouncements();
  const homes = data?.homerooms ?? [];
  const courses = data?.courses ?? [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Teaching</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">My classes</h1>
        <p className="mt-1 text-sm text-slate-500">
          Open a subject to enter term scores. Attendance is a separate roll for each subject you teach.
        </p>
      </div>

      {isLoading ? (
        <PageLoader label="Loading your classes" />
      ) : error ? (
        <p className="text-sm text-red-600">Could not load teaching. Keep the API running.</p>
      ) : (
        <>
          <section>
            <h2 className="text-sm font-semibold text-slate-900">Subjects I teach</h2>
            {courses.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">The office has not assigned you a subject course yet.</p>
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
                      <span className="text-xs font-medium text-teal-800">Gradebook</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">Office notices</h2>
            {(notices.data ?? []).length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No notices for teachers right now.</p>
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
            <h2 className="text-sm font-semibold text-slate-900">Class representative</h2>
            {homes.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                You are not the representative for a class. The Director assigns that on Classes.
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                You hold {homes.map((h) => `${gradeLabel(h.gradeLevel)} ${h.section}`).join(', ')}. Rank uses submitted
                sheets, not drafts.
              </p>
            )}
          </section>

          {homes.length ? (
            <OverallTable
              loading={false}
              overall={data?.overall ?? undefined}
              empty="No students on this roll yet, or teachers have not submitted sheets."
            />
          ) : null}
        </>
      )}
    </div>
  );
}
