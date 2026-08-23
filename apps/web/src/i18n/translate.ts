import { am } from './am';
import { en, type Messages } from './en';

export type Locale = 'en' | 'am';

const DICTS: Record<Locale, Messages> = { en, am };

type Vars = Record<string, string | number>;

function interpolate(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] === undefined ? `{${key}}` : String(vars[key])
  );
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
  return interpolate(value, vars);
}
