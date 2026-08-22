import { Link } from 'react-router-dom';
import { Reveal } from '../components/layouts/Reveal';

const ACTIONS = [
  { to: '/admin/admit', title: 'Admit a student', body: 'Parent + child in one step. School ID, not Gmail.' },
  { to: '/admin', title: 'People', body: 'Teachers, managers, and family accounts.' },
];

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      <Reveal>
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Office</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Run the school</h1>
        <p className="mt-1 text-sm text-slate-500">Admissions, course assignment, unlock inquiries.</p>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2">
        {ACTIONS.map((a) => (
          <Link
            key={a.title}
            to={a.to}
            className="card-lift rounded-2xl border border-slate-200 bg-white p-6"
          >
            <p className="text-base font-semibold text-slate-900">{a.title}</p>
            <p className="mt-1 text-sm text-slate-500">{a.body}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border border-dashed border-slate-200 px-5 py-8">
        <p className="text-sm font-medium text-slate-800">Unlock inquiries</p>
        <p className="mt-1 text-sm text-slate-500">
          When a teacher requests a grade-sheet unlock, reviews appear in this list.
        </p>
      </section>
    </div>
  );
}
