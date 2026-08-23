import { FileCheck, GraduationCap, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '../store/authStore';

export function DirectorDashboard() {
  const fullName = useAuthStore((s) => s.user?.name ?? 'Director');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Welcome back, {fullName}. Nothing is waiting on your lock yet.
          </p>
        </div>
        <Badge className="bg-teal-800 hover:bg-teal-800">Term not configured</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi
          label="Sheets to approve"
          value="0"
          detail="Teacher submissions appear here"
          icon={FileCheck}
          tone="amber"
        />
        <Kpi
          label="Payments to verify"
          value="0"
          detail="Cash & bank PNR queue"
          icon={Wallet}
          tone="teal"
        />
        <Kpi
          label="Staff accounts"
          value="1"
          detail="You are signed in as Director"
          icon={GraduationCap}
          tone="slate"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200/80 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pending grade approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyRow
              icon={FileCheck}
              title="Inbox is clear"
              body="When a teacher submits a class sheet, you approve it here. Until then, grades stay in draft."
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tuition verification</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyRow
              icon={Wallet}
              title="No receipts waiting"
              body="Parents submit a PNR or pay digitally. You verify cash and bank transfers; that turns the report card on."
            />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-slate-200/80 shadow-none">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">Enrollment & Staff</CardTitle>
          <Badge variant="outline" className="font-normal">
            This term
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Insight label="Students" value="—" bar={0} caption="Admissions not run" />
            <Insight label="Staff" value="1" bar={12} caption="Director account" />
            <Insight label="Admissions" value="0" bar={0} caption="No students linked" />
            <Insight label="Attendance" value="—" bar={0} caption="Roll call starts with classes" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof FileCheck;
  tone: 'amber' | 'teal' | 'slate';
}) {
  const wrap =
    tone === 'amber'
      ? 'bg-amber-50 text-amber-800'
      : tone === 'teal'
        ? 'bg-teal-50 text-teal-800'
        : 'bg-slate-100 text-slate-700';

  return (
    <Card className="rounded-2xl border-slate-200/80 shadow-none">
      <CardContent className="flex items-start gap-3 pt-5">
        <span className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${wrap}`}>
          <Icon size={16} />
        </span>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyRow({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof FileCheck;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-slate-50 px-4 py-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-teal-800 shadow-sm">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function Insight({
  label,
  value,
  bar,
  caption,
}: {
  label: string;
  value: string;
  bar: number;
  caption: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-teal-700" style={{ width: `${bar}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{caption}</p>
    </div>
  );
}
