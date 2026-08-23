import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageLoader } from '../components/layouts/PageLoader';
import {
  useApproveSheet,
  useDirectorSheet,
  useResolveInquiry,
  useReturnSheet,
  useSheetQueue,
} from '../hooks/useGrades';
import { gradeLabel } from '../lib/labels';

export function SheetsQueuePage() {
  const queue = useSheetQueue();
  const [openId, setOpenId] = useState<string | null>(null);
  const detail = useDirectorSheet(openId ?? undefined);
  const approve = useApproveSheet();
  const ret = useReturnSheet();
  const resolve = useResolveInquiry();

  const pending = (queue.data ?? []).filter((s) => s.status === 'PENDING_APPROVAL');
  const unlocks = (queue.data ?? []).filter((s) => s.status === 'UNLOCK_REQUESTED');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Class sheets</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sign a submitted sheet so families see the marks. Unlock only when a teacher asked in writing.
        </p>
      </div>

      {queue.isLoading ? <PageLoader label="Loading sheets" /> : null}
      {queue.isError ? <p className="text-sm text-red-600">Could not load the queue.</p> : null}

      {!queue.isLoading ? (
        <>
      <QueueTable
        title="Waiting for signature"
        empty="No submitted sheets."
        rows={pending}
        onOpen={setOpenId}
      />
      <QueueTable title="Unlock requests" empty="No unlock requests." rows={unlocks} onOpen={setOpenId} />

      {openId && detail.data ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            {detail.data.courseName} · {gradeLabel(detail.data.gradeLevel)}
            {detail.data.section} · Term {detail.data.term}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{detail.data.teacherName}</p>
          {detail.data.openInquiry ? (
            <p className="mt-2 text-sm text-amber-800">{detail.data.openInquiry.reason}</p>
          ) : null}
          <div className="mt-4 max-h-80 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="py-1 font-medium">Student</th>
                  <th className="py-1 font-medium">Total</th>
                  <th className="py-1 font-medium">Letter</th>
                </tr>
              </thead>
              <tbody>
                {detail.data.rows.map((r) => (
                  <tr key={r.studentId} className="border-t border-slate-100">
                    <td className="py-1.5">{r.studentName}</td>
                    <td className="py-1.5">{r.totalScore}</td>
                    <td className="py-1.5 font-semibold">{r.letterGrade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {detail.data.status === 'PENDING_APPROVAL' ? (
              <>
                <Button type="button" onClick={() => approve.mutate(detail.data._id)}>
                  Approve
                </Button>
                <Button type="button" variant="outline" onClick={() => ret.mutate(detail.data._id)}>
                  Return to teacher
                </Button>
              </>
            ) : null}
            {detail.data.status === 'UNLOCK_REQUESTED' && detail.data.openInquiry ? (
              <>
                <Button
                  type="button"
                  onClick={() => resolve.mutate({ id: detail.data.openInquiry!._id, action: 'approve' })}
                >
                  Unlock (back to draft)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => resolve.mutate({ id: detail.data.openInquiry!._id, action: 'reject' })}
                >
                  Keep signed
                </Button>
              </>
            ) : null}
            <Button type="button" variant="ghost" onClick={() => setOpenId(null)}>
              Close
            </Button>
          </div>
        </section>
      ) : null}
        </>
      ) : null}
    </div>
  );
}

function QueueTable({
  title,
  empty,
  rows,
  onOpen,
}: {
  title: string;
  empty: string;
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
                  {row.section} · Term {row.term}
                </p>
                <p className="text-xs text-slate-500">{row.teacherName}</p>
                {row.inquiryReason ? <p className="mt-1 text-xs text-amber-800">{row.inquiryReason}</p> : null}
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => onOpen(row._id)}>
                Review
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
