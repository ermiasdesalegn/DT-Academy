import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { PortalBoard } from '../components/portal/PortalBoard';
import { ReportTab } from '../components/portal/ReportTab';
import { MemorialFeed } from '../components/memorials/MemorialFeed';
import { EmptyState } from '../components/layouts/Page';
import { PageLoader } from '../components/layouts/PageLoader';
import { useStudentPortal } from '../hooks/useFamily';
import { useMemorials } from '../hooks/useMemorials';
import { useT } from '../hooks/useT';

export function StudentDashboard() {
  const t = useT();
  const { hash } = useLocation();
  const { data, isLoading, error, isError } = useStudentPortal();
  const child = data?.child;
  const results = child?.results ?? [];
  const attendance = child?.attendance ?? [];
  const notices = data?.announcements ?? [];
  const memorials = useMemorials(child?.profile._id ?? null);
  const is404 = axios.isAxiosError(error) && error.response?.status === 404;

  useEffect(() => {
    if (hash !== '#attendance') return;
    document.getElementById('attendance')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash, isLoading]);

  return (
    <div className="bg-slate-50 pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        {isLoading ? <PageLoader label={t('portal.loadReport')} variant="portal" /> : null}
        {isError && is404 ? (
          <EmptyState title={t('portal.noProfile')} body={t('portal.noProfileHint')} />
        ) : null}
        {isError && !is404 ? <p className="text-sm text-red-600">{t('portal.studentError')}</p> : null}

        {child ? (
          <div id="attendance">
            <PortalBoard
              variant="student"
              childName={child.name}
              isFormer={child.isFormer || child.profile.isFormer}
              results={results}
              teachers={child.teachers ?? []}
              attendance={attendance}
              notices={notices}
            />
            <div className="mt-8 border-t border-slate-200 pt-8">
              <ReportTab
                rows={(results ?? []).map((r) => ({
                  subject: r.subject,
                  teacherName: r.teacherName,
                  totalScore: String(r.totalScore),
                  term: t('portal.termN', { n: r.term }),
                }))}
                rankings={child.termRankings}
                hasOfficial={Boolean(results?.length)}
              />
            </div>
            <section className="mt-10 border-t border-slate-200 pt-8">
              <p className="text-[11px] font-medium text-stone-400">{t('memorials.title')}</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-black">{t('portal.tabMemorials')}</h2>
              <p className="mt-2 text-sm text-stone-500">{t('memorials.historyHint')}</p>
              <div className="mt-6">
                {memorials.isLoading ? (
                  <PageLoader label={t('memorials.loading')} compact />
                ) : memorials.isError ? (
                  <p className="text-sm text-red-600">{t('memorials.loadError')}</p>
                ) : (
                  <MemorialFeed memorials={memorials.data ?? []} emptyLabel={t('memorials.emptyForStudent')} />
                )}
              </div>
            </section>
          </div>
        ) : null}

        <p className="mt-8 text-sm text-slate-500">
          {t('portal.pickupStudent')}{' '}
          <Link to="/contact" className="font-medium text-slate-800 underline-offset-2 hover:underline">
            {t('portal.frontOffice')}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
