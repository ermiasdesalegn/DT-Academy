import { create } from 'zustand';
import type { Locale } from '../i18n/translate';

const STORAGE_KEY = 'dt-locale';

function readLocale(): Locale {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'am' ? 'am' : 'en';
  } catch {
    return 'en';
  }
}

function applyHtmlLang(locale: Locale) {
  document.documentElement.lang = locale === 'am' ? 'am' : 'en';
}

const initial = readLocale();
applyHtmlLang(initial);

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: initial,
  setLocale: (locale) => {
    localStorage.setItem(STORAGE_KEY, locale);
    applyHtmlLang(locale);
    set({ locale });
  },
}));
