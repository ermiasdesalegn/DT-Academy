import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageLoader } from '../components/layouts/PageLoader';
import {
  useApproveSheet,
  useDirectorSheet,
  useResolveInquiry,
  useReturnSheet,
  useSheetQueue,
} from '../hooks/useGrades';
import { gradeLabel } from '../lib/labels';
import { useT } from '../hooks/useT';

export function SheetsQueuePage() {
  const t = useT();
  const queue = useSheetQueue();
  const [openId, setOpenId] = useState<string | null>(null);
  const detail = useDirectorSheet(openId ?? undefined);
  const approve = useApproveSheet();
  const ret = useReturnSheet();
  const resolve = useResolveInquiry();

  const pending = (queue.data ?? []).filter((s) => s.status === 'PENDING_APPROVAL');
  const unlocks = (queue.data ?? []).filter((s) => s.status === 'UNLOCK_REQUESTED');
  const sheet = detail.data;

  function close() {
    setOpenId(null);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t('office.sheetsTitle')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('office.sheetsHint')}</p>
      </div>

      {queue.isLoading ? <PageLoader label={t('office.sheetsLoading')} /> : null}
      {queue.isError ? <p className="text-sm text-red-600">{t('office.sheetsError')}</p> : null}

      {!queue.isLoading ? (
        <>
          <QueueTable
            title={t('office.sheetsWaiting')}
            empty={t('office.sheetsEmpty')}
            rows={pending}
            reviewLabel={t('office.review')}
            onOpen={setOpenId}
          />
          <QueueTable
            title={t('office.sheetsUnlocks')}
            empty={t('office.sheetsUnlocksEmpty')}
            rows={unlocks}
            reviewLabel={t('office.review')}
            onOpen={setOpenId}
          />
        </>
      ) : null}

      <Dialog open={Boolean(openId)} onOpenChange={(open) => !open && close()}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0 sm:rounded-2xl">
          {detail.isLoading || !sheet ? (
            <div className="px-6 py-12">
              <PageLoader label={t('office.loadingSheet')} />
            </div>
          ) : (
            <>
              <DialogHeader className="border-b border-slate-100 px-6 pb-4 pt-6 pr-12">
                <DialogTitle>
                  {sheet.courseName} · {gradeLabel(sheet.gradeLevel)}
                  {sheet.section} · {t('portal.termN', { n: sheet.term })}
                </DialogTitle>
                <DialogDescription>
                  {sheet.teacherName}
                  {sheet.openInquiry ? ` · ${sheet.openInquiry.reason}` : ''}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[50vh] overflow-auto px-6 py-4">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="text-slate-500">
                      <th className="py-2 font-medium">{t('office.student')}</th>
                      <th className="py-2 font-medium">{t('office.total')}</th>
                      <th className="py-2 font-medium">{t('office.letter')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sheet.rows.map((r) => (
                      <tr key={r.studentId} className="border-t border-slate-100">
                        <td className="py-2">{r.studentName}</td>
                        <td className="py-2">{r.totalScore}</td>
                        <td className="py-2 font-semibold text-teal-900">{r.letterGrade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                {sheet.status === 'PENDING_APPROVAL' ? (
                  <>
                    <Button
                      type="button"
                      disabled={approve.isPending}
                      onClick={() => approve.mutate(sheet._id, { onSuccess: close })}
                    >
                      {t('office.approve')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={ret.isPending}
                      onClick={() => ret.mutate(sheet._id, { onSuccess: close })}
                    >
                      {t('office.returnTeacher')}
                    </Button>
                  </>
                ) : null}
                {sheet.status === 'UNLOCK_REQUESTED' && sheet.openInquiry ? (
                  <>
                    <Button
                      type="button"
                      disabled={resolve.isPending}
                      onClick={() =>
                        resolve.mutate({ id: sheet.openInquiry!._id, action: 'approve' }, { onSuccess: close })
                      }
                    >
                      {t('office.unlockDraft')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={resolve.isPending}
                      onClick={() =>
                        resolve.mutate({ id: sheet.openInquiry!._id, action: 'reject' }, { onSuccess: close })
                      }
                    >
                      {t('office.keepSigned')}
                    </Button>
                  </>
                ) : null}
                <Button type="button" variant="ghost" className="ml-auto" onClick={close}>
                  {t('office.close')}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QueueTable({
  title,
  empty,
  rows,
  reviewLabel,
  onOpen,
}: {
  title: string;
  empty: string;
  reviewLabel: string;
  rows: {
    _id: string;
    courseName: string;
    gradeLevel: number;
    section: string;
    term: number;
    teacherName: string;
    inquiryReason?: string;
  }[];
  onOpen: (id: string) => void;
}) {
  const t = useT();
  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {rows.map((row) => (
            <li key={row._id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {row.courseName} · {gradeLabel(row.gradeLevel)}
                  {row.section} · {t('portal.termN', { n: row.term })}
                </p>
                <p className="text-xs text-slate-500">{row.teacherName}</p>
                {row.inquiryReason ? <p className="mt-1 text-xs text-amber-800">{row.inquiryReason}</p> : null}
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => onOpen(row._id)}>
                {reviewLabel}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
