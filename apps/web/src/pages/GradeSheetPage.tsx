import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { IGradeResultRow } from '@dt-academy/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoader } from '../components/layouts/PageLoader';
import { useGradeSheet, useInquireSheet, useSaveGradeSheet, useSubmitGradeSheet } from '../hooks/useGrades';
import { useT } from '../hooks/useT';
import { gradeLabel } from '../lib/labels';

const TERMS = [1, 2, 3];

export function GradeSheetPage() {
  const t = useT();
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
          {t('teaching.backClasses')}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          {sheet ? `${sheet.courseName} · ${gradeLabel(sheet.gradeLevel)}${sheet.section}` : t('teaching.sheetFallback')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t('teaching.sheetHint')}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TERMS.map((n) => (
          <Button key={n} type="button" size="sm" variant={n === term ? 'default' : 'outline'} onClick={() => setTerm(n)}>
            {t('teaching.termN', { n })}
          </Button>
        ))}
        {sheet ? (
          <span className="ml-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {sheet.status.replaceAll('_', ' ')}
          </span>
        ) : null}
      </div>

      {sheetQ.isLoading ? <PageLoader label={t('teaching.sheetLoading')} /> : null}
      {sheetQ.isError ? <p className="text-sm text-red-600">{t('teaching.sheetError')}</p> : null}

      {sheet ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">{t('teaching.colStudent')}</th>
                  <th className="px-3 py-2 font-medium">{t('teaching.colTest')}</th>
                  <th className="px-3 py-2 font-medium">{t('teaching.colQuiz')}</th>
                  <th className="px-3 py-2 font-medium">{t('teaching.colExam')}</th>
                  <th className="px-3 py-2 font-medium">{t('teaching.colTotal')}</th>
                  <th className="px-3 py-2 font-medium">{t('teaching.colLetter')}</th>
                  <th className="px-3 py-2 font-medium">{t('teaching.colRemark')}</th>
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
                          }
                          }
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
              {save.isPending ? t('teaching.saving') : t('teaching.saveDraft')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={sheet.status !== 'DRAFT' || submit.isPending}
              onClick={() => submit.mutate(sheet._id)}
            >
              {submit.isPending ? t('teaching.submitting') : t('teaching.submitDirector')}
            </Button>
          </div>
          {save.isError ? <p className="text-sm text-red-600">{t('teaching.saveSheetError')}</p> : null}
          {submit.isError ? <p className="text-sm text-red-600">{t('teaching.submitError')}</p> : null}

          {sheet.status === 'APPROVED' ? (
            <div className="max-w-lg space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-800">{t('teaching.unlockTitle')}</p>
              <p className="text-sm text-slate-500">{t('teaching.unlockHint')}</p>
              <textarea
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('teaching.unlockPh')}
              />
              <Button
                type="button"
                variant="outline"
                disabled={reason.trim().length < 8 || inquire.isPending}
                onClick={() => inquire.mutate({ id: sheet._id, reason: reason.trim() })}
              >
                {t('teaching.sendInquiry')}
              </Button>
              {inquire.isError ? <p className="text-sm text-red-600">{t('teaching.inquireError')}</p> : null}
            </div>
          ) : null}
          {sheet.openInquiry ? (
            <p className="text-sm text-amber-800">{t('teaching.unlockWaiting', { reason: sheet.openInquiry.reason })}</p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
