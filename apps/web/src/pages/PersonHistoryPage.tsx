import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState, PageHeader } from '../components/layouts/Page';
import { PageLoader } from '../components/layouts/PageLoader';
import { usePersonHistory } from '../hooks/useUsers';
import { useFormat } from '../hooks/useFormat';
import { useT } from '../hooks/useT';
import { attendanceStatusLabel, gradeLabel } from '../lib/labels';

export function PersonHistoryPage() {
  const t = useT();
  const { n, date } = useFormat();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error, isError } = usePersonHistory(id);
  const user = data?.user;
  const former = Boolean(user?.leftAt || user?.studentProfile?.isFormer);

  if (isLoading) {
    return <PageLoader label={t('office.historyLoading')} />;
  }

  if (isError || !data || !user) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link to="/admin">{t('office.backPeople')}</Link>
        </Button>
        <EmptyState
          title={t('office.historyMissing')}
          body={error ? t('office.historyError') : t('office.historyMissingHint')}
        />
      </div>
    );
  }

  const hasStudentHistory = data.results.length > 0 || data.attendance.length > 0;
  const hasTeacherHistory =
    data.coursesTaught.length > 0 || data.sheets.length > 0 || data.attendanceRecordedCount > 0;
  const empty = !hasStudentHistory && !hasTeacherHistory;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title={user.name}
          subtitle={
            user.studentProfile
              ? `${user.studentProfile.studentIdNumber} · ${gradeLabel(user.studentProfile.gradeLevel)}${user.studentProfile.section} · ${user.studentProfile.academicYear}`
              : user.email
          }
        />
        <Button variant="outline" asChild>
          <Link to="/admin">{t('office.backPeople')}</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{user.role}</Badge>
        {former ? (
          <Badge className="border-0 bg-slate-100 font-medium text-slate-700 hover:bg-slate-100">
            {t('office.formerBadge')}
          </Badge>
        ) : null}
        {user.leftAt ? (
          <span className="text-sm text-slate-500">
            {t('office.leftOn')} {date(user.leftAt)}
          </span>
        ) : null}
      </div>
      {user.leftReason ? <p className="text-sm text-slate-500">{user.leftReason}</p> : null}

      {empty ? (
        <EmptyState title={t('office.historyEmpty')} body={t('office.historyEmptyHint')} />
      ) : null}

      {user.role === 'STUDENT' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">{t('office.historyMarks')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('office.historyMarksHint')}</p>
            {data.results.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">{t('office.historyNoMarks')}</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {data.results.map((r, i) => (
                  <li key={`${r.subject}-${r.term}-${r.academicYear}-${i}`} className="flex justify-between gap-3 py-2.5 text-sm">
                    <span className="text-slate-700">
                      {r.subject} · {t('portal.termN', { n: r.term })} · {r.academicYear}
                      <span className="block text-xs text-slate-400">{r.teacherName}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-slate-900">
                      {r.letterGrade} <span className="font-normal text-slate-400">{n(r.totalScore)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">{t('office.historyAttendance')}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {t('office.historyAttendanceHint', {
                present: data.attendanceSummary.present,
                absent: data.attendanceSummary.absent,
                total: data.attendanceSummary.total,
              })}
            </p>
            {data.attendance.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">{t('office.historyNoAttendance')}</p>
            ) : (
              <ul className="mt-4 max-h-80 divide-y divide-slate-100 overflow-y-auto">
                {data.attendance.map((a, i) => (
                  <li key={`${a.courseName}-${a.date}-${i}`} className="flex justify-between gap-3 py-2.5 text-sm">
                    <span>
                      <span className="font-medium text-slate-800">{a.courseName}</span>
                      <span className="block text-xs text-slate-400">{date(a.date)}</span>
                    </span>
                    <span className="text-xs font-medium text-slate-600">{attendanceStatusLabel(a.status)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      {user.role === 'TEACHER' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">{t('office.historyCourses')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('office.historyCoursesHint')}</p>
            {data.coursesTaught.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">{t('office.historyNoCourses')}</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {data.coursesTaught.map((c) => (
                  <li key={`${c.code}-${c.academicYear}-${c.section}`} className="py-2.5 text-sm">
                    <p className="font-medium text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500">
                      {c.code} · {gradeLabel(c.gradeLevel)}
                      {c.section} · {c.academicYear}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">{t('office.historySheets')}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {t('office.historySheetsHint', { n: data.attendanceRecordedCount })}
            </p>
            {data.sheets.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">{t('office.historyNoSheets')}</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {data.sheets.map((s, i) => (
                  <li key={`${s.courseCode}-${s.term}-${s.academicYear}-${i}`} className="flex justify-between gap-3 py-2.5 text-sm">
                    <span>
                      <span className="font-medium text-slate-900">{s.courseName}</span>
                      <span className="block text-xs text-slate-400">
                        {t('portal.termN', { n: s.term })} · {s.academicYear}
                      </span>
                    </span>
                    <Badge variant="outline">{s.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
