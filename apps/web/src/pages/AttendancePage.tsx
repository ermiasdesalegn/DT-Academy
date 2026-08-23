import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { AttendanceStatus } from '@dt-academy/types';
import { Button } from '@/components/ui/button';
import { PageLoader } from '../components/layouts/PageLoader';
import { useAttendanceDay, useSaveAttendance } from '../hooks/useAttendance';
import { useTeachingHome } from '../hooks/useClasses';
import { gradeLabel } from '../lib/labels';

const STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function AttendancePage() {
  const { courseId: paramId } = useParams();
  const navigate = useNavigate();
  const teaching = useTeachingHome();
  const courses = teaching.data?.courses ?? [];
  const courseId = paramId ?? courses[0]?._id;
  const [date, setDate] = useState(todayIso);
  const day = useAttendanceDay(courseId, date);
  const save = useSaveAttendance();
  const [marks, setMarks] = useState<{ studentId: string; status: AttendanceStatus }[]>([]);

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
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Attendance</h1>
        <p className="mt-1 text-sm text-slate-500">Mark your subject roll for one day. Families see these statuses.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="text-sm">
          <span className="font-medium text-slate-700">Subject</span>
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
          <span className="font-medium text-slate-700">Date</span>
          <input
            type="date"
            className="mt-1 block rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </div>

      {!courseId ? (
        <p className="text-sm text-slate-500">The office has not assigned you a subject yet.</p>
      ) : day.isLoading ? (
        <PageLoader label="Loading attendance roll" />
      ) : day.isError ? (
        <p className="text-sm text-red-600">Could not load attendance.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Student</th>
                  {STATUSES.map((s) => (
                    <th key={s} className="px-3 py-2 font-medium">
                      {s.charAt(0) + s.slice(1).toLowerCase()}
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
            {save.isPending ? 'Saving…' : 'Save roll'}
          </Button>
          {save.isError ? <p className="text-sm text-red-600">Could not save the roll.</p> : null}
        </>
      )}

      <p className="text-sm text-slate-500">
        <Link to="/admin/teaching" className="text-teal-800 hover:underline">
          Open class sheets
        </Link>
      </p>
    </div>
  );
}
