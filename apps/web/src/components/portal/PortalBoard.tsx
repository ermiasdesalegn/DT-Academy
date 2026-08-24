import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { letterFromTotal } from '@dt-academy/types';
import type { IFamilyAttendance, IFamilyResult, IFamilyTeacher, IPortalAnnouncement } from '@dt-academy/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatCard } from '../office/StatCard';
import { useFormat } from '../../hooks/useFormat';
import { useT } from '../../hooks/useT';
import { attendanceStatusLabel } from '../../lib/labels';

const NAVY = '#1A2B3C';
const RED = '#dc2626';

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function PortalBoard({
  variant,
  childName,
  results,
  teachers,
  attendance,
  notices,
  dueEtb,
  onOpenNotices,
  onOpenAttendance,
  onOpenTeachers,
}: {
  variant: 'parent' | 'student';
  childName?: string;
  results: IFamilyResult[];
  teachers: IFamilyTeacher[];
  attendance: IFamilyAttendance[];
  notices: IPortalAnnouncement[];
  dueEtb?: number;
  onOpenNotices?: () => void;
  onOpenAttendance?: () => void;
  onOpenTeachers?: () => void;
}) {
  const t = useT();
  const { n, date } = useFormat();
  const avg = results.length ? results.reduce((s, r) => s + r.totalScore, 0) / results.length : null;
  const letter = avg == null ? '—' : letterFromTotal(avg);
  const present = attendance.filter((r) => r.status === 'PRESENT').length;
  const absent = attendance.filter((r) => r.status === 'ABSENT').length;
  const markData = results.slice(0, 10).map((r) => ({ label: r.subject, count: r.totalScore }));
  const rollData = (['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const)
    .map((status) => ({
      label: attendanceStatusLabel(status),
      count: attendance.filter((r) => r.status === status).length,
    }))
    .filter((r) => r.count > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {t(variant === 'student' ? 'portal.overviewTitleSelf' : 'portal.overviewTitle')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {childName ? `${childName} · ` : ''}
          {t(variant === 'student' ? 'portal.overviewHintSelf' : 'portal.overviewHint')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('portal.statMark')}
          value={avg == null ? '—' : t('portal.letterMark', { letter, pct: Math.round(avg) })}
          hint={results.length ? t('portal.marksSigned') : t('portal.waitingDirector')}
        />
        <StatCard label={t('portal.statSubjects')} value={results.length ? n(results.length) : '—'} />
        <StatCard
          label={t('portal.statAttendance')}
          value={attendance.length ? n(attendance.length) : '—'}
          hint={
            attendance.length
              ? `${n(present)} ${t('portal.presentMark')} · ${n(absent)} ${t('portal.absentMark')}`
              : t('portal.noRollYet')
          }
        />
        {variant === 'parent' && dueEtb != null && dueEtb > 0 ? (
          <StatCard label={t('portal.statDue')} value={`${n(dueEtb)} ETB`} hint={t('portal.due')} />
        ) : (
          <StatCard
            label={t('portal.statTeachers')}
            value={teachers.length ? n(teachers.length) : '—'}
            hint={teachers.length ? undefined : t('portal.namesFill')}
          />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">{t('portal.chartMarks')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('portal.chartMarksHint')}</p>
          <div className="mt-4 h-64">
            {markData.length === 0 ? (
              <p className="text-sm text-slate-500">{t('portal.noChartMarks')}</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={markData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" name={t('portal.colMark')} fill={NAVY} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">{t('portal.chartRoll')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('portal.chartRollHint')}</p>
          <div className="mt-4 h-64" onClick={onOpenAttendance} role={onOpenAttendance ? 'button' : undefined}>
            {rollData.length === 0 ? (
              <p className="text-sm text-slate-500">{t('portal.noChartRoll')}</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rollData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" name={t('portal.attendance')} fill={RED} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">{t('portal.teachers')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('portal.contactsHint')}</p>
          {teachers.length === 0 ? (
            <p className="mt-5 text-sm text-slate-500">{t('portal.namesFill')}</p>
          ) : (
            <ul className="mt-5 divide-y divide-slate-100">
              {teachers.slice(0, 6).map((row) => (
                <li key={`${row.subject}-${row.teacherName}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-slate-200 text-[11px] font-medium text-slate-700">
                      {initials(row.teacherName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{row.teacherName}</p>
                    <p className="truncate text-xs text-slate-500">{row.subject}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {teachers.length > 6 ? (
            <button type="button" className="mt-3 text-sm font-medium text-slate-700 hover:text-slate-900" onClick={onOpenTeachers}>
              {t('portal.showAll')}
            </button>
          ) : null}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">{t('portal.recentNotices')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('portal.school')}</p>
          {notices.length === 0 ? (
            <p className="mt-5 text-sm text-slate-500">{t('portal.noNotices')}</p>
          ) : (
            <ul className="mt-5 divide-y divide-slate-100">
              {notices.slice(0, 4).map((item) => (
                <li key={item._id}>
                  <button type="button" className="w-full py-3 text-left first:pt-0 last:pb-0" onClick={onOpenNotices}>
                    <p className="text-xs text-slate-400">{date(item.createdAt)}</p>
                    <p className="mt-0.5 text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.content}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {notices.length > 4 ? (
            <button type="button" className="mt-3 text-sm font-medium text-slate-700 hover:text-slate-900" onClick={onOpenNotices}>
              {t('portal.showAll')}
            </button>
          ) : null}
        </section>
      </div>
    </div>
  );
}
