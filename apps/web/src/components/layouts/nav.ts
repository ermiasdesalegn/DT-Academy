import type { UserRole } from '@dt-academy/types';
import {
  CalendarCheck,
  ClipboardCheck,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Users,
  UserPlus,
  BookOpen,
  Baby,
  Globe,
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
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/classes', label: 'Classes', icon: GraduationCap },
    { to: '/admin', label: 'People', icon: Users, end: true },
    { to: '/admin/admissions', label: 'Admissions', icon: UserPlus },
    { to: '/admin/website', label: 'Website', icon: Globe },
    { to: '/admin/tuition', label: 'Tuition', icon: CreditCard },
  ],
  IT_ADMIN: [
    { to: '/admin', label: 'People', icon: Users, end: true },
    { to: '/admin/classes', label: 'Classes', icon: GraduationCap },
    { to: '/admin/admissions', label: 'Admissions', icon: UserPlus },
    { to: '/admin/website', label: 'Website', icon: Globe },
    { to: '/admin/tuition', label: 'Tuition', icon: CreditCard },
  ],
  MANAGER: [
    { to: '/admin', label: 'People', icon: Users, end: true },
    { to: '/admin/admissions', label: 'Admissions', icon: UserPlus },
  ],
  TEACHER: [
    { to: '/admin/teaching', label: 'Classes', icon: BookOpen, end: true },
    { to: '/admin/teaching', label: 'Attendance', icon: CalendarCheck },
  ],
  PARENT: [
    { to: '/portal/dashboard', label: 'My children', icon: Baby, end: true },
    { to: '/portal/pay', label: 'Pay tuition', icon: CreditCard },
  ],
  STUDENT: [
    { to: '/portal/student', label: 'Report card', icon: FileText, end: true },
    { to: '/portal/student', label: 'Attendance', icon: ClipboardCheck },
  ],
};

export const STAFF_NAV_GROUPS: Partial<Record<UserRole, { title: string; items: NavItem[] }[]>> = {
  DIRECTOR: [
    { title: 'Dashboards', items: [NAV.DIRECTOR[0]] },
    { title: 'Office', items: [NAV.DIRECTOR[1], NAV.DIRECTOR[2], NAV.DIRECTOR[3], NAV.DIRECTOR[4], NAV.DIRECTOR[5]] },
  ],
  IT_ADMIN: [{ title: 'Office', items: NAV.IT_ADMIN }],
  MANAGER: [{ title: 'Office', items: NAV.MANAGER }],
  TEACHER: [{ title: 'Teaching', items: NAV.TEACHER }],
};
