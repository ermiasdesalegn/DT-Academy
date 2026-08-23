import type { AnnouncementAudience, UserRole } from '@dt-academy/types';

export function announcementVisible(
  item: { audience: AnnouncementAudience; gradeLevel: number | null },
  viewer: { role: UserRole; gradeLevels?: number[] }
): boolean {
  if (viewer.role === 'DIRECTOR' || viewer.role === 'IT_ADMIN' || viewer.role === 'MANAGER') return true;
  if (viewer.role === 'TEACHER') return item.audience === 'ALL' || item.audience === 'TEACHERS';
  if (viewer.role === 'PARENT') {
    if (item.audience !== 'ALL' && item.audience !== 'PARENTS') return false;
    if (item.gradeLevel == null) return true;
    return Boolean(viewer.gradeLevels?.includes(item.gradeLevel));
  }
  if (viewer.role === 'STUDENT') {
    if (item.audience !== 'ALL' && item.audience !== 'STUDENTS') return false;
    if (item.gradeLevel == null) return true;
    return Boolean(viewer.gradeLevels?.includes(item.gradeLevel));
  }
  return false;
}
