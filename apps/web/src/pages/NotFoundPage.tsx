import { Link } from 'react-router-dom';
import { useT } from '../hooks/useT';

export function NotFoundPage() {
  const t = useT();
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{t('common.notFoundTitle')}</h1>
      <p className="mt-2 text-sm text-slate-500">{t('common.notFoundBody')}</p>
      <Link
        to="/"
        className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        {t('common.notFoundHome')}
      </Link>
    </div>
  );
}
