import { Link } from 'react-router-dom';
import { useT } from '../../hooks/useT';

export function AdmissionsPage() {
  const t = useT();
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">{t('admissions.eyebrow')}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{t('admissions.title')}</h1>
        <ol className="mt-8 list-decimal space-y-4 pl-5 text-stone-600">
          <li>{t('admissions.s1')}</li>
          <li>{t('admissions.s2')}</li>
          <li>{t('admissions.s3')}</li>
          <li>{t('admissions.s4')}</li>
        </ol>
        <h2 className="mt-12 font-serif text-2xl text-stone-900">{t('admissions.reqTitle')}</h2>
        <p className="mt-3 text-base leading-relaxed text-stone-600">{t('admissions.reqBody')}</p>
        <h2 className="mt-12 font-serif text-2xl text-stone-900">{t('admissions.tuitionTitle')}</h2>
        <p className="mt-3 text-base leading-relaxed text-stone-600">{t('admissions.tuitionBody')}</p>
        <Link to="/contact" className="mt-10 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          {t('admissions.cta')}
        </Link>
      </div>
    </div>
  );
}
