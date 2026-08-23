import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { IInsights } from '@dt-academy/types';
import { methodLabel } from '../../lib/labels';

const NAVY = '#1A2B3C';
const RED = '#dc2626';
const TEAL = '#0f766e';
const AMBER = '#d97706';

export function EnrollmentCharts({ data }: { data: IInsights }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Students by academic year</h2>
        <p className="mt-1 text-sm text-slate-500">Enrolment on the roll, not calendar sign-ups.</p>
        <div className="mt-4 h-64">
          {data.byYear.length === 0 ? (
            <p className="text-sm text-slate-500">No students yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byYear}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="Students" fill={NAVY} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Students by grade</h2>
        <p className="mt-1 text-sm text-slate-500">KG through Grade 8 on this campus.</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.byGrade}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="Students" fill={RED} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export function TuitionCharts({ data }: { data: IInsights }) {
  const status = [
    { name: 'Verified', value: data.payments.verified, fill: TEAL },
    { name: 'Pending', value: data.payments.pending, fill: AMBER },
    { name: 'Rejected', value: data.payments.rejected, fill: RED },
  ].filter((r) => r.value > 0);

  const methods = data.payments.byMethod.map((r) => ({
    name: methodLabel(r.method),
    count: r.count,
    amountEtb: r.amountEtb,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Receipts by month</h2>
        <p className="mt-1 text-sm text-slate-500">Verified vs still waiting, by tuition month.</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.payments.byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-35} textAnchor="end" height={56} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="verified" name="Verified" stackId="a" fill={TEAL} />
              <Bar dataKey="pending" name="Pending" stackId="a" fill={AMBER} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">How families pay</h2>
        <p className="mt-1 text-sm text-slate-500">Count of receipts per method.</p>
        <div className="mt-4 flex h-64 items-center gap-4">
          <div className="h-full min-w-0 flex-1">
            {status.length === 0 ? (
              <p className="text-sm text-slate-500">No payments yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={status} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={2}>
                    {status.map((s) => (
                      <Cell key={s.name} fill={s.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <ul className="w-40 shrink-0 space-y-2 text-sm text-slate-600">
            {methods.map((m) => (
              <li key={m.name}>
                <span className="font-medium text-slate-900">{m.count}</span> {m.name}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
