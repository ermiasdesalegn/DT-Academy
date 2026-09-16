import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { AttendanceStatus } from '@dt-academy/types';
import { Button } from '@/components/ui/button';
import { PageLoader } from '../components/layouts/PageLoader';
import { useAttendanceDay, useSaveAttendance } from '../hooks/useAttendance';
import { useTeachingHome } from '../hooks/useClasses';
import { useT } from '../hooks/useT';
import { gradeLabel } from '../lib/labels';

const STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function AttendancePage() {
  const t = useT();
  const { courseId: paramId } = useParams();
  const navigate = useNavigate();
  const teaching = useTeachingHome();
  const courses = teaching.data?.courses ?? [];
  const courseId = paramId ?? courses[0]?._id;
  const [date, setDate] = useState(todayIso);
  const day = useAttendanceDay(courseId, date);
  const save = useSaveAttendance();
  const [marks, setMarks] = useState<{ studentId: string; status: AttendanceStatus }[]>([]);

  const statusLabel: Record<AttendanceStatus, string> = {
    PRESENT: t('teaching.present'),
    ABSENT: t('teaching.absent'),
    LATE: t('teaching.late'),
    EXCUSED: t('teaching.excused'),
  };

  useEffect(() => {
    if (!day.data) return;
    setMarks(
      day.data.marks.map((m) => ({
        studentId: m.studentId,
        status: m.status ?? 'PRESENT',
      }))
    );
  }, [day.data]);

  const byId = useMemo(() => new Map(marks.map((m) => [m.studentId, m.status])), [marks]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t('teaching.attendanceTitle')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('teaching.attendanceHint')}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="text-sm">
          <span className="font-medium text-slate-700">{t('teaching.subject')}</span>
          <select
            className="mt-1 block rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={courseId ?? ''}
            onChange={(e) => navigate(`/admin/teaching/attendance/${e.target.value}`)}
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {gradeLabel(c.gradeLevel)}
                {c.section} · {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-700">{t('teaching.date')}</span>
          <input
            type="date"
            className="mt-1 block rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </div>

      {!courseId ? (
        <p className="text-sm text-slate-500">{t('teaching.noCourse')}</p>
      ) : day.isLoading ? (
        <PageLoader label={t('teaching.attendanceLoading')} />
      ) : day.isError ? (
        <p className="text-sm text-red-600">{t('teaching.attendanceError')}</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">{t('teaching.colStudent')}</th>
                  {STATUSES.map((s) => (
                    <th key={s} className="px-3 py-2 font-medium">
                      {statusLabel[s]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(day.data?.marks ?? []).map((row) => (
                  <tr key={row.studentId} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <p className="font-medium text-slate-900">{row.studentName}</p>
                      <p className="text-xs text-slate-400">{row.studentIdNumber}</p>
                    </td>
                    {STATUSES.map((s) => (
                      <td key={s} className="px-3 py-2">
                        <input
                          type="radio"
                          name={`att-${row.studentId}`}
                          checked={byId.get(row.studentId) === s}
                          onChange={() =>
                            setMarks((cur) =>
                              cur.map((m) => (m.studentId === row.studentId ? { ...m, status: s } : m))
                            )
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            type="button"
            disabled={!courseId || save.isPending}
            onClick={() => save.mutate({ courseId, date, marks })}
          >
            {save.isPending ? t('teaching.saving') : t('teaching.saveRoll')}
          </Button>
          {save.isError ? <p className="text-sm text-red-600">{t('teaching.saveRollError')}</p> : null}
        </>
      )}

      <p className="text-sm text-slate-500">
        <Link to="/admin/teaching" className="text-teal-800 hover:underline">
          {t('teaching.openSheets')}
        </Link>
      </p>
    </div>
  );
}
