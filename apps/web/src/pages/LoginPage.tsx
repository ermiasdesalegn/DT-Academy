import axios from 'axios';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { homePath } from '../lib/homePath';

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState('director@dt-academy.local');
  const [password, setPassword] = useState('ChangeMeNow!');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      const user = useAuthStore.getState().user;
      if (user) navigate(homePath(user.role), { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err) && !err.response) {
        setError('Cannot reach the API. Keep npm run dev:api running, then try again.');
      } else if (axios.isAxiosError(err) && err.response?.status === 500) {
        setError('Database is waking up. Wait a few seconds and try again.');
      } else {
        setError('Invalid email or password.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <p className="reveal is-in text-center text-sm font-semibold tracking-tight text-slate-900">
          DT Academy
        </p>
        <h1 className="reveal is-in reveal-d1 mt-2 text-center text-2xl font-semibold tracking-tight">
          Sign in
        </h1>
        <p className="reveal is-in reveal-d2 mt-2 text-center text-sm text-slate-500">
          Accounts are created by the school office. Students in KG–G4 use the parent portal.
        </p>

        <form
          onSubmit={onSubmit}
          className="card-lift reveal is-in reveal-d3 mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <label className="block text-sm font-medium text-slate-700">Email or school ID</label>
          <input
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
          <label className="mt-4 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="btn-press mt-6 w-full rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
