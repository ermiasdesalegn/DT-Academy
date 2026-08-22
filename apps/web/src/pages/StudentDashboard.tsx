import { Reveal } from '../components/layouts/Reveal';

export function StudentDashboard() {
  return (
    <div className="space-y-8">
      <Reveal>
        <p className="text-xs font-medium uppercase tracking-widest text-teal-800/70">This term</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">My report card</h1>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-stone-200">
          <p className="text-xs uppercase tracking-wide text-stone-400">Overall</p>
          <p className="mt-2 text-6xl font-semibold tracking-tight text-stone-200">—</p>
          <p className="mt-2 text-sm text-stone-400">Shows after Director approval</p>
        </div>
        <div className="rounded-3xl bg-stone-100 p-8">
          <p className="text-xs uppercase tracking-wide text-stone-400">Attendance</p>
          <p className="mt-4 text-4xl font-semibold text-stone-300">—%</p>
          <p className="mt-2 text-sm text-stone-500">Present this term</p>
        </div>
      </div>

      <ul className="overflow-hidden rounded-3xl bg-white ring-1 ring-stone-200">
        {['Mathematics', 'English', 'Science'].map((subject) => (
          <li
            key={subject}
            className="flex items-center justify-between border-b border-stone-100 px-5 py-4 last:border-0"
          >
            <span className="text-sm font-medium text-stone-800">{subject}</span>
            <span className="text-sm text-stone-300">Locked</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
