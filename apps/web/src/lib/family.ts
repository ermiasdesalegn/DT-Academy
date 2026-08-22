import type { IFamilyChild } from '@dt-academy/types';

/** True when this login only has kindergarten children (gradeLevel 0). */
export function isKgOnlyFamily(children: IFamilyChild[]): boolean {
  return children.length > 0 && children.every((c) => c.profile.gradeLevel === 0);
}
