import { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Wallet } from 'lucide-react';
import type { IFamilyAttendance, IFamilyChild, IFamilyTeacher, IPortalAnnouncement } from '@dt-academy/types';
import { DEFAULT_SITE_CONTENT } from '@dt-academy/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PortalBoard } from '../components/portal/PortalBoard';
import { ReportTab } from '../components/portal/ReportTab';
import { MemorialFeed } from '../components/memorials/MemorialFeed';
import { PageLoader } from '../components/layouts/PageLoader';
import { useFamilyChildren } from '../hooks/useFamily';
import { useMemorials } from '../hooks/useMemorials';
import { useSiteContent } from '../hooks/useSiteContent';
import { useFormat } from '../hooks/useFormat';
import { useT } from '../hooks/useT';
import { attendanceStatusLabel } from '../lib/labels';

type Tab = 'class' | 'report' | 'attendance' | 'payment' | 'notices' | 'memorials';

export function ParentDashboard() {
  const t = useT();
  const { data, isLoading, error } = useFamilyChildren();
  const children = data?.children ?? [];
  const announcements = data?.announcements ?? [];
  const { data: site = DEFAULT_SITE_CONTENT } = useSiteContent();
  const [childId, setChildId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('class');

  const selected = children.find((c) => c.profile._id === childId) ?? children[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 pb-24 transition-colors duration-500">
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        
        {isLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <PageLoader label={t('portal.loadChildren')} variant="portal" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center backdrop-blur-sm">
            <p className="text-sm font-medium text-red-600">{t('portal.familyError')}</p>
          </div>
        ) : children.length === 0 ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white/40 p-12 text-center shadow-2xl shadow-slate-200/50 backdrop-blur-xl transition-all duration-300 hover:bg-white/60">
            <p className="bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">{t('portal.noChildren')}</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">{t('portal.noChildrenHint')}</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {children.length > 1 ? (
              <div className="flex flex-wrap gap-3">
                {children.map((child) => {
                  const active = (selected?.profile._id ?? '') === child.profile._id;
                  return (
                    <button
                      key={child.profile._id}
                      type="button"
                      onClick={() => setChildId(child.profile._id)}
                      className={`group relative overflow-hidden rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md ${
                        active 
                          ? 'bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow-lg shadow-teal-500/30 ring-2 ring-teal-500/20 ring-offset-2 ring-offset-slate-50' 
                          : 'bg-white/70 text-slate-600 shadow-sm backdrop-blur-md hover:bg-white hover:text-slate-900'
                      }`}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {child.name.split(' ')[0]}
                        {child.isFormer || child.profile.isFormer ? (
                          <span className={`text-[10px] uppercase tracking-wider ${active ? 'text-teal-100' : 'text-slate-400'}`}>
                            {t('portal.formerStudent')}
                          </span>
                        ) : null}
                      </span>
                      {active && <div className="absolute inset-0 z-0 bg-white/20 blur-md transition-opacity duration-300" />}
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
          </div>
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
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/40 bg-white/60 shadow-xl shadow-slate-200/40 backdrop-blur-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50">
        <PortalBoard
          variant="parent"
          childName={child.name}
          isFormer={child.isFormer || child.profile.isFormer}
          results={child.results ?? []}
          teachers={teachers}
          attendance={child.attendance ?? []}
          notices={announcements}
          onOpenNotices={() => onTab('notices')}
          onOpenAttendance={() => onTab('attendance')}
          onOpenTeachers={() => onTab('class')}
        />
      </div>

      <div className="sticky top-4 z-10 mx-auto max-w-fit overflow-x-auto rounded-2xl border border-white/50 bg-white/70 p-1.5 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
        <div className="flex gap-1.5">
          {(
            [
              ['class', 'portal.tabClass'],
              ['report', 'portal.tabReport'],
              ['attendance', 'portal.tabAttendance'],
              ['notices', 'portal.tabNotices'],
              ['memorials', 'portal.tabMemorials'],
            ] as const
          ).map(([id, labelKey]) => (
            <button
              key={id}
              type="button"
              onClick={() => onTab(id)}
              className={`relative min-w-[6rem] flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5 ${
                tab === id 
                  ? 'bg-white text-teal-700 shadow-md ring-1 ring-slate-100' 
                  : 'text-slate-500 hover:bg-white/50 hover:text-slate-800'
              }`}
            >
              <span className="relative z-10">{t(labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 fill-mode-both">
        {tab === 'class' ? <ClassTab teachers={teachers} assigned={Boolean(child.teachers?.length)} /> : null}
        {tab === 'report' ? (
          <ReportTab
            rows={(child.results ?? []).map((r) => ({
              subject: r.subject,
              teacherName: r.teacherName,
              totalScore: String(r.totalScore),
              term: t('portal.termN', { n: r.term }),
            }))}
            rankings={child.termRankings}
            hasOfficial={Boolean(child.results?.length)}
          />
        ) : null}
        {tab === 'attendance' ? <AttendanceTab rows={child.attendance ?? []} /> : null}
        {tab === 'notices' ? <NoticesTab phone={officePhone} announcements={announcements} /> : null}
        {tab === 'memorials' ? <MemorialsTab studentId={child.profile._id} /> : null}
      </div>
    </div>
  );
}

function MemorialsTab({ studentId }: { studentId: string }) {
  const t = useT();
  const list = useMemorials(studentId);
  return (
    <div className="space-y-6">
      <div className="px-2">
        <p className="text-xs font-bold uppercase tracking-widest text-teal-600/80">{t('memorials.title')}</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{t('portal.tabMemorials')}</h2>
        <p className="mt-2 text-base text-slate-500">{t('memorials.historyHint')}</p>
      </div>
      <div className="rounded-[2rem] border border-white/40 bg-white/50 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-xl">
        {list.isLoading ? (
          <div className="py-12"><PageLoader label={t('memorials.loading')} compact /></div>
        ) : list.isError ? (
          <div className="rounded-xl bg-red-50 p-4"><p className="text-sm font-medium text-red-600">{t('memorials.loadError')}</p></div>
        ) : (
          <MemorialFeed memorials={list.data ?? []} emptyLabel={t('memorials.emptyForStudent')} />
        )}
      </div>
    </div>
  );
}

function ClassTab({ teachers, assigned }: { teachers: IFamilyTeacher[]; assigned: boolean }) {
  const t = useT();
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 px-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600/80">{t('portal.classEyebrow')}</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{t('portal.teachers')}</h2>
        </div>
        {!assigned ? (
          <p className="max-w-xs text-right text-xs font-medium text-slate-400">
            {t('portal.namesFill')}
          </p>
        ) : null}
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {teachers.map((teacher, i) => (
          <li 
            key={`${teacher.subject}-${teacher.teacherName}`} 
            className="group relative overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/70 p-5 shadow-lg shadow-slate-200/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-slate-200/60"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-teal-100 to-teal-50 opacity-50 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                <AvatarFallback className="bg-gradient-to-br from-slate-800 to-slate-700 text-sm font-bold text-white">
                  {initials(teacher.teacherName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-teal-600/70">{teacher.subject}</p>
                <p className="truncate text-lg font-bold text-slate-800">{teacher.teacherName}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AttendanceTab({ rows }: { rows: IFamilyAttendance[] }) {
  const t = useT();
  const { date } = useFormat();
  return (
    <div className="space-y-6">
      <div className="px-2">
        <p className="text-xs font-bold uppercase tracking-widest text-teal-600/80">{t('portal.roll')}</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{t('portal.attendance')}</h2>
        <p className="mt-2 text-base text-slate-500">{t('portal.attendanceHint')}</p>
      </div>
      
      {rows.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/40 p-12 text-center backdrop-blur-md">
          <p className="text-base font-medium text-slate-500">{t('portal.noRoll')}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 shadow-xl shadow-slate-200/40 backdrop-blur-xl">
          <ul className="divide-y divide-slate-100/50">
            {rows.map((row) => (
              <li key={`${row.courseName}-${row.date}`} className="flex items-center justify-between px-6 py-4 transition-colors duration-200 hover:bg-white/50">
                <div>
                  <p className="text-base font-bold text-slate-800">{row.courseName}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">{date(row.date)}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm ${
                  row.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                  row.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {attendanceStatusLabel(row.status)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function NoticesTab({ phone, announcements }: { phone: string; announcements: IPortalAnnouncement[] }) {
  const t = useT();
  const { date } = useFormat();
  return (
    <div className="space-y-6">
      <div className="px-2">
        <p className="text-xs font-bold uppercase tracking-widest text-teal-600/80">{t('portal.school')}</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{t('portal.notices')}</h2>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/40 p-12 text-center backdrop-blur-md">
          <p className="text-base font-medium text-slate-500">{t('portal.noNotices')}</p>
        </div>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {announcements.map((item, i) => (
            <li 
              key={item._id} 
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-lg shadow-slate-200/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-slate-200/60"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-16 translate-x-16 rounded-full bg-gradient-to-bl from-teal-100 to-transparent opacity-50 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-teal-500 shadow-sm shadow-teal-500/50 animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {date(item.createdAt)}
                  </p>
                </div>
                <h3 className="mt-3 text-xl font-bold leading-tight text-slate-900">{item.title}</h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{item.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-8 rounded-2xl border border-teal-100 bg-teal-50/50 p-4 text-center backdrop-blur-sm">
        <p className="text-sm font-medium text-teal-800">{t('portal.pickup', { phone })}</p>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
