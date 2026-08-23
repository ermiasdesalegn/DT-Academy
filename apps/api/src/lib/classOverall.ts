import type { IClassOverall, IClassOverallRow, IClassSubjectCol } from '@dt-academy/types';
import { prisma } from './prisma';
import { expectedSubjects } from './classSubjects';

export async function buildClassOverall(input: {
  gradeLevel: number;
  section: string;
  academicYear: string;
  term?: number;
}): Promise<IClassOverall> {
  const { gradeLevel, section, academicYear } = input;
  const students = await prisma.studentProfile.findMany({
    where: { gradeLevel, section, academicYear },
    orderBy: { studentIdNumber: 'asc' },
    include: { user: { select: { name: true } } },
  });

  const courses = await prisma.course.findMany({
    where: { gradeLevel, section, academicYear },
    include: { teacher: { select: { name: true } } },
    orderBy: { name: 'asc' },
  });

  const sheets = await prisma.gradeSheet.findMany({
    where: {
      academicYear,
      courseId: { in: courses.map((c) => c.id) },
      ...(input.term ? { term: input.term } : {}),
    },
    include: { results: true, course: true },
  });

  const terms = [...new Set(sheets.map((s) => s.term))].sort((a, b) => b - a);
  const term = input.term ?? terms[0] ?? 1;
  const termSheets = sheets.filter((s) => s.term === term);

  const subjectNames =
    courses.length > 0 ? courses.map((c) => c.name) : expectedSubjects(gradeLevel);

  const subjects: IClassSubjectCol[] = subjectNames.map((name) => {
    const course = courses.find((c) => c.name === name);
    const sheet = termSheets.find((s) => s.course.name === name);
    return {
      name,
      teacherName: course?.teacher.name ?? 'To be assigned',
      imported: Boolean(sheet && sheet.results.length > 0 && sheet.status !== 'DRAFT'),
    };
  });

  const unsorted: IClassOverallRow[] = students.map((student) => {
    const scores: Record<string, number | null> = {};
    const present: number[] = [];
    for (const name of subjectNames) {
      const sheet = termSheets.find((s) => s.course.name === name);
      const result = sheet?.results.find((r) => r.studentId === student.id);
      if (result && sheet && sheet.status !== 'DRAFT') {
        scores[name] = result.totalScore;
        present.push(result.totalScore);
      } else {
        scores[name] = null;
      }
    }
    const overall = present.length ? present.reduce((a, b) => a + b, 0) / present.length : null;
    return {
      studentId: student.id,
      name: student.user.name,
      studentIdNumber: student.studentIdNumber,
      scores,
      overall,
      rank: null,
    };
  });

  const ranked = [...unsorted].sort((a, b) => (b.overall ?? -1) - (a.overall ?? -1));
  let lastScore: number | null = null;
  let lastRank = 0;
  ranked.forEach((row, i) => {
    if (row.overall == null) {
      row.rank = null;
      return;
    }
    if (lastScore === row.overall) {
      row.rank = lastRank;
    } else {
      lastRank = i + 1;
      lastScore = row.overall;
      row.rank = lastRank;
    }
  });

  const byId = new Map(ranked.map((r) => [r.studentId, r]));
  const rows = unsorted.map((r) => byId.get(r.studentId) ?? r);

  const homeroom = await prisma.homeroom.findUnique({
    where: { gradeLevel_section_academicYear: { gradeLevel, section, academicYear } },
    include: { teacher: { select: { name: true } } },
  });

  return {
    gradeLevel,
    section,
    academicYear,
    term,
    homeroomTeacherName: homeroom?.teacher.name,
    subjects,
    rows,
  };
}
