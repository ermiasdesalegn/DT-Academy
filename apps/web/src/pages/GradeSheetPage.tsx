import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { IGradeResultRow } from '@dt-academy/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoader } from '../components/layouts/PageLoader';
import { useGradeSheet, useInquireSheet, useSaveGradeSheet, useSubmitGradeSheet } from '../hooks/useGrades';
import { gradeLabel } from '../lib/labels';

const TERMS = [1, 2, 3];

export function GradeSheetPage() {
  const { courseId } = useParams();
  const [params, setParams] = useSearchParams();
  const term = Number(params.get('term') ?? '2') || 2;
  const sheetQ = useGradeSheet(courseId, term);
  const save = useSaveGradeSheet();
  const submit = useSubmitGradeSheet();
  const inquire = useInquireSheet();
  const [rows, setRows] = useState<IGradeResultRow[]>([]);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (sheetQ.data) setRows(sheetQ.data.rows);
  }, [sheetQ.data]);

  const sheet = sheetQ.data;
  const locked = sheet ? sheet.status !== 'DRAFT' : true;
  const dirty = useMemo(() => JSON.stringify(rows) !== JSON.stringify(sheet?.rows ?? []), [rows, sheet]);

  function setTerm(next: number) {
    setParams({ term: String(next) });
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin/teaching" className="text-sm text-teal-800 hover:underline">
          Back to classes
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          {sheet ? `${sheet.courseName} · ${gradeLabel(sheet.gradeLevel)}${sheet.section}` : 'Grade sheet'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Test, quiz, and exam add up to the mark. Submit when the class is ready for the Director.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TERMS.map((t) => (
          <Button key={t} type="button" size="sm" variant={t === term ? 'default' : 'outline'} onClick={() => setTerm(t)}>
            Term {t}
          </Button>
        ))}
        {sheet ? (
          <span className="ml-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{sheet.status.replaceAll('_', ' ')}</span>
        ) : null}
      </div>

      {sheetQ.isLoading ? <PageLoader label="Loading grade sheet" /> : null}
      {sheetQ.isError ? <p className="text-sm text-red-600">Could not open this sheet.</p> : null}

      {sheet ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Student</th>
                  <th className="px-3 py-2 font-medium">Test</th>
                  <th className="px-3 py-2 font-medium">Quiz</th>
                  <th className="px-3 py-2 font-medium">Exam</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                  <th className="px-3 py-2 font-medium">Letter</th>
                  <th className="px-3 py-2 font-medium">Remark</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.studentId} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <p className="font-medium text-slate-900">{row.studentName}</p>
                      <p className="text-xs text-slate-400">{row.studentIdNumber}</p>
                    </td>
                    {(['testScore', 'quizScore', 'finalExamScore'] as const).map((field) => (
                      <td key={field} className="px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          disabled={locked}
                          className="h-8 w-20"
                          value={row[field]}
                          onChange={(e) => {
                            const next = [...rows];
                            next[i] = { ...next[i], [field]: Number(e.target.value) };
                            setRows(next);
                          }}
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 text-slate-700">{row.totalScore}</td>
                    <td className="px-3 py-2 font-semibold">{row.letterGrade}</td>
                    <td className="px-3 py-2">
                      <Input
                        disabled={locked}
                        className="h-8 min-w-[10rem]"
                        value={row.behavioralRemark}
                        onChange={(e) => {
                          const next = [...rows];
                          next[i] = { ...next[i], behavioralRemark: e.target.value };
                          setRows(next);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              disabled={locked || !dirty || save.isPending}
              onClick={() => save.mutate({ id: sheet._id, rows })}
            >
              {save.isPending ? 'Saving…' : 'Save draft'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={sheet.status !== 'DRAFT' || submit.isPending}
              onClick={() => submit.mutate(sheet._id)}
            >
              {submit.isPending ? 'Submitting…' : 'Submit to Director'}
            </Button>
          </div>
          {save.isError ? <p className="text-sm text-red-600">Could not save. Stay on a draft sheet.</p> : null}
          {submit.isError ? <p className="text-sm text-red-600">Could not submit.</p> : null}

          {sheet.status === 'APPROVED' ? (
            <div className="max-w-lg space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-800">Request unlock</p>
              <p className="text-sm text-slate-500">The Director must open the sheet again before you can change marks.</p>
              <textarea
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why do the marks need to change?"
              />
              <Button
                type="button"
                variant="outline"
                disabled={reason.trim().length < 8 || inquire.isPending}
                onClick={() => inquire.mutate({ id: sheet._id, reason: reason.trim() })}
              >
                Send inquiry
              </Button>
              {inquire.isError ? <p className="text-sm text-red-600">Could not send the inquiry.</p> : null}
            </div>
          ) : null}
          {sheet.openInquiry ? (
            <p className="text-sm text-amber-800">Unlock request waiting: {sheet.openInquiry.reason}</p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
