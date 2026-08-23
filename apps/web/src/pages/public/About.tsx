import { DEFAULT_SITE_CONTENT } from '@dt-academy/types';
import { useLocalizedSite } from '../../hooks/useLocalizedSite';
import { useT } from '../../hooks/useT';

export function AboutPage() {
  const t = useT();
  const { data: site = DEFAULT_SITE_CONTENT } = useLocalizedSite();

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-800">{t('about.eyebrow')}</p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">{t('about.title')}</h1>
        <p className="mt-6 text-base leading-relaxed text-stone-600">{site.aboutBody}</p>
        <h2 className="mt-12 font-serif text-2xl text-stone-900">{t('about.mission')}</h2>
        <p className="mt-3 text-base leading-relaxed text-stone-600">{t('about.missionBody')}</p>
        <h2 className="mt-12 font-serif text-2xl text-stone-900">{t('about.leadership')}</h2>
        <p className="mt-3 text-base leading-relaxed text-stone-600">{t('about.leadershipBody')}</p>
      </div>
    </div>
  );
}
