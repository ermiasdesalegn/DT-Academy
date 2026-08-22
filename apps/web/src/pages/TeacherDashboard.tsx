import { Reveal } from '../components/layouts/Reveal';

const PERIODS = ['Test', 'Quiz', 'Exam', 'Total'];
const ROWS = ['—', '—', '—', '—', '—'];

export function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <Reveal>
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Gradebook</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Class marks</h1>
        <p className="mt-1 text-sm text-slate-500">Draft autosaves. Submit locks the sheet for the Director.</p>
      </Reveal>

      <div className="flex flex-wrap gap-2">
        {['6A Math', '6A Science', '7B English'].map((c, i) => (
          <button
            key={c}
            type="button"
            className={`rounded-lg px-3 py-1.5 text-sm ${
              i === 0 ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <span className="text-sm font-medium text-slate-800">Term 2 · Draft</span>
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
          >
            Submit for approval
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2.5 font-medium">Student</th>
                {PERIODS.map((p) => (
                  <th key={p} className="px-4 py-2.5 font-medium">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ROWS.map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-slate-300">Assigned after mapping</td>
                  {PERIODS.map((p) => (
                    <td key={p} className="px-4 py-3">
                      <span className="inline-block h-7 w-14 rounded-md bg-slate-50 ring-1 ring-slate-100" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
