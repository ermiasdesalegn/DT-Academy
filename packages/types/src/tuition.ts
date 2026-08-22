export const MONTHLY_TUITION_ETB = 2000;
export const TUITION_DUE_DAY = 30;
export const TUITION_GRACE_DAYS = 5;
export const TUITION_PENALTY_ETB = 50;
export const TUITION_PENALTY_EVERY_DAYS = 2;

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export function academicYearNumber(academicYear: string, fallback = new Date().getFullYear()): number {
  const digits = academicYear.replace(/\D/g, '').slice(0, 4);
  const year = Number(digits);
  return Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : fallback;
}

export function termFromMonth(month: number): number {
  if (month <= 4) return 1;
  if (month <= 8) return 2;
  return 3;
}

export function tuitionDueDate(year: number, month: number): { year: number; month: number; day: number } {
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { year, month, day: Math.min(TUITION_DUE_DAY, last) };
}

export function tuitionGraceEnd(year: number, month: number): Date {
  const due = tuitionDueDate(year, month);
  const d = new Date(Date.UTC(due.year, due.month - 1, due.day));
  d.setUTCDate(d.getUTCDate() + TUITION_GRACE_DAYS);
  return d;
}

/** Late fee after the 5 days past day 30: 50 ETB for every extra 2 days. */
export function tuitionPenaltyEtb(year: number, month: number, now = new Date()): number {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const grace = tuitionGraceEnd(year, month);
  const graceDay = Date.UTC(grace.getUTCFullYear(), grace.getUTCMonth(), grace.getUTCDate());
  if (today <= graceDay) return 0;
  const extraDays = Math.round((today - graceDay) / 86_400_000);
  return Math.ceil(extraDays / TUITION_PENALTY_EVERY_DAYS) * TUITION_PENALTY_ETB;
}

export function monthHasPassed(year: number, month: number, now = new Date()): boolean {
  const nowY = now.getFullYear();
  const nowM = now.getMonth() + 1;
  return year < nowY || (year === nowY && month < nowM);
}

export function isCurrentMonth(year: number, month: number, now = new Date()): boolean {
  return year === now.getFullYear() && month === now.getMonth() + 1;
}
