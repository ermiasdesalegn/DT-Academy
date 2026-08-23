import { translate } from '../i18n/translate';
import { useLocaleStore } from '../store/localeStore';

export function gradeLabel(level: number): string {
  const locale = useLocaleStore.getState().locale;
  if (level === 0) return translate(locale, 'grade.kg');
  if (level === 9) return translate(locale, 'grade.prep');
  return translate(locale, 'grade.n', { n: level });
}

export function methodLabel(method: string): string {
  const locale = useLocaleStore.getState().locale;
  const key = `method.${method}`;
  const label = translate(locale, key);
  return label === key ? method : label;
}

export function attendanceStatusLabel(status: string): string {
  const locale = useLocaleStore.getState().locale;
  const key = `status.${status}`;
  const label = translate(locale, key);
  return label === key ? status : label;
}
