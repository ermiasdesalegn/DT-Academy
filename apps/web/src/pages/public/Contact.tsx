import { DEFAULT_SITE_CONTENT } from '@dt-academy/types';
import { useState, type FormEvent } from 'react';
import { useLocalizedSite } from '../../hooks/useLocalizedSite';
import { useFormat } from '../../hooks/useFormat';
import { useT } from '../../hooks/useT';
import { api } from '../../services/api';
import axios from 'axios';

export function ContactPage() {
  const t = useT();
  const { hours } = useFormat();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { data: site = DEFAULT_SITE_CONTENT } = useLocalizedSite();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/contact', {
        name: name.trim(),
        phone: phone.trim(),
        message: message.trim(),
        ...(email.trim() ? { email: email.trim() } : {}),
      });
      setSent(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
        setError(String((err.response.data as { message: string }).message));
      } else if (axios.isAxiosError(err) && !err.response) {
        setError(t('contact.errNetwork'));
      } else {
        setError(t('contact.errSend'));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-800">{t('contact.eyebrow')}</p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">{t('contact.title')}</h1>
        <p className="mt-3 text-sm text-stone-500">
          {site.phone} · {hours(site.hours)} · {site.addressLine}
        </p>
        {sent ? (
          <p className="mt-10 text-stone-700">{t('contact.thanks')}</p>
        ) : (
          <form className="mt-10 space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm">
              <span className="font-medium text-stone-700">{t('contact.name')}</span>
              <input
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-stone-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-stone-700">{t('contact.phone')}</span>
              <input
                required
                minLength={6}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-stone-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-stone-700">{t('contact.email')}</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-stone-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-stone-700">{t('contact.message')}</span>
              <textarea
                required
                minLength={8}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-stone-200 px-3 py-2"
              />
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-teal-800 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {busy ? t('contact.sending') : t('common.send')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
