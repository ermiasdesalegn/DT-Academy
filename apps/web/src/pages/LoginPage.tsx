import axios from 'axios';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { homePath } from '../lib/homePath';

export function LoginPage() {
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
        setError('Cannot reach the API. Keep npm run dev:api running, then try again.');
      } else if (axios.isAxiosError(err) && err.response?.status === 500) {
        setError('Database is waking up. Wait a few seconds and try again.');
      } else if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError('This account is inactive.');
      } else {
        setError('Invalid email or password.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-800 text-white">
          <GraduationCap size={22} />
        </div>
        <p className="mt-4 text-center text-sm font-semibold tracking-tight text-stone-900">DT Academy</p>
        <h1 className="mt-1 text-center text-2xl font-semibold tracking-tight text-stone-900">Sign in</h1>
        <p className="mt-2 text-center text-sm text-stone-500">
          Accounts are created by the school office. Students in KG–G4 use the parent portal.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-3xl border border-stone-200 bg-white p-6"
        >
          <label className="block text-sm font-medium text-stone-700">Email or school ID</label>
          <input
            className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-teal-700"
            placeholder="Parent email or school ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
          <label className="mt-4 block text-sm font-medium text-stone-700">Password</label>
          <input
            type="password"
            className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-teal-700"
            placeholder="Password from the office"
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
            {busy ? 'Signing in…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
