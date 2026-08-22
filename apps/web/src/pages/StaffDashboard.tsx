import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const GRADE_QUEUE = [
  { course: 'Grade 4A - Mathematics', teacher: 'Mr. Smith' },
  { course: 'Grade 8 - English', teacher: 'Ms. Rachel' },
  { course: 'Grade 1B - Science', teacher: 'Mrs. Abeba' },
];

const TUITION_QUEUE = [
  { parent: 'Abebe Kebede (Parent)', detail: 'ETB 15,000 - Cash PNR: 98320' },
  { parent: 'Helen Tesfaye (Parent)', detail: 'ETB 22,500 - CBE Transfer' },
];

export function StaffDashboard() {
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
            <Button type="button" variant="ghost" size="sm" className="shrink-0 text-slate-600">
              View all
            </Button>
          </div>
          <ul className="mt-5 divide-y divide-gray-100">
            {GRADE_QUEUE.map((row) => (
              <li key={row.course} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{row.course}</p>
                  <p className="text-xs text-slate-500">{row.teacher}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge className="border-0 bg-amber-100 font-medium text-amber-800 hover:bg-amber-100">
                    Pending
                  </Badge>
                  <Button type="button" variant="outline" size="sm">
                    Review
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent Tuition Payments</h2>
              <p className="mt-1 text-sm text-slate-500">
                Cash PNRs and bank receipts requiring office verification.
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" className="shrink-0 text-slate-600">
              View all
            </Button>
          </div>
          <ul className="mt-5 divide-y divide-gray-100">
            {TUITION_QUEUE.map((row) => (
              <li key={row.parent} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{row.parent}</p>
                  <p className="text-xs text-slate-500">{row.detail}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge className="border-0 bg-amber-100 font-medium text-amber-800 hover:bg-amber-100">
                    Verifying
                  </Badge>
                  <Button type="button" variant="outline" size="sm">
                    Verify
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Campus Insights</h2>
            <p className="mt-1 text-sm text-slate-500">Breakdown by student status and staff allocation.</p>
          </div>
          <Button type="button" variant="ghost" size="sm" className="shrink-0 text-slate-600">
            Detailed Report
          </Button>
        </div>
        <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:divide-x sm:divide-gray-100">
          <div className="flex-1 sm:pr-8">
            <p className="text-xs font-medium text-slate-500">Total students</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900">2,000</p>
            <p className="mt-3 text-sm text-slate-600">Active &amp; Paid: 1,842</p>
            <p className="text-sm text-slate-600">Locked (Overdue): 158</p>
          </div>
          <div className="flex-1 sm:pl-8">
            <p className="text-xs font-medium text-slate-500">Total staff</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900">96</p>
            <p className="mt-3 text-sm text-slate-600">Teachers: 84</p>
            <p className="text-sm text-slate-600">Office/Admin: 12</p>
          </div>
        </div>
      </section>
    </div>
  );
}
