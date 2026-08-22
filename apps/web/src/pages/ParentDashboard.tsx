import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Users, Wallet } from 'lucide-react';
import type { IFamilyChild, IFamilyResult, IFamilyTeacher, ITuitionMonth } from '@dt-academy/types';
import { DEFAULT_SITE_CONTENT } from '@dt-academy/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useFamilyChildren } from '../hooks/useFamily';
import { useSiteContent } from '../hooks/useSiteContent';
import { BLOG_POSTS } from '../lib/blogPosts';
import { expectedSubjects } from '../lib/classSubjects';
import { gradeLabel } from '../lib/labels';
import { PHOTOS } from '../lib/schoolPhotos';
import { useAuthStore } from '../store/authStore';

type Tab = 'class' | 'report' | 'payment' | 'notices';

export function ParentDashboard() {
  const first = useAuthStore((s) => s.user?.name.split(' ')[0] ?? 'there');
  const { data: children = [], isLoading, error } = useFamilyChildren();
  const { data: site = DEFAULT_SITE_CONTENT } = useSiteContent();
  const [childId, setChildId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('class');

  const selected = children.find((c) => c.profile._id === childId) ?? children[0];
  const due = selected ? dueAmount(selected.tuitionMonths ?? []) : 0;

  return (
    <div className="bg-[#f7f4ee] pb-16">
      <section className="relative mx-4 mt-4 overflow-hidden rounded-[2rem] sm:mx-6">
        <img src={PHOTOS.children} alt="" className="h-64 w-full object-cover object-[center_25%] sm:h-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B3C] via-[#1A2B3C]/55 to-[#1A2B3C]/20" />
        <div className="absolute inset-0 flex flex-col justify-end px-6 py-8 sm:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Family portal</p>
          <h1 className="mt-1 font-serif text-4xl font-medium tracking-tight text-white sm:text-5xl">Hello, {first}</h1>
          <p className="mt-2 max-w-lg text-sm text-white/75">
            Class, report card, and tuition for this child.
          </p>
          {due > 0 ? (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/15 px-4 py-1.5 text-sm text-white backdrop-blur">
                {due.toLocaleString()} ETB on the account
              </span>
              <Link
                to="#payment"
                onClick={(e) => {
                  e.preventDefault();
                  setTab('payment');
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                <Wallet size={14} />
                Pay
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <p className="text-sm text-stone-500">Loading your children…</p>
        ) : error ? (
          <p className="text-sm text-red-600">Could not load the family login. Keep the API running.</p>
        ) : children.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <p className="font-serif text-2xl text-stone-900">No children on this login</p>
            <p className="mt-2 text-sm text-stone-500">The office attaches a student at admission.</p>
          </div>
        ) : (
          <>
            {children.length > 1 ? (
              <div className="mb-6 flex flex-wrap gap-2">
                {children.map((child) => {
                  const active = (selected?.profile._id ?? '') === child.profile._id;
                  return (
                    <button
                      key={child.profile._id}
                      type="button"
                      onClick={() => setChildId(child.profile._id)}
                      className={`rounded-full px-4 py-2 text-sm font-medium ${
                        active ? 'bg-[#1A2B3C] text-white' : 'bg-white text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {child.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {selected ? <ChildWorkspace child={selected} tab={tab} onTab={setTab} officePhone={site.phone} /> : null}
          </>
        )}
      </div>
    </div>
  );
}

function ChildWorkspace({
  child,
  tab,
  onTab,
  officePhone,
}: {
  child: IFamilyChild;
  tab: Tab;
  onTab: (t: Tab) => void;
  officePhone: string;
}) {
  const teachers = useMemo(() => roster(child), [child]);
  const report = useMemo(() => reportRows(child, teachers), [child, teachers]);

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-[1.5rem] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-teal-800 text-base text-white">{initials(child.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-serif text-2xl text-stone-900">{child.name}</p>
            <p className="mt-0.5 text-sm text-stone-500">
              {gradeLabel(child.profile.gradeLevel)} · Section {child.profile.section} · {child.profile.studentIdNumber}
            </p>
          </div>
        </div>
        <p className="text-sm text-stone-500">
          Homeroom {gradeLabel(child.profile.gradeLevel)}
          {child.profile.section}
        </p>
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto rounded-full bg-white p-1 shadow-sm">
        {(
          [
            ['class', 'Class'],
            ['report', 'Report card'],
            ['payment', 'Payments'],
            ['notices', 'Notices'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onTab(id)}
            className={`min-w-[5.5rem] flex-1 rounded-full px-3 py-2.5 text-sm font-semibold ${
              tab === id ? 'bg-[#1A2B3C] text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'class' ? <ClassTab teachers={teachers} assigned={Boolean(child.teachers?.length)} /> : null}
      {tab === 'report' ? <ReportTab rows={report} hasOfficial={Boolean(child.results?.length)} /> : null}
      {tab === 'payment' ? <PaymentTab child={child} /> : null}
      {tab === 'notices' ? <NoticesTab phone={officePhone} /> : null}
    </div>
  );
}

function ClassTab({ teachers, assigned }: { teachers: IFamilyTeacher[]; assigned: boolean }) {
  return (
    <div className="mt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-800/80">
            <Users size={14} />
            Class
          </p>
          <h2 className="mt-1 font-serif text-3xl text-stone-900">Teachers</h2>
        </div>
        {!assigned ? (
          <p className="max-w-xs text-right text-xs text-stone-400">
            Names fill in when the office assigns the class roll.
          </p>
        ) : null}
      </div>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {teachers.map((t) => (
          <li key={`${t.subject}-${t.teacherName}`} className="flex items-center gap-4 rounded-[1.25rem] bg-white p-4 shadow-sm">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-[#1A2B3C] text-sm text-white">{initials(t.teacherName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">{t.subject}</p>
              <p className="truncate font-medium text-stone-900">{t.teacherName}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReportTab({
  rows,
  hasOfficial,
}: {
  rows: { subject: string; teacherName: string; letterGrade: string; totalScore: string; term: string }[];
  hasOfficial: boolean;
}) {
  return (
    <div className="mt-8">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-800/80">
        <BookOpen size={14} />
        Academics
      </p>
      <h2 className="mt-1 font-serif text-3xl text-stone-900">Report card</h2>
      <p className="mt-2 text-sm text-stone-500">
        {hasOfficial
          ? 'Marks signed by the Director.'
          : 'Waiting on the Director to approve the class sheet. Subjects below are the class plan.'}
      </p>
      <div className="mt-6 overflow-hidden rounded-[1.5rem] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1A2B3C] text-white">
            <tr>
              <th className="px-5 py-3 font-medium">Subject</th>
              <th className="hidden px-5 py-3 font-medium sm:table-cell">Teacher</th>
              <th className="px-5 py-3 font-medium">Term</th>
              <th className="px-5 py-3 text-right font-medium">Mark</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.subject}-${r.term}`} className="border-t border-stone-100">
                <td className="px-5 py-3.5 font-medium text-stone-800">{r.subject}</td>
                <td className="hidden px-5 py-3.5 text-stone-500 sm:table-cell">{r.teacherName}</td>
                <td className="px-5 py-3.5 text-stone-500">{r.term}</td>
                <td className="px-5 py-3.5 text-right">
                  {r.letterGrade === '—' ? (
                    <span className="text-stone-300">—</span>
                  ) : (
                    <span className="font-semibold text-teal-900">
                      {r.letterGrade}
                      <span className="ml-1 font-normal text-stone-400">{r.totalScore}</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentTab({ child }: { child: IFamilyChild }) {
  const rows = child.tuitionMonths ?? [];
  const unpaid = rows.filter((r) => r.status === 'UNPAID');
  const pending = rows.filter((r) => r.status === 'PENDING');
  const total = unpaid.reduce((sum, r) => sum + r.totalDueEtb, 0);

  return (
    <div className="mt-8">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-800/80">
        <Wallet size={14} />
        Tuition
      </p>
      <h2 className="mt-1 font-serif text-3xl text-stone-900">Payments</h2>
      <p className="mt-2 text-sm text-stone-500">
        {unpaid.length
          ? `${total.toLocaleString()} ETB is due. Pay with cash at the office, bank, Telebirr, or M-Pesa.`
          : pending.length
            ? 'A receipt is with the office. Months stay pending until they confirm it.'
            : 'Nothing is outstanding for this child.'}
      </p>

      <ul className="mt-6 overflow-hidden rounded-[1.5rem] bg-white shadow-sm">
        {rows.map((row) => (
          <li
            key={row.month}
            className="flex items-center justify-between border-b border-stone-100 px-5 py-3.5 last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-stone-800">{row.label}</p>
              <p className="text-xs text-stone-400">
                {row.baseEtb.toLocaleString()} ETB
                {row.penaltyEtb > 0 ? ` + ${row.penaltyEtb.toLocaleString()} late` : ''}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                row.status === 'PAID'
                  ? 'bg-teal-50 text-teal-900'
                  : row.status === 'UNPAID'
                    ? 'bg-red-50 text-red-800'
                    : row.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-900'
                      : 'bg-stone-100 text-stone-500'
              }`}
            >
              {row.status === 'PAID'
                ? 'Paid'
                : row.status === 'UNPAID'
                  ? 'Due'
                  : row.status === 'PENDING'
                    ? 'Pending'
                    : 'Upcoming'}
            </span>
          </li>
        ))}
      </ul>

      {unpaid.length ? (
        <Link
          to={`/portal/pay?student=${child.profile._id}`}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
        >
          <Wallet size={16} />
          Pay {total.toLocaleString()} ETB
        </Link>
      ) : null}
    </div>
  );
}

function NoticesTab({ phone }: { phone: string }) {
  return (
    <div className="mt-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-800/80">School</p>
      <h2 className="mt-1 font-serif text-3xl text-stone-900">Notices</h2>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {BLOG_POSTS.slice(0, 4).map((post) => (
          <li key={post.slug}>
            <Link
              to={`/blog/${post.slug}`}
              className="group flex h-full overflow-hidden rounded-[1.25rem] bg-white shadow-sm"
            >
              <img src={post.image} alt="" className="h-28 w-24 shrink-0 object-cover sm:h-auto sm:w-32" />
              <div className="flex flex-1 flex-col justify-center p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">{post.date}</p>
                <p className="mt-1 font-medium text-stone-900 group-hover:underline">{post.title}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-teal-800">
                  Read
                  <ChevronRight size={12} />
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-stone-500">
        Pickup and login questions: front office {phone}.
      </p>
    </div>
  );
}

function roster(child: IFamilyChild): IFamilyTeacher[] {
  if (child.teachers?.length) return child.teachers;
  return expectedSubjects(child.profile.gradeLevel).map((subject) => ({
    subject,
    teacherName: 'To be assigned',
  }));
}

function reportRows(child: IFamilyChild, teachers: IFamilyTeacher[]) {
  const official = child.results ?? [];
  if (official.length) {
    return official.map((r: IFamilyResult) => ({
      subject: r.subject,
      teacherName: r.teacherName,
      letterGrade: r.letterGrade,
      totalScore: String(r.totalScore),
      term: `Term ${r.term}`,
    }));
  }
  return teachers.map((t) => ({
    subject: t.subject,
    teacherName: t.teacherName,
    letterGrade: '—',
    totalScore: '',
    term: 'Term 1',
  }));
}

function dueAmount(rows: ITuitionMonth[]) {
  return rows.filter((r) => r.status === 'UNPAID').reduce((sum, r) => sum + r.totalDueEtb, 0);
}

function initials(name: string) {
  if (name === 'To be assigned') return '—';
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
