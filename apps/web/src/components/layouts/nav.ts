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

export type NavItem = { to: string; labelKey: string; icon: LucideIcon; end?: boolean };

export const NAV: Record<UserRole, NavItem[]> = {
  DIRECTOR: [
    { to: '/admin/dashboard', labelKey: 'nav.overview', icon: LayoutDashboard, end: true },
    { to: '/admin/classes', labelKey: 'nav.classes', icon: GraduationCap },
    { to: '/admin', labelKey: 'nav.people', icon: Users, end: true },
    { to: '/admin/admissions', labelKey: 'nav.admissions', icon: UserPlus },
    { to: '/admin/website', labelKey: 'nav.website', icon: Globe },
    { to: '/admin/tuition', labelKey: 'nav.tuition', icon: CreditCard },
    { to: '/admin/sheets', labelKey: 'nav.sheets', icon: ClipboardCheck },
    { to: '/admin/announcements', labelKey: 'nav.notices', icon: FileText },
  ],
  IT_ADMIN: [
    { to: '/admin', labelKey: 'nav.people', icon: Users, end: true },
    { to: '/admin/classes', labelKey: 'nav.classes', icon: GraduationCap },
    { to: '/admin/admissions', labelKey: 'nav.admissions', icon: UserPlus },
    { to: '/admin/website', labelKey: 'nav.website', icon: Globe },
    { to: '/admin/tuition', labelKey: 'nav.tuition', icon: CreditCard },
    { to: '/admin/announcements', labelKey: 'nav.notices', icon: FileText },
  ],
  MANAGER: [
    { to: '/admin', labelKey: 'nav.people', icon: Users, end: true },
    { to: '/admin/admissions', labelKey: 'nav.admissions', icon: UserPlus },
    { to: '/admin/tuition', labelKey: 'nav.tuition', icon: CreditCard },
    { to: '/admin/announcements', labelKey: 'nav.notices', icon: FileText },
  ],
  TEACHER: [
    { to: '/admin/teaching', labelKey: 'nav.classes', icon: BookOpen, end: true },
    { to: '/admin/teaching/attendance', labelKey: 'nav.attendance', icon: CalendarCheck },
  ],
  PARENT: [
    { to: '/portal/dashboard', labelKey: 'nav.myChildren', icon: Baby, end: true },
    { to: '/portal/pay', labelKey: 'nav.payTuition', icon: CreditCard },
  ],
  STUDENT: [
    { to: '/portal/dashboard', labelKey: 'nav.reportCard', icon: FileText, end: true },
    { to: '/portal/dashboard#attendance', labelKey: 'nav.attendance', icon: ClipboardCheck },
  ],
};

export const STAFF_NAV_GROUPS: Partial<Record<UserRole, { titleKey: string; items: NavItem[] }[]>> = {
  DIRECTOR: [
    { titleKey: 'staffGroup.dashboards', items: [NAV.DIRECTOR[0]] },
    {
      titleKey: 'staffGroup.office',
      items: [
        NAV.DIRECTOR[1],
        NAV.DIRECTOR[2],
        NAV.DIRECTOR[3],
        NAV.DIRECTOR[4],
        NAV.DIRECTOR[5],
        NAV.DIRECTOR[6],
        NAV.DIRECTOR[7],
      ],
    },
  ],
  IT_ADMIN: [{ titleKey: 'staffGroup.office', items: NAV.IT_ADMIN }],
  MANAGER: [{ titleKey: 'staffGroup.office', items: NAV.MANAGER }],
  TEACHER: [{ titleKey: 'staffGroup.teaching', items: NAV.TEACHER }],
};
