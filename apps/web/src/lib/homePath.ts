import type { UserRole } from '@dt-academy/types';

export function homePath(role: UserRole): string {
  switch (role) {
    case 'DIRECTOR':
      return '/director';
    case 'IT_ADMIN':
    case 'MANAGER':
      return '/admin';
    case 'TEACHER':
      return '/teacher';
    case 'PARENT':
      return '/parent';
    case 'STUDENT':
      return '/student';
    default:
      return '/login';
  }
}
