import axios from 'axios';
import { GraduationCap } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { useT } from '../hooks/useT';
import { homePath } from '../lib/homePath';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const t = useT();
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password.trim());
      const user = useAuthStore.getState().user;
      if (user) navigate(homePath(user.role), { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err) && !err.response) {
        setError(t('login.errNetwork'));
      } else if (axios.isAxiosError(err) && err.response?.status === 500) {
        setError(t('login.errDb'));
      } else if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError(t('login.errInactive'));
      } else {
        setError(t('login.errInvalid'));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-4 flex justify-end">
          <LanguageSwitch variant="light" />
        </div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-800 text-white">
          <GraduationCap size={22} />
        </div>
        <p className="mt-4 text-center text-sm font-semibold tracking-tight text-stone-900">DT Academy</p>
        <h1 className="mt-1 text-center text-2xl font-semibold tracking-tight text-stone-900">{t('login.title')}</h1>
        <p className="mt-2 text-center text-sm text-stone-500">{t('login.hint')}</p>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-3xl border border-stone-200 bg-white p-6"
        >
          <label className="block text-sm font-medium text-stone-700">{t('login.email')}</label>
          <input
            className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-teal-700"
            placeholder={t('login.emailPh')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
          <label className="mt-4 block text-sm font-medium text-stone-700">{t('login.password')}</label>
          <input
            type="password"
            className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-teal-700"
            placeholder={t('login.passwordPh')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-full bg-teal-800 px-3 py-2.5 text-sm font-medium text-white hover:bg-teal-900 disabled:opacity-60"
          >
            {busy ? t('login.signingIn') : t('common.continue')}
          </button>
        </form>
      </div>
    </div>
  );
}
