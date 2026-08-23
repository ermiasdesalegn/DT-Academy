import { useT } from '../../hooks/useT';

export function AcademicsPage() {
  const t = useT();
  const bands = [
    [t('academics.earlyT'), t('academics.earlyB')],
    [t('academics.primaryT'), t('academics.primaryB')],
    [t('academics.prepT'), t('academics.prepB')],
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">{t('academics.eyebrow')}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{t('academics.title')}</h1>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {bands.map(([title, body]) => (
            <article key={title} className="border-t border-stone-200 pt-6">
              <h2 className="font-serif text-2xl text-stone-900">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
