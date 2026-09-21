import type { UserRole } from '@dt-academy/types';
import {
  CalendarCheck,
  ClipboardCheck,
  // CreditCard,
  FileText,
  GraduationCap,
  Heart,
  LayoutDashboard,
  Users,
  UserPlus,
  BookOpen,
  Baby,
  Globe,
  Camera,
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
    { to: '/admin/join-requests', labelKey: 'nav.joinRequests', icon: ClipboardCheck },
    { to: '/admin/website', labelKey: 'nav.website', icon: Globe },
    // { to: '/admin/tuition', labelKey: 'nav.tuition', icon: CreditCard },
    { to: '/admin/sheets', labelKey: 'nav.sheets', icon: ClipboardCheck },
    { to: '/admin/announcements', labelKey: 'nav.notices', icon: FileText },
    { to: '/admin/memorials', labelKey: 'nav.memorials', icon: Heart },
    { to: '/admin/challenges', labelKey: 'nav.challenges', icon: Camera },
  ],
  IT_ADMIN: [
    { to: '/admin', labelKey: 'nav.people', icon: Users, end: true },
    { to: '/admin/classes', labelKey: 'nav.classes', icon: GraduationCap },
    { to: '/admin/admissions', labelKey: 'nav.admissions', icon: UserPlus },
    { to: '/admin/join-requests', labelKey: 'nav.joinRequests', icon: ClipboardCheck },
    { to: '/admin/website', labelKey: 'nav.website', icon: Globe },
    // { to: '/admin/tuition', labelKey: 'nav.tuition', icon: CreditCard },
    { to: '/admin/announcements', labelKey: 'nav.notices', icon: FileText },
    { to: '/admin/memorials', labelKey: 'nav.memorials', icon: Heart },
    { to: '/admin/challenges', labelKey: 'nav.challenges', icon: Camera },
  ],
  MANAGER: [
    { to: '/admin', labelKey: 'nav.people', icon: Users, end: true },
    { to: '/admin/admissions', labelKey: 'nav.admissions', icon: UserPlus },
    { to: '/admin/join-requests', labelKey: 'nav.joinRequests', icon: ClipboardCheck },
    // { to: '/admin/tuition', labelKey: 'nav.tuition', icon: CreditCard },
    { to: '/admin/announcements', labelKey: 'nav.notices', icon: FileText },
    { to: '/admin/memorials', labelKey: 'nav.memorials', icon: Heart },
    { to: '/admin/challenges', labelKey: 'nav.challenges', icon: Camera },
  ],
  TEACHER: [
    { to: '/admin/teaching', labelKey: 'nav.classes', icon: BookOpen, end: true },
    { to: '/admin/teaching/attendance', labelKey: 'nav.attendance', icon: CalendarCheck },
    { to: '/admin/memorials', labelKey: 'nav.memorials', icon: Heart },
  ],
  PARENT: [
    { to: '/portal/dashboard', labelKey: 'nav.myChildren', icon: Baby, end: true },
    // { to: '/portal/pay', labelKey: 'nav.payTuition', icon: CreditCard },
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
      items: NAV.DIRECTOR.slice(1),
    },
  ],
  IT_ADMIN: [{ titleKey: 'staffGroup.office', items: NAV.IT_ADMIN }],
  MANAGER: [{ titleKey: 'staffGroup.office', items: NAV.MANAGER }],
  TEACHER: [{ titleKey: 'staffGroup.teaching', items: NAV.TEACHER }],
};
