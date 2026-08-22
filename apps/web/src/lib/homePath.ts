import type { UserRole } from '@dt-academy/types';

export function homePath(role: UserRole): string {
  switch (role) {
    case 'DIRECTOR':
      return '/admin/dashboard';
    case 'IT_ADMIN':
    case 'MANAGER':
      return '/admin';
    case 'TEACHER':
      return '/admin/teaching';
    case 'PARENT':
      return '/portal/dashboard';
    case 'STUDENT':
      return '/portal/dashboard';
    default:
      return '/login';
  }
}
