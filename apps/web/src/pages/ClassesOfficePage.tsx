import { useState } from 'react';
import type { IClassGroup } from '@dt-academy/types';
import { Button } from '@/components/ui/button';
import { useClassOverall, useClasses, useSetHomeroom } from '../hooks/useClasses';
import { useUsers } from '../hooks/useUsers';
import { gradeLabel } from '../lib/labels';

export function ClassesOfficePage() {
  const classes = useClasses();
  const teachers = useUsers('staff');
  const setHome = useSetHomeroom();
  const teacherList = (teachers.data ?? []).filter((u) => u.role === 'TEACHER');
  const list = classes.data ?? [];
  const [picked, setPicked] = useState<IClassGroup | null>(null);
  const current = picked ?? list[0];
  const overall = useClassOverall({
    gradeLevel: current?.gradeLevel,
    section: current?.section,
    academicYear: current?.academicYear,
    enabled: Boolean(current),
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Classes</h1>
      <p className="mt-1 text-sm text-slate-500">
        Each class has one representative teacher. That teacher sees every subject mark other teachers have imported.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_1fr]">
        <section className="rounded-2xl border border-gray-200 bg-white">
          {classes.isLoading ? (
            <p className="px-5 py-8 text-sm text-slate-500">Loading classes…</p>
          ) : list.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-500">Admit students first. Classes appear from their grade and section.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {list.map((row) => {
                const active =
                  current?.gradeLevel === row.gradeLevel &&
                  current.section === row.section &&
                  current.academicYear === row.academicYear;
                return (
                  <li key={`${row.academicYear}-${row.gradeLevel}-${row.section}`}>
                    <button
                      type="button"
                      onClick={() => setPicked(row)}
                      className={`w-full px-5 py-3 text-left ${active ? 'bg-slate-50' : ''}`}
                    >
                      <p className="text-sm font-medium text-slate-900">
                        {gradeLabel(row.gradeLevel)} {row.section}
                      </p>
                      <p className="text-xs text-slate-500">
                        {row.studentCount} students · {row.homeroomTeacherName ?? 'No representative'}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {current ? (
          <section className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">
                Representative · {gradeLabel(current.gradeLevel)} {current.section}
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <label className="text-sm">
                  <span className="text-slate-600">Teacher</span>
                  <select
                    className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    defaultValue={current.homeroomTeacherId ?? ''}
                    key={current.homeroomTeacherId ?? 'none'}
                    id="homeroom-teacher"
                  >
                    <option value="">Select…</option>
                    {teacherList.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  type="button"
                  disabled={setHome.isPending}
                  onClick={() => {
                    const el = document.getElementById('homeroom-teacher') as HTMLSelectElement | null;
                    if (!el?.value) return;
                    void setHome.mutateAsync({
                      gradeLevel: current.gradeLevel,
                      section: current.section,
                      academicYear: current.academicYear,
                      teacherId: el.value,
                    });
                  }}
                >
                  Save
                </Button>
              </div>
            </div>

            <OverallTable
              loading={overall.isLoading}
              overall={overall.data}
              empty="Subject teachers import marks. Rank appears here once a sheet is submitted."
            />
          </section>
        ) : null}
      </div>
    </div>
  );
}

export function OverallTable({
  loading,
  overall,
  empty,
}: {
  loading: boolean;
  overall?: import('@dt-academy/types').IClassOverall;
  empty: string;
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-10 text-sm text-slate-500">Loading results…</div>
    );
  }
  if (!overall?.rows.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-10 text-sm text-slate-500">{empty}</div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-3">
        <p className="text-sm font-semibold text-slate-900">
          Overall · Term {overall.term}
          {overall.homeroomTeacherName ? ` · ${overall.homeroomTeacherName}` : ''}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-2.5 font-medium">Rank</th>
              <th className="px-4 py-2.5 font-medium">Student</th>
              {overall.subjects.map((s) => (
                <th key={s.name} className="px-4 py-2.5 font-medium">
                  {s.name}
                </th>
              ))}
              <th className="px-4 py-2.5 font-medium">Overall</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {overall.rows.map((row) => (
              <tr key={row.studentId}>
                <td className="px-4 py-3 text-slate-500">{row.rank ?? '—'}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{row.name}</p>
                  <p className="text-xs text-slate-400">{row.studentIdNumber}</p>
                </td>
                {overall.subjects.map((s) => (
                  <td key={s.name} className="px-4 py-3 text-slate-700">
                    {row.scores[s.name] == null ? '—' : row.scores[s.name]}
                  </td>
                ))}
                <td className="px-4 py-3 font-semibold text-slate-900">
                  {row.overall == null ? '—' : row.overall.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
