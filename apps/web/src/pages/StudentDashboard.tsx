import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PortalBoard } from '../components/portal/PortalBoard';
import { PageLoader } from '../components/layouts/PageLoader';
import { useStudentPortal } from '../hooks/useFamily';
import { useT } from '../hooks/useT';

export function StudentDashboard() {
  const t = useT();
  const { hash } = useLocation();
  const { data, isLoading, error } = useStudentPortal();
  const child = data?.child;
  const results = child?.results ?? [];
  const attendance = child?.attendance ?? [];
  const notices = data?.announcements ?? [];

  useEffect(() => {
    if (hash !== '#attendance') return;
    document.getElementById('attendance')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash, isLoading]);

  return (
    <div className="bg-slate-50 pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        {isLoading ? <PageLoader label={t('portal.loadReport')} variant="portal" /> : null}
        {error ? <p className="text-sm text-red-600">{t('portal.studentError')}</p> : null}

        {child ? (
          <div id="attendance">
            <PortalBoard
              variant="student"
              childName={child.name}
              results={results}
              teachers={child.teachers ?? []}
              attendance={attendance}
              notices={notices}
            />
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
