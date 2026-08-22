/** KG/K = 0, G1–G8 = 1–8, Prep = 9 */
export function parseGradeLevel(raw: string): number | null {
  const s = raw.trim().toUpperCase().replace(/\s+/g, '');
  if (!s) return null;
  if (/^(K|KG|KG[12]|KINDERGARTEN|PRE-?K)$/.test(s)) return 0;
  if (/^PREP/.test(s)) return 9;
  const m = s.match(/^(?:G(?:RADE)?)?(\d{1,2})$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (n >= 1 && n <= 8) return n;
  if (n === 9) return 9;
  return null;
}

/** G5–Prep may receive a student portal login. KG–G4 stay parent-portal only. */
export function studentLoginAllowed(gradeLevel: number): boolean {
  return gradeLevel >= 5;
}
