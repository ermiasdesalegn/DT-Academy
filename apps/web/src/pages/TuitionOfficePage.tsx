import { useState } from 'react';
import { MONTH_NAMES, type ITuitionMonth } from '@dt-academy/types';
import { Button } from '@/components/ui/button';
import { TuitionCharts } from '../components/office/InsightsCharts';
import { PageLoader } from '../components/layouts/PageLoader';
import { StatCard } from '../components/office/StatCard';
import { useInsights } from '../hooks/useInsights';
import { useUsers } from '../hooks/useUsers';
import { useSetTuitionMonth, useStudentTuition } from '../hooks/usePayments';
import { useAuthStore } from '../store/authStore';

export function TuitionOfficePage() {
  const { data: users = [], isLoading } = useUsers('students');
  const insights = useInsights();
  const [studentId, setStudentId] = useState('');
  const [note, setNote] = useState('Paid in cash before the portal');
  const tuition = useStudentTuition(studentId || undefined);
  const setMonth = useSetTuitionMonth();
  const role = useAuthStore((s) => s.user?.role);
  const canLedger = role === 'DIRECTOR' || role === 'IT_ADMIN';
  const profileId = users.find((u) => u.studentProfile?._id === studentId)?.studentProfile?._id ?? studentId;
  const d = insights.data;
  const pay = d?.payments;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Tuition</h1>
        <p className="mt-1 text-sm text-slate-500">
          School-wide receipts, then mark a single student when cash was paid before the portal.
        </p>
      </div>

      {insights.isLoading && !d ? (
        <PageLoader label="Loading tuition" />
      ) : (
        <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Verified"
          value={pay ? pay.verified.toLocaleString() : '—'}
          hint={pay ? `ETB ${pay.verifiedAmountEtb.toLocaleString()}` : undefined}
        />
        <StatCard
          label="Pending"
          value={pay ? pay.pending.toLocaleString() : '—'}
          hint={pay ? `ETB ${pay.pendingAmountEtb.toLocaleString()} waiting` : undefined}
        />
        <StatCard label="Rejected" value={pay ? pay.rejected.toLocaleString() : '—'} />
        <StatCard
          label="Students locked"
          value={d ? d.students.lockedOverdue.toLocaleString() : '—'}
          hint="isActive is off on the profile"
        />
      </div>

      {d ? <TuitionCharts data={d} /> : <p className="text-sm text-slate-500">Loading charts…</p>}

      {canLedger ? (
        <>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">One student</h2>
        <p className="mt-1 text-sm text-slate-500">
          Mark months paid or unpaid for cash before this system. Every change is logged with your name.
        </p>
      </div>

      <label className="block max-w-lg text-sm">
        <span className="font-medium text-slate-700">Student</span>
        <select
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        >
          <option value="">{isLoading ? 'Loading…' : 'Choose a student'}</option>
          {users.map((u) =>
            u.studentProfile ? (
              <option key={u.studentProfile._id} value={u.studentProfile._id}>
                {u.name} · {u.studentProfile.studentIdNumber}
              </option>
            ) : null
          )}
        </select>
      </label>

      {tuition.data ? (
        <>
          <p className="text-sm text-slate-600">
            {tuition.data.studentName} · {tuition.data.studentIdNumber} · {tuition.data.academicYear}
          </p>
          <label className="block max-w-lg text-sm">
            <span className="font-medium text-slate-700">Note (saved in the log)</span>
            <input
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Office</th>
                </tr>
              </thead>
              <tbody>
                {tuition.data.months.map((row: ITuitionMonth) => (
                  <tr key={row.month} className="border-b border-slate-50">
                    <td className="px-4 py-3">{row.label}</td>
                    <td className="px-4 py-3">{row.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={setMonth.isPending || row.status === 'PAID'}
                          onClick={() =>
                            setMonth.mutate({
                              studentProfileId: profileId,
                              month: row.month,
                              status: 'PAID',
                              note,
                            })
                          }
                        >
                          Mark paid
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={setMonth.isPending || row.status === 'UNPAID' || row.status === 'UPCOMING'}
                          onClick={() =>
                            setMonth.mutate({
                              studentProfileId: profileId,
                              month: row.month,
                              status: 'UNPAID',
                              note,
                            })
                          }
                        >
                          Mark unpaid
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Log</p>
            {tuition.data.logs.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No office changes yet.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {tuition.data.logs.map((log) => (
                  <li key={log._id}>
                    {new Date(log.createdAt).toLocaleString()} · {log.actorName} set {MONTH_NAMES[log.month - 1]} from{' '}
                    {log.fromStatus} to {log.toStatus}
                    {log.note ? ` · ${log.note}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : studentId && tuition.isLoading ? (
        <p className="text-sm text-slate-500">Loading months…</p>
      ) : null}
      {setMonth.isError ? <p className="text-sm text-red-600">Could not save. Restart the API after Prisma generate.</p> : null}
        </>
      ) : (
        <p className="text-sm text-slate-500">
          Verify pending receipts on this page’s charts and on People. Month-by-month ledger changes stay with the
          Director and IT Admin.
        </p>
      )}
        </>
      )}
    </div>
  );
}
