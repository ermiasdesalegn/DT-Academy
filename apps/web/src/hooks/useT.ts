import { useCallback } from 'react';
import { translate } from '../i18n/translate';
import { useLocaleStore } from '../store/localeStore';

export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  return useCallback((key: string, vars?: Record<string, string | number>) => translate(locale, key, vars), [locale]);
}

export function useLocale() {
  return useLocaleStore((s) => s.locale);
}
