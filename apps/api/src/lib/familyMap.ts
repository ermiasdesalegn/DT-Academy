import type { AttendanceStatus, IFamilyChild, IPortalAnnouncement, PaymentMethod } from '@dt-academy/types';
import { academicYearNumber } from '@dt-academy/types';
import { buildTuitionMonths, type PaymentMonthRow } from './tuitionMonths';
import { calculateRankingsForStudent } from './rankings';

type ResultRow = {
  letterGrade: string;
  totalScore: number;
  gradeSheet: {
    status: string;
    term: number;
    course: { name: string; teacher: { name: string } };
  };
};

type AttendRow = {
  date: Date;
  status: AttendanceStatus;
  course: { name: string };
};

export type ProfileWithPortal = {
  id: string;
  userId: string;
  studentIdNumber: string;
  parentId: string;
  gradeLevel: number;
  section: string;
  academicYear: string;
  isActive: boolean;
  isFormer: boolean;
  user: { name: string };
  payments: Array<PaymentMonthRow & { academicYear: string; amount: unknown; method: PaymentMethod; createdAt: Date }>;
  results: ResultRow[];
  attendance: AttendRow[];
};

export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseDay(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return new Date(`${value}T00:00:00.000Z`);
}

export function mapPortalAnnouncement(row: {
  id: string;
  title: string;
  content: string;
  audience: IPortalAnnouncement['audience'];
  gradeLevel: number | null;
  createdAt: Date;
}): IPortalAnnouncement {
  return {
    _id: row.id,
    title: row.title,
    content: row.content,
    audience: row.audience,
    gradeLevel: row.gradeLevel ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function mapFamilyChild(
  row: ProfileWithPortal,
  courses: { gradeLevel: number; section: string; academicYear: string; name: string; teacher: { name: string } }[]
): Promise<IFamilyChild> {
  const year = academicYearNumber(row.academicYear);
  const yearPayments = row.payments.filter((p) => academicYearNumber(p.academicYear) === year);
  const pending = row.payments.find((p) => p.status === 'PENDING');
  const classCourses = courses.filter(
    (c) =>
      c.gradeLevel === row.gradeLevel &&
      c.section === row.section &&
      c.academicYear === row.academicYear
  );
  const approvedResults = row.results.filter((r) => r.gradeSheet.status === 'APPROVED');
  const terms = [...new Set(approvedResults.map((r) => r.gradeSheet.term))];
  const termRankings = await calculateRankingsForStudent(
    row.id,
    row.academicYear,
    row.gradeLevel,
    row.section,
    terms
  );

  return {
    name: row.user.name,
    profile: {
      _id: row.id,
      userId: row.userId,
      studentIdNumber: row.studentIdNumber,
      parentId: row.parentId,
      gradeLevel: row.gradeLevel,
      section: row.section,
      academicYear: row.academicYear,
      isActive: row.isActive,
      isFormer: row.isFormer,
    },
    isFormer: row.isFormer,
    pendingPayment: pending
      ? {
          amount: Number(pending.amount),
          method: pending.method,
          referencePNR: pending.referencePNR,
        }
      : undefined,
    tuitionMonths: buildTuitionMonths(year, yearPayments),
    teachers: classCourses.map((c) => ({
      subject: c.name,
      teacherName: c.teacher.name,
    })),
    results: approvedResults.map((r) => ({
      subject: r.gradeSheet.course.name,
      teacherName: r.gradeSheet.course.teacher.name,
      term: r.gradeSheet.term,
      letterGrade: r.letterGrade,
      totalScore: r.totalScore,
    })),
    termRankings,
    attendance: row.attendance.map((a) => ({
      courseName: a.course.name,
      date: toIsoDate(a.date),
      status: a.status,
    })),
  };
}

export function attendanceSince(): Date {
  const d = new Date();
  // Wider window so families still see recent subject rolls across holidays/breaks.
  d.setUTCDate(d.getUTCDate() - 60);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
