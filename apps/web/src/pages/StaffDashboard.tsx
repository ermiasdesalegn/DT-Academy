import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnrollmentCharts } from '../components/office/InsightsCharts';
import { PageLoader } from '../components/layouts/PageLoader';
import { StatCard } from '../components/office/StatCard';
import { useInsights } from '../hooks/useInsights';
import { useFormat } from '../hooks/useFormat';
import { usePayments, useVerifyPayment } from '../hooks/usePayments';
import { methodLabel } from '../lib/labels';

export function StaffDashboard() {
  const { n } = useFormat();
  const payments = usePayments('PENDING');
  const insights = useInsights();
  const verify = useVerifyPayment();

  const d = insights.data;
  const students = d?.students;
  const staff = d?.staff;
  const family = d?.family;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Operations Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Live counts from the school roll, family logins, and the tuition queue.
        </p>
      </div>

      {insights.isError ? <p className="text-sm text-red-600">Could not load office numbers. Keep the API running.</p> : null}

      {insights.isLoading && !d ? (
        <PageLoader label="Loading overview" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Students on roll"
              value={students ? n(students.total) : '—'}
              hint={
                students
                  ? `${n(students.activePaid)} active · ${n(students.lockedOverdue)} locked`
                  : undefined
              }
            />
            <StatCard
              label="Parents on the platform"
              value={family ? n(family.parents) : '—'}
              hint={
                family ? `${n(family.parentsWithChildren)} with a child attached` : undefined
              }
            />
            <StatCard
              label="Student logins"
              value={family ? n(family.studentLoginsEnabled) : '—'}
              hint="Grade 5+ accounts the office enabled"
            />
            <StatCard
              label="Staff"
              value={staff ? n(staff.total) : '—'}
              hint={staff ? `${staff.teachers} teachers · ${staff.officeAdmin} office` : undefined}
            />
          </div>

          {d ? <EnrollmentCharts data={d} /> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Class sheets</h2>
          <p className="mt-1 text-sm text-slate-500">Draft, waiting for the Director, and already signed.</p>
          {d ? (
            <dl className="mt-5 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              <div className="rounded-xl bg-slate-50 py-4">
                <dt className="text-xs text-slate-500">Draft</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-900">{d.grades.draft}</dd>
              </div>
              <div className="rounded-xl bg-amber-50 py-4">
                <dt className="text-xs text-amber-800">Pending</dt>
                <dd className="mt-1 text-2xl font-semibold text-amber-900">{d.grades.pendingApproval}</dd>
              </div>
              <div className="rounded-xl bg-emerald-50 py-4">
                <dt className="text-xs text-emerald-800">Approved</dt>
                <dd className="mt-1 text-2xl font-semibold text-emerald-900">{d.grades.approved}</dd>
              </div>
              <div className="rounded-xl bg-violet-50 py-4">
                <dt className="text-xs text-violet-800">Unlock</dt>
                <dd className="mt-1 text-2xl font-semibold text-violet-900">{d.grades.unlockRequested ?? 0}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-5 text-sm text-slate-500">Loading…</p>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Recent tuition (pending)</h2>
          <p className="mt-1 text-sm text-slate-500">
            Cash and bank still need a stamp. Telebirr and M-Pesa confirm themselves.
          </p>
          {payments.isLoading ? (
            <PageLoader label="Loading payments" compact />
          ) : !payments.data?.length ? (
            <p className="mt-5 text-sm text-slate-500">No pending receipts.</p>
          ) : (
            <ul className="mt-5 divide-y divide-gray-100">
              {payments.data.slice(0, 8).map((row) => (
                <li key={row._id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{row.parentName}</p>
                    <p className="text-xs text-slate-500">
                      ETB {n(row.amount)} · {methodLabel(row.method)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge className="border-0 bg-amber-100 font-medium text-amber-800 hover:bg-amber-100">
                      Pending
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={verify.isPending}
                      onClick={() => verify.mutate(row._id)}
                    >
                      Verify
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
        </>
      )}
    </div>
  );
}
