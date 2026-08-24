import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnrollmentCharts } from '../components/office/InsightsCharts';
import { PageLoader } from '../components/layouts/PageLoader';
import { StatCard } from '../components/office/StatCard';
import { useInsights } from '../hooks/useInsights';
import { useFormat } from '../hooks/useFormat';
import { useT } from '../hooks/useT';
import { usePayments, useVerifyPayment } from '../hooks/usePayments';
import { methodLabel } from '../lib/labels';

export function StaffDashboard() {
  const t = useT();
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
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t('office.overviewTitle')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('office.overviewHint')}</p>
      </div>

      {insights.isError ? <p className="text-sm text-red-600">{t('office.overviewError')}</p> : null}

      {insights.isLoading && !d ? (
        <PageLoader label={t('office.overviewLoading')} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={t('office.studentsOnRoll')}
              value={students ? n(students.total) : '—'}
              hint={
                students
                  ? t('office.activeLocked', { active: students.activePaid, locked: students.lockedOverdue })
                  : undefined
              }
            />
            <StatCard
              label={t('office.parentsOnPlatform')}
              value={family ? n(family.parents) : '—'}
              hint={family ? t('office.withChild', { n: family.parentsWithChildren }) : undefined}
            />
            <StatCard
              label={t('office.studentLogins')}
              value={family ? n(family.studentLoginsEnabled) : '—'}
              hint={t('office.studentLoginsHint')}
            />
            <StatCard
              label={t('office.staffLabel')}
              value={staff ? n(staff.total) : '—'}
              hint={staff ? t('office.staffHint', { teachers: staff.teachers, office: staff.officeAdmin }) : undefined}
            />
          </div>

          {d ? <EnrollmentCharts data={d} /> : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-slate-900">{t('office.classSheets')}</h2>
              <p className="mt-1 text-sm text-slate-500">{t('office.classSheetsHint')}</p>
              {d ? (
                <dl className="mt-5 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
                  <div className="rounded-lg bg-slate-50 py-4">
                    <dt className="text-xs text-slate-500">{t('office.draft')}</dt>
                    <dd className="mt-1 text-2xl font-semibold text-slate-900">{n(d.grades.draft)}</dd>
                  </div>
                  <div className="rounded-lg bg-amber-50 py-4">
                    <dt className="text-xs text-amber-800">{t('office.pending')}</dt>
                    <dd className="mt-1 text-2xl font-semibold text-amber-900">{n(d.grades.pendingApproval)}</dd>
                  </div>
                  <div className="rounded-lg bg-emerald-50 py-4">
                    <dt className="text-xs text-emerald-800">{t('office.approved')}</dt>
                    <dd className="mt-1 text-2xl font-semibold text-emerald-900">{n(d.grades.approved)}</dd>
                  </div>
                  <div className="rounded-lg bg-violet-50 py-4">
                    <dt className="text-xs text-violet-800">{t('office.unlock')}</dt>
                    <dd className="mt-1 text-2xl font-semibold text-violet-900">{n(d.grades.unlockRequested ?? 0)}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-5 text-sm text-slate-500">{t('office.overviewLoading')}</p>
              )}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-slate-900">{t('office.recentTuition')}</h2>
              <p className="mt-1 text-sm text-slate-500">{t('office.recentTuitionHint')}</p>
              {payments.isLoading ? (
                <PageLoader label={t('office.paymentsLoading')} compact />
              ) : !payments.data?.length ? (
                <p className="mt-5 text-sm text-slate-500">{t('office.noPendingReceipts')}</p>
              ) : (
                <ul className="mt-5 divide-y divide-slate-100">
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
                          {t('office.pending')}
                        </Badge>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={verify.isPending}
                          onClick={() => verify.mutate(row._id)}
                        >
                          {t('office.verify')}
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
