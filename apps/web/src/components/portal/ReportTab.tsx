import { useT } from '../../hooks/useT';

export function ReportTab({
  rows,
  rankings,
  hasOfficial,
}: {
  rows: { subject: string; teacherName: string; totalScore: string; term: string }[];
  rankings?: { term: number; totalSum: number; average: number; classRank: number; batchRank: number; phaseTop3: boolean }[];
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
                  {r.totalScore === '0' ? (
                    <span className="text-stone-300">—</span>
                  ) : (
                    <span className="font-semibold text-black">
                      {r.totalScore}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rankings && rankings.length > 0 && (
        <div className="mt-6 flex flex-col gap-4">
          {rankings.map((rk) => (
            <div key={rk.term} className="rounded-[1.5rem] bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-black mb-4">{t('portal.termN', { n: rk.term })} Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-medium text-stone-400">Total Sum</p>
                  <p className="mt-1 text-xl font-bold text-black">{rk.totalSum}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-400">Average</p>
                  <p className="mt-1 text-xl font-bold text-black">{rk.average.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-400">Class Rank</p>
                  <p className="mt-1 text-xl font-bold text-teal-600">#{rk.classRank}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-400">Batch Rank</p>
                  <p className="mt-1 text-xl font-bold text-indigo-600">#{rk.batchRank}</p>
                </div>
              </div>
              {rk.phaseTop3 && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                  <span role="img" aria-label="trophy">🏆</span> Top 3 in Phase!
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
