import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInsights } from '../hooks/useInsights';
import { usePayments, useVerifyPayment } from '../hooks/usePayments';
import { methodLabel } from '../lib/labels';

export function StaffDashboard() {
  const payments = usePayments('PENDING');
  const insights = useInsights();
  const verify = useVerifyPayment();

  const students = insights.data?.students;
  const staff = insights.data?.staff;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Operations Overview</h1>
      <p className="mt-1 text-sm text-slate-500">
        Real-time summary of academic approvals and tuition verifications.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Pending Grade Approvals</h2>
              <p className="mt-1 text-sm text-slate-500">
                Grade sheets submitted by teachers awaiting Director sign-off.
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm text-slate-500">No class sheets are waiting. They appear here after a teacher submits.</p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent Tuition Payments</h2>
              <p className="mt-1 text-sm text-slate-500">
                Cash at the office and bank receipts still need a stamp. Telebirr and M-Pesa confirm themselves.
              </p>
            </div>
          </div>
          {payments.isLoading ? (
            <p className="mt-5 text-sm text-slate-500">Loading payments…</p>
          ) : !payments.data?.length ? (
            <p className="mt-5 text-sm text-slate-500">
              No pending receipts. Record a payment from People to verify it here.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-gray-100">
              {payments.data.map((row) => (
                <li key={row._id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{row.parentName} (Parent)</p>
                    <p className="text-xs text-slate-500">
                      ETB {row.amount.toLocaleString()} - {methodLabel(row.method)}: {row.referencePNR}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge className="border-0 bg-amber-100 font-medium text-amber-800 hover:bg-amber-100">
                      Verifying
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

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Enrollment &amp; Staff</h2>
            <p className="mt-1 text-sm text-slate-500">Breakdown by student status and staff allocation.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:divide-x sm:divide-gray-100">
          <div className="flex-1 sm:pr-8">
            <p className="text-xs font-medium text-slate-500">Total students</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900">
              {students ? students.total.toLocaleString() : '—'}
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Active &amp; Paid: {students ? students.activePaid.toLocaleString() : '—'}
            </p>
            <p className="text-sm text-slate-600">
              Locked (Overdue): {students ? students.lockedOverdue.toLocaleString() : '—'}
            </p>
          </div>
          <div className="flex-1 sm:pl-8">
            <p className="text-xs font-medium text-slate-500">Total staff</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900">
              {staff ? staff.total.toLocaleString() : '—'}
            </p>
            <p className="mt-3 text-sm text-slate-600">Teachers: {staff ? staff.teachers.toLocaleString() : '—'}</p>
            <p className="text-sm text-slate-600">
              Office/Admin: {staff ? staff.officeAdmin.toLocaleString() : '—'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
