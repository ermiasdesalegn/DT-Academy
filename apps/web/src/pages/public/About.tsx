import { DEFAULT_SITE_CONTENT } from '@dt-academy/types';
import { useSiteContent } from '../../hooks/useSiteContent';

export function AboutPage() {
  const { data: site = DEFAULT_SITE_CONTENT } = useSiteContent();

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-800">About</p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">Our story</h1>
        <p className="mt-6 text-base leading-relaxed text-stone-600">{site.aboutBody}</p>
        <h2 className="mt-12 font-serif text-2xl text-stone-900">Mission</h2>
        <p className="mt-3 text-base leading-relaxed text-stone-600">
          Ordinary school days done well: assembly at 8:00, a clear gradebook, and tuition that must be verified before
          records unlock.
        </p>
        <h2 className="mt-12 font-serif text-2xl text-stone-900">Leadership</h2>
        <p className="mt-3 text-base leading-relaxed text-stone-600">
          The Director signs official grades. Managers and IT Admin run the office. Teachers submit class sheets for
          approval. Names and portraits come from the office later.
        </p>
      </div>
    </div>
  );
}
