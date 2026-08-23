import { DEFAULT_SITE_CONTENT } from '@dt-academy/types';
import { useState, type FormEvent } from 'react';
import { useLocalizedSite } from '../../hooks/useLocalizedSite';
import { useT } from '../../hooks/useT';

export function ContactPage() {
  const t = useT();
  const [sent, setSent] = useState(false);
  const { data: site = DEFAULT_SITE_CONTENT } = useLocalizedSite();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-800">{t('contact.eyebrow')}</p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">{t('contact.title')}</h1>
        <p className="mt-3 text-sm text-stone-500">
          {site.phone} · {site.hours} · {site.addressLine}
        </p>
        {sent ? (
          <p className="mt-10 text-stone-700">{t('contact.thanks')}</p>
        ) : (
          <form className="mt-10 space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm">
              <span className="font-medium text-stone-700">{t('contact.name')}</span>
              <input required className="mt-1.5 w-full rounded-lg border border-stone-200 px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-stone-700">{t('contact.phone')}</span>
              <input required className="mt-1.5 w-full rounded-lg border border-stone-200 px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-stone-700">{t('contact.message')}</span>
              <textarea required rows={5} className="mt-1.5 w-full rounded-lg border border-stone-200 px-3 py-2" />
            </label>
            <button type="submit" className="rounded-full bg-teal-800 px-5 py-2.5 text-sm font-medium text-white">
              {t('common.send')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
