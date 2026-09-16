import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoader } from '../components/layouts/PageLoader';
import { PageHeader } from '../components/layouts/Page';
import {
  useApproveJoinRequest,
  useJoinRequests,
  useRejectJoinRequest,
} from '../hooks/useJoinRequests';
import { useT } from '../hooks/useT';
import { gradeLabel } from '../lib/labels';

export function JoinRequestsPage() {
  const t = useT();
  const list = useJoinRequests('PENDING');
  const approve = useApproveJoinRequest();
  const reject = useRejectJoinRequest();
  const [sections, setSections] = useState<Record<string, string>>({});
  const [years, setYears] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [lastAdmit, setLastAdmit] = useState<{
    studentName: string;
    parentPw?: string;
    studentPw?: string;
    studentId?: string;
  } | null>(null);

  const rows = list.data ?? [];

  return (
    <div>
      <PageHeader title={t('joinOffice.title')} subtitle={t('joinOffice.hint')} />
      <p className="mt-2 text-sm text-slate-500">
        <Link to="/admin/admissions" className="text-teal-800 hover:underline">
          {t('joinOffice.openAdmit')}
        </Link>
      </p>

      {lastAdmit ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          <p className="font-medium">{t('joinOffice.approved', { name: lastAdmit.studentName })}</p>
          {lastAdmit.studentId ? <p className="mt-1">{lastAdmit.studentId}</p> : null}
          {lastAdmit.parentPw ? <p className="mt-1">{t('admitOffice.parentPw', { password: lastAdmit.parentPw })}</p> : null}
          {lastAdmit.studentPw ? <p className="mt-1">{t('admitOffice.studentPw', { password: lastAdmit.studentPw })}</p> : null}
        </div>
      ) : null}

      {list.isLoading ? (
        <div className="mt-6">
          <PageLoader label={t('joinOffice.loading')} />
        </div>
      ) : list.isError ? (
        <p className="mt-6 text-sm text-red-600">{t('joinOffice.loadError')}</p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">{t('joinOffice.empty')}</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map((row) => (
            <li key={row._id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">{row.studentName}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {gradeLabel(row.gradeLevel)}
                    {row.section ? ` ${row.section}` : ''} · {row.parentName} · {row.parentPhone}
                  </p>
                  {row.parentEmail ? <p className="text-xs text-slate-400">{row.parentEmail}</p> : null}
                  <p className="mt-3 text-sm text-slate-700">{row.note}</p>
                </div>
                <p className="text-xs text-slate-400">{new Date(row.createdAt).toLocaleString()}</p>
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <label className="text-sm">
                  <span className="text-slate-600">{t('admitOffice.section')}</span>
                  <Input
                    className="mt-1 w-20"
                    value={sections[row._id] ?? row.section ?? 'A'}
                    onChange={(e) =>
                      setSections((cur) => ({ ...cur, [row._id]: e.target.value.toUpperCase() }))
                    }
                  />
                </label>
                <label className="text-sm">
                  <span className="text-slate-600">{t('admitOffice.year')}</span>
                  <Input
                    className="mt-1 w-32"
                    placeholder="2017/18"
                    value={years[row._id] ?? row.academicYear ?? ''}
                    onChange={(e) => setYears((cur) => ({ ...cur, [row._id]: e.target.value }))}
                  />
                </label>
                <Button
                  type="button"
                  disabled={busyId === row._id}
                  onClick={() => {
                    setError('');
                    setBusyId(row._id);
                    void approve
                      .mutateAsync({
                        id: row._id,
                        section: sections[row._id] ?? row.section ?? 'A',
                        academicYear: years[row._id] || row.academicYear || undefined,
                        enableStudentLogin: row.gradeLevel >= 5,
                      })
                      .then((data) => {
                        setLastAdmit({
                          studentName: row.studentName,
                          parentPw: data.parentTemporaryPassword,
                          studentPw: data.studentTemporaryPassword,
                          studentId: data.studentProfile?.studentIdNumber,
                        });
                      })
                      .catch(() => setError(t('joinOffice.approveError')))
                      .finally(() => setBusyId(null));
                  }}
                >
                  {busyId === row._id && approve.isPending
                    ? t('joinOffice.approving')
                    : t('joinOffice.approve')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busyId === row._id}
                  onClick={() => {
                    setError('');
                    setBusyId(row._id);
                    void reject
                      .mutateAsync({ id: row._id })
                      .catch(() => setError(t('joinOffice.rejectError')))
                      .finally(() => setBusyId(null));
                  }}
                >
                  {t('joinOffice.reject')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
