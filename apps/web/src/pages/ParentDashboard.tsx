import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import type { IFamilyAttendance, IFamilyChild, IFamilyTeacher, IPortalAnnouncement, ITuitionMonth } from '@dt-academy/types';
import { DEFAULT_SITE_CONTENT } from '@dt-academy/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PortalBoard } from '../components/portal/PortalBoard';
import { PageLoader } from '../components/layouts/PageLoader';
import { useFamilyChildren } from '../hooks/useFamily';
import { useSiteContent } from '../hooks/useSiteContent';
import { useFormat } from '../hooks/useFormat';
import { useT } from '../hooks/useT';
import { attendanceStatusLabel } from '../lib/labels';

type Tab = 'class' | 'report' | 'attendance' | 'payment' | 'notices';

export function ParentDashboard() {
  const t = useT();
  const { data, isLoading, error } = useFamilyChildren();
  const children = data?.children ?? [];
  const announcements = data?.announcements ?? [];
  const { data: site = DEFAULT_SITE_CONTENT } = useSiteContent();
  const [childId, setChildId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('class');

  const selected = children.find((c) => c.profile._id === childId) ?? children[0];
  const due = selected ? dueAmount(selected.tuitionMonths ?? []) : 0;

  return (
    <div className="bg-slate-50 pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        {due > 0 ? (
          <div className="mb-6 flex justify-end">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-4 py-1.5 text-sm text-stone-600">{t('portal.dueEtb', { amount: due })}</span>
              <Link
                to="#payment"
                onClick={(e) => {
                  e.preventDefault();
                  setTab('payment');
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
              >
                <Wallet size={14} />
                {t('common.pay')}
              </Link>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <PageLoader label={t('portal.loadChildren')} variant="portal" />
        ) : error ? (
          <p className="text-sm text-red-600">{t('portal.familyError')}</p>
        ) : children.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <p className="text-2xl font-bold tracking-tight text-black">{t('portal.noChildren')}</p>
            <p className="mt-2 text-sm text-stone-500">{t('portal.noChildrenHint')}</p>
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
                        active ? 'bg-teal-50 font-medium text-teal-900' : 'bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {child.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {selected ? (
              <ChildWorkspace
                child={selected}
                tab={tab}
                onTab={setTab}
                officePhone={site.phone}
                announcements={announcements}
              />
            ) : null}
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
  announcements,
}: {
  child: IFamilyChild;
  tab: Tab;
  onTab: (t: Tab) => void;
  officePhone: string;
  announcements: IPortalAnnouncement[];
}) {
  const t = useT();
  const teachers = child.teachers ?? [];

  return (
    <div>
      <PortalBoard
        variant="parent"
        childName={child.name}
        results={child.results ?? []}
        teachers={teachers}
        attendance={child.attendance ?? []}
        notices={announcements}
        dueEtb={dueAmount(child.tuitionMonths ?? [])}
        onOpenNotices={() => onTab('notices')}
        onOpenAttendance={() => onTab('attendance')}
        onOpenTeachers={() => onTab('class')}
      />

      <div className="mt-6 flex gap-1 overflow-x-auto rounded-full bg-white p-1">
        {(
          [
            ['class', 'portal.tabClass'],
            ['report', 'portal.tabReport'],
            ['attendance', 'portal.tabAttendance'],
            ['payment', 'portal.tabPayment'],
            ['notices', 'portal.tabNotices'],
          ] as const
        ).map(([id, labelKey]) => (
          <button
            key={id}
            type="button"
            onClick={() => onTab(id)}
            className={`min-w-[5.5rem] flex-1 rounded-md px-3 py-2.5 text-sm font-medium ${
              tab === id ? 'bg-teal-50 text-teal-900' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      {tab === 'class' ? <ClassTab teachers={teachers} assigned={Boolean(child.teachers?.length)} /> : null}
      {tab === 'report' ? (
        <ReportTab
          rows={(child.results ?? []).map((r) => ({
            subject: r.subject,
            teacherName: r.teacherName,
            letterGrade: r.letterGrade,
            totalScore: String(r.totalScore),
            term: t('portal.termN', { n: r.term }),
          }))}
          hasOfficial={Boolean(child.results?.length)}
        />
      ) : null}
      {tab === 'attendance' ? <AttendanceTab rows={child.attendance ?? []} /> : null}
      {tab === 'payment' ? <PaymentTab child={child} /> : null}
      {tab === 'notices' ? <NoticesTab phone={officePhone} announcements={announcements} /> : null}
    </div>
  );
}

function ClassTab({ teachers, assigned }: { teachers: IFamilyTeacher[]; assigned: boolean }) {
  const t = useT();
  return (
    <div className="mt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium text-stone-400">{t('portal.classEyebrow')}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-black">{t('portal.teachers')}</h2>
        </div>
        {!assigned ? (
          <p className="max-w-xs text-right text-xs text-stone-400">
            {t('portal.namesFill')}
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
  const t = useT();
  return (
    <div className="mt-8">
      <p className="text-[11px] font-medium text-stone-400">{t('portal.academics')}</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-black">{t('portal.reportCard')}</h2>
      <p className="mt-2 text-sm text-stone-500">
        {hasOfficial ? t('portal.marksSigned') : t('portal.waitingDirector')}
      </p>
      <div className="mt-6 overflow-hidden rounded-[1.5rem] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-black text-white">
            <tr>
              <th className="px-5 py-3 font-medium">{t('portal.colSubject')}</th>
              <th className="hidden px-5 py-3 font-medium sm:table-cell">{t('portal.colTeacher')}</th>
              <th className="px-5 py-3 font-medium">{t('portal.colTerm')}</th>
              <th className="px-5 py-3 text-right font-medium">{t('portal.colMark')}</th>
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
                    <span className="font-semibold text-black">
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
  const t = useT();
  const { n, month } = useFormat();
  const rows = child.tuitionMonths ?? [];
  const unpaid = rows.filter((r) => r.status === 'UNPAID');
  const pending = rows.filter((r) => r.status === 'PENDING');
  const total = unpaid.reduce((sum, r) => sum + r.totalDueEtb, 0);

  return (
    <div className="mt-8">
      <p className="text-[11px] font-medium text-stone-400">{t('portal.tuition')}</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-black">{t('portal.payments')}</h2>
      <p className="mt-2 text-sm text-stone-500">
        {unpaid.length
          ? t('portal.dueHint', { amount: total })
          : pending.length
            ? t('portal.pendingHint')
            : t('portal.nothingOutstanding')}
      </p>

      <ul className="mt-6 overflow-hidden rounded-[1.5rem] bg-white shadow-sm">
        {rows.map((row) => (
          <li
            key={row.month}
            className="flex items-center justify-between border-b border-stone-100 px-5 py-3.5 last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-stone-800">{month(row.month)}</p>
              <p className="text-xs text-stone-400">
                {n(row.baseEtb)} ETB
                {row.penaltyEtb > 0 ? ` ${t('portal.lateAdd', { amount: row.penaltyEtb })}` : ''}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                row.status === 'PAID'
                  ? 'bg-stone-100 text-black'
                  : row.status === 'UNPAID'
                    ? 'bg-red-50 text-red-800'
                    : row.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-900'
                      : 'bg-stone-100 text-stone-500'
              }`}
            >
              {row.status === 'PAID'
                ? t('portal.paid')
                : row.status === 'UNPAID'
                  ? t('portal.due')
                  : row.status === 'PENDING'
                    ? t('portal.pending')
                    : t('portal.upcoming')}
            </span>
          </li>
        ))}
      </ul>

      {unpaid.length ? (
        <Link
          to={`/portal/pay?student=${child.profile._id}`}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Wallet size={16} />
          {t('portal.payAmount', { amount: total })}
        </Link>
      ) : null}
    </div>
  );
}

function AttendanceTab({ rows }: { rows: IFamilyAttendance[] }) {
  const t = useT();
  const { date } = useFormat();
  return (
    <div className="mt-8">
      <p className="text-[11px] font-medium text-stone-400">{t('portal.roll')}</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-black">{t('portal.attendance')}</h2>
      <p className="mt-2 text-sm text-stone-500">{t('portal.attendanceHint')}</p>
      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-stone-500">{t('portal.noRoll')}</p>
      ) : (
        <ul className="mt-6 divide-y divide-stone-100 overflow-hidden rounded-[1.25rem] bg-white shadow-sm">
          {rows.map((row) => (
            <li key={`${row.courseName}-${row.date}`} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <p className="font-medium text-stone-800">{row.courseName}</p>
                <p className="text-xs text-stone-400">{date(row.date)}</p>
              </div>
              <span className="text-xs font-medium text-stone-500">{attendanceStatusLabel(row.status)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NoticesTab({ phone, announcements }: { phone: string; announcements: IPortalAnnouncement[] }) {
  const t = useT();
  const { date } = useFormat();
  return (
    <div className="mt-8">
      <p className="text-[11px] font-medium text-stone-400">{t('portal.school')}</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-black">{t('portal.notices')}</h2>
      {announcements.length === 0 ? (
        <p className="mt-6 text-sm text-stone-500">{t('portal.noNotices')}</p>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {announcements.map((item) => (
            <li key={item._id} className="rounded-[1.25rem] bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                {date(item.createdAt)}
              </p>
              <p className="mt-1 font-medium text-stone-900">{item.title}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-stone-600">{item.content}</p>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-sm text-stone-500">{t('portal.pickup', { phone })}</p>
    </div>
  );
}

function dueAmount(rows: ITuitionMonth[]) {
  return rows.filter((r) => r.status === 'UNPAID').reduce((sum, r) => sum + r.totalDueEtb, 0);
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
