import { useT } from '../../hooks/useT';

export function ServicePage() {
  const t = useT();
  const services = [
    { title: t('service.s1t'), body: t('service.s1b') },
    { title: t('service.s2t'), body: t('service.s2b') },
    { title: t('service.s3t'), body: t('service.s3b') },
    { title: t('service.s4t'), body: t('service.s4b') },
  ];

  return (
    <div className="min-h-screen bg-[#f7f4ee]">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">{t('service.eyebrow')}</p>
        <h1 className="mt-3 text-4xl font-bold uppercase tracking-tight text-stone-900">{t('service.title')}</h1>
        <p className="mt-6 max-w-2xl text-stone-600">{t('service.intro')}</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {services.map((item) => (
            <article key={item.title} className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold uppercase text-[#1A2B3C]">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
