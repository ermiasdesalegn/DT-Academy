import { useCallback } from 'react';
import {
  formatDateTime,
  formatDisplayDate,
  formatGregorianMonth,
  formatNumber,
  localizeClocksInText,
} from '../i18n/format';
import { useLocale } from './useT';

export function useFormat() {
  const locale = useLocale();
  return {
    locale,
    n: useCallback((value: number) => formatNumber(locale, value), [locale]),
    date: useCallback((raw: string | Date) => formatDisplayDate(locale, raw), [locale]),
    dateTime: useCallback((raw: string | Date) => formatDateTime(locale, raw), [locale]),
    hours: useCallback((text: string) => localizeClocksInText(locale, text), [locale]),
    month: useCallback((month1to12: number) => formatGregorianMonth(locale, month1to12), [locale]),
  };
}
