import { DEFAULT_SITE_CONTENT, siteForLocale } from '@dt-academy/types';
import { useSiteContent } from './useSiteContent';
import { useLocale } from './useT';

export function useLocalizedSite() {
  const locale = useLocale();
  const { data = DEFAULT_SITE_CONTENT, ...rest } = useSiteContent();
  return { ...rest, data: siteForLocale(data, locale) };
}
