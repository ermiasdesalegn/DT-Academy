import type { Locale } from './translate';

export function intlLocale(locale: Locale): string {
  return locale === 'am' ? 'am-ET' : 'en-ET';
}

export function formatNumber(locale: Locale, value: number): string {
  return new Intl.NumberFormat(intlLocale(locale)).format(value);
}

const ETH_MONTHS = [
  'መስከረም',
  'ጥቅምት',
  'ኅዳር',
  'ታኅሣሥ',
  'ጥር',
  'የካቲት',
  'መጋቢት',
  'ሚያዝያ',
  'ግንቦት',
  'ሰኔ',
  'ሐምሌ',
  'ነሐሴ',
  'ጳጉሜን',
] as const;

const GREGORIAN_MONTHS_AM = [
  'ጃንዩወሪ',
  'ፌብሩወሪ',
  'ማርች',
  'ኤፕሪል',
  'ሜይ',
  'ጁን',
  'ጁላይ',
  'ኦገስት',
  'ሴፕቴምበር',
  'ኦክቶበር',
  'ኖቬምበር',
  'ዲሴምበር',
] as const;

function gregorianToJdn(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

/** Ethiopian calendar date (month 1–13). */
export function toEthiopian(date: Date): { year: number; month: number; day: number } {
  const jdn = gregorianToJdn(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const era = 1723856;
  const r = (((jdn - era) % 1461) + 1461) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year = 4 * Math.floor((jdn - era) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return { year, month, day };
}

const CLOCK = /(\d{1,2}):(\d{2})/g;

function ethiopianPeriod(ethHour24: number): string {
  if (ethHour24 < 6) return 'ጠዋት';
  if (ethHour24 < 12) return 'ከሰዓት';
  if (ethHour24 < 18) return 'ምሽት';
  return 'ለሊት';
}

/** Western 24h clock → Ethiopian 12h (day starts at 06:00 Western). */
export function formatEthiopianClock(hours: number, minutes: number): string {
  let total = hours * 60 + minutes - 6 * 60;
  if (total < 0) total += 24 * 60;
  const ethH = Math.floor(total / 60) % 24;
  const m = total % 60;
  const h12 = ethH % 12 === 0 ? 12 : ethH % 12;
  const mm = String(m).padStart(2, '0');
  return `${h12}:${mm} ${ethiopianPeriod(ethH)}`;
}

export function localizeClocksInText(locale: Locale, text: string): string {
  if (locale !== 'am') return text;
  return text.replace(CLOCK, (_, h: string, min: string) => formatEthiopianClock(Number(h), Number(min)));
}

export function parseFlexibleDate(raw: string): Date | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const iso = /^\d{4}-\d{2}-\d{2}/.exec(trimmed);
  if (iso) {
    const d = new Date(trimmed.includes('T') ? trimmed : `${trimmed.slice(0, 10)}T12:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const dmy = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(trimmed);
  if (dmy) {
    const d = new Date(`${dmy[2]} ${dmy[1]}, ${dmy[3]} 12:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDisplayDate(locale: Locale, raw: string | Date): string {
  const date = raw instanceof Date ? raw : parseFlexibleDate(raw);
  if (!date) return typeof raw === 'string' ? raw : '';
  if (locale === 'am') {
    const e = toEthiopian(date);
    const month = ETH_MONTHS[e.month - 1] ?? '';
    return `${formatNumber(locale, e.day)} ${month} ${formatNumber(locale, e.year)} ዓ.ም.`;
  }
  return new Intl.DateTimeFormat(intlLocale(locale), { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

export function formatDateTime(locale: Locale, raw: string | Date): string {
  const date = raw instanceof Date ? raw : parseFlexibleDate(String(raw));
  if (!date) return typeof raw === 'string' ? raw : '';
  if (locale === 'am') {
    return `${formatDisplayDate(locale, date)} · ${formatEthiopianClock(date.getHours(), date.getMinutes())}`;
  }
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatGregorianMonth(locale: Locale, month1to12: number): string {
  const i = Math.min(11, Math.max(0, month1to12 - 1));
  if (locale === 'am') return GREGORIAN_MONTHS_AM[i] ?? String(month1to12);
  return new Intl.DateTimeFormat('en-ET', { month: 'long' }).format(new Date(2020, i, 1));
}
