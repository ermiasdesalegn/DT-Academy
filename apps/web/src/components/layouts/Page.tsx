import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <Reveal>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      </Reveal>
      <Reveal delayMs={80}>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </Reveal>
    </div>
  );
}

export function Card({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: 0 | 1 | 2 | 3;
}) {
  return (
    <Reveal delayMs={delay * 80} className="card-lift rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {children}
    </Reveal>
  );
}

export function EmptyState({
  title,
  body,
  delay = 2,
}: {
  title: string;
  body: string;
  delay?: 0 | 1 | 2 | 3;
}) {
  return (
    <Reveal
      delayMs={delay * 80}
      className="card-lift rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center"
    >
      <p className="text-sm font-medium text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{body}</p>
    </Reveal>
  );
}
