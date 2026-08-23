import { OverallTable } from './ClassesOfficePage';
import { useTeachingHome } from '../hooks/useClasses';
import { gradeLabel } from '../lib/labels';

export function TeacherDashboard() {
  const { data, isLoading, error } = useTeachingHome();
  const homes = data?.homerooms ?? [];
  const courses = data?.courses ?? [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Teaching</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">My classes</h1>
        <p className="mt-1 text-sm text-slate-500">
          If you are the class representative, you see every subject other teachers have imported for that roll.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-600">Could not load teaching. Keep the API running.</p>
      ) : (
        <>
          <section>
            <h2 className="text-sm font-semibold text-slate-900">Subjects I teach</h2>
            {courses.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">The office has not assigned you a subject course yet.</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {courses.map((c) => (
                  <li
                    key={c._id}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                  >
                    {gradeLabel(c.gradeLevel)}
                    {c.section} · {c.name}
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
                You hold{' '}
                {homes.map((h) => `${gradeLabel(h.gradeLevel)} ${h.section}`).join(', ')}. Rank uses submitted sheets,
                not drafts.
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
