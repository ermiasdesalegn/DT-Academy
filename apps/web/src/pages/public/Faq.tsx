import { useT } from '../../hooks/useT';

export function FaqPage() {
  const t = useT();
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">{t('faq.eyebrow')}</p>
        <h1 className="mt-3 text-4xl font-bold uppercase tracking-tight text-stone-900">{t('faq.title')}</h1>
        <dl className="mt-10 space-y-6 text-stone-600">
          <div>
            <dt className="font-semibold text-stone-900">{t('faq.q1')}</dt>
            <dd className="mt-1">{t('faq.a1')}</dd>
          </div>
          <div>
            <dt className="font-semibold text-stone-900">{t('faq.q2')}</dt>
            <dd className="mt-1">{t('faq.a2')}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
