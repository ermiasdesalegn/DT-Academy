export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function phoneLookupVariants(raw: string): string[] {
  const digits = normalizePhone(raw);
  if (!digits) return [];
  const variants = new Set<string>([raw.trim(), digits]);
  if (digits.startsWith('251') && digits.length >= 12) {
    variants.add(`0${digits.slice(3)}`);
    variants.add(digits.slice(3));
  }
  if (digits.startsWith('0') && digits.length >= 10) {
    variants.add(digits.slice(1));
    variants.add(`251${digits.slice(1)}`);
  }
  return [...variants];
}
