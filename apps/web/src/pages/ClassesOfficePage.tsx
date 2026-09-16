import { useEffect, useState } from 'react';
import type { IClassGroup, ICourse } from '@dt-academy/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoader } from '../components/layouts/PageLoader';
import {
  useApplyClassCourseTemplate,
  useClassCourses,
  useClassOverall,
  useClasses,
  useSetHomeroom,
  useUpsertClassCourse,
} from '../hooks/useClasses';
import { useUsers } from '../hooks/useUsers';
import { useT } from '../hooks/useT';
import { gradeLabel } from '../lib/labels';
import { subjectsForGrade } from '../lib/subjectCatalog';

type DraftRow = { name: string; code: string; teacherId: string; savedId?: string };

function toDrafts(courses: ICourse[], gradeLevel: number): DraftRow[] {
  if (courses.length === 0) {
    return subjectsForGrade(gradeLevel).map((s) => ({ ...s, teacherId: '' }));
  }
  return courses.map((c) => ({
    name: c.name,
    code: c.code,
    teacherId: c.teacherId,
    savedId: c._id,
  }));
}

export function ClassesOfficePage() {
  const t = useT();
  const classes = useClasses();
  const teachers = useUsers({ group: 'staff', take: 100 });
  const setHome = useSetHomeroom();
  const upsert = useUpsertClassCourse();
  const applyTemplate = useApplyClassCourseTemplate();
  const teacherList = (teachers.data?.users ?? []).filter((u) => u.role === 'TEACHER' && !u.leftAt);
  const list = classes.data ?? [];
  const [picked, setPicked] = useState<IClassGroup | null>(null);
  const current = picked ?? list[0];
  const overall = useClassOverall({
    gradeLevel: current?.gradeLevel,
    section: current?.section,
    academicYear: current?.academicYear,
    enabled: Boolean(current),
  });
  const courses = useClassCourses({
    gradeLevel: current?.gradeLevel,
    section: current?.section,
    academicYear: current?.academicYear,
    enabled: Boolean(current),
  });
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [savingCode, setSavingCode] = useState<string | null>(null);

  useEffect(() => {
    if (!current || courses.isLoading) return;
    setDrafts(toDrafts(courses.data ?? [], current.gradeLevel));
  }, [current?.gradeLevel, current?.section, current?.academicYear, courses.data, courses.isLoading]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t('classes.title')}</h1>
      <p className="mt-1 text-sm text-slate-500">{t('classes.hint')}</p>

      {classes.isLoading ? (
        <div className="mt-6">
          <PageLoader label={t('classes.loading')} />
        </div>
      ) : classes.isError ? (
        <p className="mt-6 text-sm text-red-600">{t('classes.loadError')}</p>
      ) : list.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">{t('classes.empty')}</p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_1fr]">
          <section className="rounded-2xl border border-gray-200 bg-white">
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
                        {t('classes.studentsN', {
                          n: row.studentCount,
                          teacher: row.homeroomTeacherName ?? t('classes.noRep'),
                        })}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {current ? (
            <section className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-900">
                  {t('classes.representative', {
                    class: `${gradeLabel(current.gradeLevel)} ${current.section}`,
                  })}
                </p>
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <label className="text-sm">
                    <span className="text-slate-600">{t('classes.teacher')}</span>
                    <select
                      className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      defaultValue={current.homeroomTeacherId ?? ''}
                      key={current.homeroomTeacherId ?? 'none'}
                      id="homeroom-teacher"
                    >
                      <option value="">{t('classes.select')}</option>
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
                      void setHome
                        .mutateAsync({
                          gradeLevel: current.gradeLevel,
                          section: current.section,
                          academicYear: current.academicYear,
                          teacherId: el.value,
                        })
                        .catch(() => undefined);
                    }}
                  >
                    {t('classes.save')}
                  </Button>
                </div>
                {setHome.isError ? (
                  <p className="mt-2 text-sm text-red-600">{t('classes.saveRepError')}</p>
                ) : null}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t('classes.subjects')}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {t('classes.subjectsHint', { year: current.academicYear })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={
                        applyTemplate.isPending ||
                        (courses.data?.length ?? 0) === 0 ||
                        current.gradeLevel > 8
                      }
                      onClick={() => {
                        void applyTemplate
                          .mutateAsync({
                            gradeLevel: current.gradeLevel,
                            section: current.section,
                            academicYear: current.academicYear,
                          })
                          .catch(() => undefined);
                      }}
                    >
                      {applyTemplate.isPending
                        ? t('classes.applyingTemplate')
                        : t('classes.applyTemplate')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDrafts((rows) => [...rows, { name: '', code: '', teacherId: '' }])}
                    >
                      {t('classes.addSubject')}
                    </Button>
                  </div>
                </div>

                {courses.isLoading ? (
                  <div className="mt-4">
                    <PageLoader label={t('classes.subjectsLoading')} compact />
                  </div>
                ) : courses.isError ? (
                  <p className="mt-4 text-sm text-red-600">{t('classes.subjectsError')}</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {drafts.map((row, index) => (
                      <li
                        key={`${row.savedId ?? 'new'}-${index}`}
                        className="grid gap-2 rounded-xl border border-slate-100 p-3 sm:grid-cols-[1fr_6rem_1fr_auto]"
                      >
                        <Input
                          placeholder={t('classes.subjectName')}
                          value={row.name}
                          onChange={(e) =>
                            setDrafts((rows) =>
                              rows.map((r, i) => (i === index ? { ...r, name: e.target.value } : r))
                            )
                          }
                        />
                        <Input
                          placeholder={t('classes.code')}
                          value={row.code}
                          onChange={(e) =>
                            setDrafts((rows) =>
                              rows.map((r, i) =>
                                i === index ? { ...r, code: e.target.value.toUpperCase() } : r
                              )
                            )
                          }
                        />
                        <select
                          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                          value={row.teacherId}
                          onChange={(e) =>
                            setDrafts((rows) =>
                              rows.map((r, i) => (i === index ? { ...r, teacherId: e.target.value } : r))
                            )
                          }
                        >
                          <option value="">{t('classes.teacherPh')}</option>
                          {teacherList.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          size="sm"
                          disabled={
                            upsert.isPending ||
                            !row.name.trim() ||
                            !row.code.trim() ||
                            !row.teacherId
                          }
                          onClick={() => {
                            setSavingCode(row.code);
                            void upsert
                              .mutateAsync({
                                name: row.name.trim(),
                                code: row.code.trim(),
                                gradeLevel: current.gradeLevel,
                                section: current.section,
                                academicYear: current.academicYear,
                                teacherId: row.teacherId,
                              })
                              .finally(() => setSavingCode(null));
                          }}
                        >
                          {savingCode === row.code && upsert.isPending
                            ? t('classes.saving')
                            : t('classes.save')}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                {upsert.isError ? (
                  <p className="mt-3 text-sm text-red-600">{t('classes.saveSubjectError')}</p>
                ) : null}
                {applyTemplate.isError ? (
                  <p className="mt-3 text-sm text-red-600">{t('classes.applyTemplateError')}</p>
                ) : null}
                {applyTemplate.isSuccess ? (
                  <p className="mt-3 text-sm text-emerald-700">
                    {t('classes.applyTemplateDone', {
                      classes: applyTemplate.data.targetClasses,
                      subjects: applyTemplate.data.sourceCount,
                    })}
                  </p>
                ) : null}
              </div>

              <OverallTable
                loading={overall.isLoading}
                overall={overall.data}
                empty={t('classes.overallEmpty')}
              />
            </section>
          ) : null}
        </div>
      )}
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
  const t = useT();
  if (loading) {
    return (
      <div className="mt-0">
        <PageLoader label={t('classes.overallLoading')} compact />
      </div>
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
          {t('classes.overallTitle', { term: overall.term })}
          {overall.homeroomTeacherName ? ` · ${overall.homeroomTeacherName}` : ''}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-2.5 font-medium">{t('classes.rank')}</th>
              <th className="px-4 py-2.5 font-medium">{t('classes.student')}</th>
              {overall.subjects.map((s) => (
                <th key={s.name} className="px-4 py-2.5 font-medium">
                  {s.name}
                </th>
              ))}
              <th className="px-4 py-2.5 font-medium">{t('classes.overall')}</th>
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
