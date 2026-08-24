import { am } from './am';
import { formatNumber } from './format';
import { en, type Messages } from './en';

export type Locale = 'en' | 'am';

const DICTS: Record<Locale, Messages> = { en, am };

type Vars = Record<string, string | number>;

function interpolate(locale: Locale, text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = vars[key];
    if (v === undefined) return `{${key}}`;
    if (typeof v === 'number') return formatNumber(locale, v);
    return String(v);
  });
}

function lookup(messages: Messages, path: string): string | undefined {
  const parts = path.split('.');
  let cur: unknown = messages;
  for (const part of parts) {
    if (cur && typeof cur === 'object' && part in cur) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof cur === 'string' ? cur : undefined;
}

export function translate(locale: Locale, key: string, vars?: Vars): string {
  const dict = DICTS[locale] ?? en;
  const value = lookup(dict, key) ?? lookup(en, key) ?? key;
  return interpolate(locale, value, vars);
}
