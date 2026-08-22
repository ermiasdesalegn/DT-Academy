import type { UserRole } from '@dt-academy/types';
import {
  ClipboardCheck,
  CreditCard,
  LayoutDashboard,
  Users,
  UserPlus,
  BookOpen,
  CalendarCheck,
  Baby,
  FileText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const STAFF_ROLES: UserRole[] = ['DIRECTOR', 'IT_ADMIN', 'MANAGER', 'TEACHER'];
export const FAMILY_ROLES: UserRole[] = ['PARENT', 'STUDENT'];

export function isFamilyRole(role: UserRole): boolean {
  return role === 'PARENT' || role === 'STUDENT';
}

export type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean };

export const NAV: Record<UserRole, NavItem[]> = {
  DIRECTOR: [
    { to: '/director', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin', label: 'People', icon: Users, end: true },
    { to: '/admin/admit', label: 'Admissions', icon: UserPlus },
  ],
  IT_ADMIN: [
    { to: '/admin', label: 'People', icon: Users, end: true },
    { to: '/admin/admit', label: 'Admissions', icon: UserPlus },
  ],
  MANAGER: [
    { to: '/admin', label: 'People', icon: Users, end: true },
    { to: '/admin/admit', label: 'Admissions', icon: UserPlus },
  ],
  TEACHER: [
    { to: '/teacher', label: 'Classes', icon: BookOpen, end: true },
    { to: '/teacher', label: 'Attendance', icon: CalendarCheck },
  ],
  PARENT: [
    { to: '/parent', label: 'My children', icon: Baby, end: true },
    { to: '/parent', label: 'Pay tuition', icon: CreditCard },
  ],
  STUDENT: [
    { to: '/student', label: 'Report card', icon: FileText, end: true },
    { to: '/student', label: 'Attendance', icon: ClipboardCheck },
  ],
};

export const STAFF_NAV_GROUPS: Partial<Record<UserRole, { title: string; items: NavItem[] }[]>> = {
  DIRECTOR: [
    { title: 'Dashboards', items: [NAV.DIRECTOR[0]] },
    { title: 'Office', items: [NAV.DIRECTOR[1], NAV.DIRECTOR[2]] },
  ],
  IT_ADMIN: [{ title: 'Office', items: NAV.IT_ADMIN }],
  MANAGER: [{ title: 'Office', items: NAV.MANAGER }],
  TEACHER: [{ title: 'Teaching', items: NAV.TEACHER }],
};
