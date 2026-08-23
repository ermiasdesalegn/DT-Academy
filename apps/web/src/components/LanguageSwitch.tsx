import { useLocaleStore } from '../store/localeStore';
import { useT } from '../hooks/useT';
import { cn } from '../lib/utils';

export function LanguageSwitch({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const t = useT();
  const dark = variant === 'dark';

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className={cn(
        'inline-flex rounded-full p-0.5 text-[11px] font-semibold tracking-wide',
        dark ? 'bg-white/10' : 'bg-slate-100'
      )}
    >
      <button
        type="button"
        aria-pressed={locale === 'en'}
        onClick={() => setLocale('en')}
        className={cn(
          'rounded-full px-2.5 py-1',
          locale === 'en'
            ? dark
              ? 'bg-white text-[#1A2B3C]'
              : 'bg-white text-slate-900 shadow-sm'
            : dark
              ? 'text-white/70 hover:text-white'
              : 'text-slate-500 hover:text-slate-800'
        )}
      >
        EN
      </button>
      <button
        type="button"
        aria-pressed={locale === 'am'}
        onClick={() => setLocale('am')}
        className={cn(
          'rounded-full px-2.5 py-1',
          locale === 'am'
            ? dark
              ? 'bg-white text-[#1A2B3C]'
              : 'bg-white text-slate-900 shadow-sm'
            : dark
              ? 'text-white/70 hover:text-white'
              : 'text-slate-500 hover:text-slate-800'
        )}
      >
        አማ
      </button>
    </div>
  );
}
