/**
 * Large demo dataset. Idempotent unless you pass --reset.
 *
 *   npm run seed:demo -w @dt-academy/api
 *   npm run seed:demo:reset -w @dt-academy/api
 *
 * Shared password for every demo account: Demo1234!
 * Director is not overwritten (SEED_ADMIN_*).
 */
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import '../config/env';
import { prisma } from '../lib/prisma';
import { MONTHLY_TUITION_ETB, termFromMonth } from '@dt-academy/types';

const YEAR = '2026';
const ID_START = 1000;
const SECTIONS = ['A', 'B', 'C', 'D'] as const;
const GRADES = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;
const PER_CLASS = 27;
const PASSWORD = 'Demo1234!';
const DEMO_SUFFIX = '@demo.dt-academy.local';
const STUDENT_MAIL = '@students.dt-academy.local';

const FIRST = [
  'Abebe', 'Alem', 'Belay', 'Chaltu', 'Dawit', 'Eyerusalem', 'Fikadu', 'Genet',
  'Hana', 'Iyasu', 'Kidist', 'Lemma', 'Meron', 'Nardos', 'Rediet', 'Selam',
  'Tigist', 'Yonas', 'Zewditu', 'Bereket', 'Liya', 'Nahom', 'Ruth', 'Samuel',
  'Tesfaye', 'Helen', 'Mikael', 'Sara', 'Yosef', 'Marta', 'Biniam', 'Eden',
  'Kaleb', 'Rahel', 'Solomon', 'Tsion',
];
const LAST = [
  'Tesfaye', 'Bekele', 'Haile', 'Desta', 'Worku', 'Assefa', 'Girma', 'Tadesse',
  'Kebede', 'Alemu', 'Mekonnen', 'Getachew', 'Wolde', 'Demissie', 'Negash',
  'Fekadu', 'Adane', 'Mulugeta',
];

type SheetStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED';
type PayMethod = 'CASH' | 'BANK_TRANSFER' | 'TELEBIRR' | 'MPESA';
type PayStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
type Attend = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

function nameAt(i: number): string {
  return `${FIRST[i % FIRST.length]} ${LAST[Math.floor(i / FIRST.length) % LAST.length]}`;
}

function studentId(n: number): string {
  return `DT-${YEAR}-${String(n).padStart(4, '0')}`;
}

function studentEmail(id: string): string {
  return `${id.toLowerCase()}${STUDENT_MAIL}`;
}

function subjectsFor(grade: number): { name: string; code: string }[] {
  const core = [
    { name: 'Amharic', code: 'AMH' },
    { name: 'English', code: 'ENG' },
    { name: 'Mathematics', code: 'MAT' },
  ];
  if (grade === 0) {
    return [...core, { name: 'Environment', code: 'ENV' }, { name: 'Arts', code: 'ART' }, { name: 'Physical Education', code: 'PE' }];
  }
  if (grade <= 4) {
    return [
      ...core,
      { name: 'Environmental Science', code: 'ENV' },
      { name: 'Civic Education', code: 'CIV' },
      { name: 'Arts', code: 'ART' },
      { name: 'Physical Education', code: 'PE' },
    ];
  }
  return [
    ...core,
    { name: 'General Science', code: 'SCI' },
    { name: 'Social Studies', code: 'SOC' },
    { name: 'Civic Education', code: 'CIV' },
    { name: 'Information Technology', code: 'ICT' },
    { name: 'Physical Education', code: 'PE' },
  ];
}

function letter(total: number): string {
  if (total >= 90) return 'A';
  if (total >= 80) return 'B';
  if (total >= 70) return 'C';
  if (total >= 60) return 'D';
  return 'F';
}

function scores(studentSeq: number, courseIndex: number, term: number) {
  const n = (studentSeq * 17 + courseIndex * 13 + term * 7) % 41;
  const total = 54 + n;
  const testScore = Math.round(total * 0.3 * 10) / 10;
  const quizScore = Math.round(total * 0.2 * 10) / 10;
  const finalExamScore = Math.round((total - testScore - quizScore) * 10) / 10;
  return { testScore, quizScore, finalExamScore, totalScore: total, letterGrade: letter(total) };
}

function sheetStatus(code: string, term: number): SheetStatus {
  if (term === 1) return 'APPROVED';
  if (code === 'ART' || code === 'PE') return 'DRAFT';
  if (code === 'MAT' || code === 'ENG') return 'PENDING_APPROVAL';
  return 'APPROVED';
}

function ethiopianPhone(i: number): string {
  return `09${String(10_000_000 + ((i * 7919) % 89_999_999)).slice(0, 8)}`;
}

function weekdays(count: number, start: Date): Date[] {
  const out: Date[] = [];
  const d = new Date(start);
  while (out.length < count) {
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) out.push(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

function homeroomEmail(gradeLevel: number, section: string): string {
  const tag = gradeLevel === 0 ? 'kg' : `g${gradeLevel}`;
  return `homeroom.${tag}${section.toLowerCase()}${DEMO_SUFFIX}`;
}

async function chunkedCreate<T>(label: string, rows: T[], insert: (batch: T[]) => Promise<unknown>, size = 700) {
  for (let i = 0; i < rows.length; i += size) {
    await insert(rows.slice(i, i + size));
    console.log(`  ${label}: ${Math.min(i + size, rows.length)}/${rows.length}`);
  }
}

async function wipeDemo(): Promise<void> {
  console.log('Removing previous demo rows…');
  const demoStaff = await prisma.user.findMany({
    where: { email: { endsWith: DEMO_SUFFIX } },
    select: { id: true },
  });
  const demoIds = demoStaff.map((u) => u.id);

  const profiles = await prisma.studentProfile.findMany({
    where: {
      OR: [
        { studentIdNumber: { gte: studentId(ID_START), lte: studentId(ID_START + 999) } },
        ...(demoIds.length ? [{ parentId: { in: demoIds } }] : []),
      ],
    },
    select: { id: true, userId: true },
  });
  const profileIds = profiles.map((p) => p.id);
  const studentUserIds = profiles.map((p) => p.userId);

  const courses = demoIds.length
    ? await prisma.course.findMany({ where: { teacherId: { in: demoIds } }, select: { id: true } })
    : [];
  const courseIds = courses.map((c) => c.id);
  const sheets = courseIds.length
    ? await prisma.gradeSheet.findMany({ where: { courseId: { in: courseIds } }, select: { id: true } })
    : [];
  const sheetIds = sheets.map((s) => s.id);

  if (sheetIds.length) {
    await prisma.inquiry.deleteMany({ where: { gradeSheetId: { in: sheetIds } } });
    await prisma.studentResult.deleteMany({ where: { gradeSheetId: { in: sheetIds } } });
    await prisma.gradeSheet.deleteMany({ where: { id: { in: sheetIds } } });
  }
  if (courseIds.length) {
    await prisma.attendance.deleteMany({ where: { courseId: { in: courseIds } } });
    await prisma.course.deleteMany({ where: { id: { in: courseIds } } });
  }
  if (profileIds.length) {
    await prisma.paymentStatusLog.deleteMany({ where: { studentId: { in: profileIds } } });
    await prisma.payment.deleteMany({ where: { studentId: { in: profileIds } } });
    await prisma.studentProfile.deleteMany({ where: { id: { in: profileIds } } });
  }
  if (demoIds.length) {
    await prisma.$executeRaw`DELETE FROM "Homeroom" WHERE "teacherId" IN (${Prisma.join(demoIds)})`;
    await prisma.announcement.deleteMany({ where: { authorId: { in: demoIds } } });
  }
  const wipeUsers = [...new Set([...studentUserIds, ...demoIds])];
  if (wipeUsers.length) await prisma.user.deleteMany({ where: { id: { in: wipeUsers } } });
}

async function main(): Promise<void> {
  const reset = process.argv.includes('--reset');
  const marker = await prisma.user.findUnique({ where: { email: `it${DEMO_SUFFIX}` } });
  if (marker && !reset) {
    console.log('Demo data is already in the database. Re-run with --reset to rebuild it.');
    printLogins();
    return;
  }
  if (marker || reset) await wipeDemo();

  const director = await prisma.user.findFirst({ where: { role: 'DIRECTOR' } });
  if (!director) {
    throw new Error('Director account missing. Start the API once so seedDirector can run.');
  }

  console.log('Hashing shared demo password…');
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const classKeys = GRADES.flatMap((gradeLevel) => SECTIONS.map((section) => ({ gradeLevel, section })));
  const studentCount = classKeys.length * PER_CLASS;
  console.log(`Seeding ${classKeys.length} classes × ${PER_CLASS} = ${studentCount} students (${YEAR})`);

  const homeroomUsers = classKeys.map(({ gradeLevel, section }) => ({
    email: homeroomEmail(gradeLevel, section),
    name: nameAt(200 + gradeLevel * 10 + section.charCodeAt(0)),
    phone: ethiopianPhone(800 + gradeLevel * 10 + section.charCodeAt(0)),
    gradeLevel,
    section,
  }));

  const specialistCodes = ['AMH', 'ENG', 'MAT', 'ENV', 'SCI', 'SOC', 'CIV', 'ICT', 'ART', 'PE'] as const;
  const specialists = specialistCodes.flatMap((code, ci) =>
    [1, 2, 3].map((n) => ({
      email: `${code.toLowerCase()}.${n}${DEMO_SUFFIX}`,
      name: nameAt(400 + ci * 3 + n),
      phone: ethiopianPhone(900 + ci * 3 + n),
      code,
    }))
  );

  const parentCount = Math.ceil(studentCount * 0.82);
  const parentPlan = Array.from({ length: parentCount }, (_, i) => ({
    email: `p${String(i + 1).padStart(4, '0')}${DEMO_SUFFIX}`,
    name: nameAt(i + 50),
    phone: ethiopianPhone(i + 20),
  }));

  const userRows: Prisma.UserCreateManyInput[] = [
    { email: `it${DEMO_SUFFIX}`, name: 'Hanna IT Office', phone: '0911000001', role: 'IT_ADMIN', passwordHash, isActive: true },
    { email: `office${DEMO_SUFFIX}`, name: 'Yared Tuition Office', phone: '0911000002', role: 'MANAGER', passwordHash, isActive: true },
    { email: `family${DEMO_SUFFIX}`, name: 'Abebe Desalegn', phone: '0911223344', role: 'PARENT', passwordHash, isActive: true },
    ...homeroomUsers.map((h) => ({
      email: h.email,
      name: h.name,
      phone: h.phone,
      role: 'TEACHER' as const,
      passwordHash,
      isActive: true,
    })),
    ...specialists.map((s) => ({
      email: s.email,
      name: s.name,
      phone: s.phone,
      role: 'TEACHER' as const,
      passwordHash,
      isActive: true,
    })),
    ...parentPlan.map((p) => ({
      email: p.email,
      name: p.name,
      phone: p.phone,
      role: 'PARENT' as const,
      passwordHash,
      isActive: true,
    })),
  ];

  console.log('Creating staff, teachers, and parents…');
  await chunkedCreate('users', userRows, (data) => prisma.user.createMany({ data }));

  const savedDemo = await prisma.user.findMany({
    where: { email: { endsWith: DEMO_SUFFIX } },
    select: { id: true, email: true, role: true },
  });
  const byEmail = new Map(savedDemo.map((u) => [u.email, u]));
  const requireUser = (email: string) => {
    const u = byEmail.get(email);
    if (!u) throw new Error(`Missing user ${email}`);
    return u;
  };
  const it = requireUser(`it${DEMO_SUFFIX}`);
  const office = requireUser(`office${DEMO_SUFFIX}`);
  const featuredParent = requireUser(`family${DEMO_SUFFIX}`);
  const parentIds = parentPlan.map((p) => requireUser(p.email).id);

  type ChildPlan = {
    seq: number;
    studentIdNumber: string;
    gradeLevel: number;
    section: string;
    parentId: string;
    name: string;
    enableLogin: boolean;
  };

  const featuredNames: Record<string, string> = {
    '0-A': 'Hana Desalegn',
    '3-C': 'Liya Desalegn',
    '5-B': 'Ermias Desalegn',
  };

  const children: ChildPlan[] = [];
  let nextId = ID_START;
  let parentCursor = 0;
  for (const { gradeLevel, section } of classKeys) {
    for (let i = 0; i < PER_CLASS; i++) {
      const featuredName = i === 0 ? featuredNames[`${gradeLevel}-${section}`] : undefined;
      let parentId = featuredName ? featuredParent.id : parentIds[parentCursor % parentIds.length]!;
      if (!featuredName && nextId % 8 === 0 && children.length > 40) {
        parentId = children[children.length - 37]!.parentId;
      } else if (!featuredName) {
        parentCursor += 1;
      }
      children.push({
        seq: nextId,
        studentIdNumber: studentId(nextId),
        gradeLevel,
        section,
        parentId,
        name: featuredName ?? nameAt(nextId),
        enableLogin: gradeLevel >= 5,
      });
      nextId += 1;
    }
  }

  console.log('Creating student logins…');
  await chunkedCreate(
    'students',
    children.map((c) => ({
      name: c.name,
      email: studentEmail(c.studentIdNumber),
      passwordHash,
      role: 'STUDENT' as const,
      isActive: c.enableLogin,
    })),
    (data) => prisma.user.createMany({ data })
  );

  const studentUsers = await prisma.user.findMany({
    where: { email: { endsWith: STUDENT_MAIL } },
    select: { id: true, email: true },
  });
  const studentIdByEmail = new Map(studentUsers.map((u) => [u.email, u.id]));

  console.log('Creating student profiles…');
  await chunkedCreate(
    'profiles',
    children.map((c) => {
      const userId = studentIdByEmail.get(studentEmail(c.studentIdNumber));
      if (!userId) throw new Error(`Missing student user ${c.studentIdNumber}`);
      return {
        userId,
        studentIdNumber: c.studentIdNumber,
        parentId: c.parentId,
        gradeLevel: c.gradeLevel,
        section: c.section,
        academicYear: YEAR,
        isActive: c.seq % 7 !== 0,
      };
    }),
    (data) => prisma.studentProfile.createMany({ data })
  );

  const profiles = await prisma.studentProfile.findMany({
    where: { studentIdNumber: { gte: studentId(ID_START), lte: studentId(nextId - 1) } },
    select: { id: true, studentIdNumber: true, gradeLevel: true, section: true, parentId: true },
  });
  const profileBySid = new Map(profiles.map((p) => [p.studentIdNumber, p]));
  const childrenByClass = new Map<string, ChildPlan[]>();
  for (const c of children) {
    const key = `${c.gradeLevel}|${c.section}`;
    const list = childrenByClass.get(key) ?? [];
    list.push(c);
    childrenByClass.set(key, list);
  }

  const courseInputs: { data: Prisma.CourseCreateManyInput; subjectCode: string }[] = [];
  for (const { gradeLevel, section } of classKeys) {
    subjectsFor(gradeLevel).forEach((sub, idx) => {
      const specs = specialists.filter((s) => s.code === sub.code);
      const teacherEmail =
        sub.code === 'AMH'
          ? homeroomEmail(gradeLevel, section)
          : (specs[(gradeLevel + section.charCodeAt(0) + idx) % Math.max(specs.length, 1)] ?? specialists[idx % specialists.length]!)
              .email;
      courseInputs.push({
        subjectCode: sub.code,
        data: {
          name: sub.name,
          code: `${sub.code}${gradeLevel}${section}`,
          gradeLevel,
          section,
          teacherId: requireUser(teacherEmail).id,
          academicYear: YEAR,
        },
      });
    });
  }

  console.log('Creating homerooms and courses…');
  await prisma.$executeRaw`DELETE FROM "Homeroom" WHERE "academicYear" = ${YEAR}`;
  for (const h of homeroomUsers) {
    const id = `hr_${h.gradeLevel}_${h.section}_${YEAR}`;
    await prisma.$executeRaw`
      INSERT INTO "Homeroom" ("id", "gradeLevel", "section", "academicYear", "teacherId")
      VALUES (${id}, ${h.gradeLevel}, ${h.section}, ${YEAR}, ${requireUser(h.email).id})
    `;
  }
  await prisma.course.createMany({ data: courseInputs.map((c) => c.data) });

  const courses = await prisma.course.findMany({
    where: { academicYear: YEAR, teacher: { email: { endsWith: DEMO_SUFFIX } } },
    select: { id: true, name: true, code: true, gradeLevel: true, section: true, teacherId: true },
  });
  const subjectCodeByCourseId = new Map(
    courses.map((c) => {
      const input = courseInputs.find((x) => x.data.code === c.code);
      return [c.id, input?.subjectCode ?? c.code.slice(0, 3)] as const;
    })
  );

  const sheets: Prisma.GradeSheetCreateManyInput[] = [];
  for (const course of courses) {
    const code = subjectCodeByCourseId.get(course.id) ?? 'AMH';
    for (const term of [1, 2] as const) {
      const status = sheetStatus(code, term);
      sheets.push({
        courseId: course.id,
        teacherId: course.teacherId,
        academicYear: YEAR,
        term,
        status,
        submittedAt: status === 'DRAFT' ? null : new Date(Date.UTC(2026, term === 1 ? 3 : 7, 10)),
        approvedById: status === 'APPROVED' ? director.id : null,
        approvedAt: status === 'APPROVED' ? new Date(Date.UTC(2026, term === 1 ? 3 : 7, 12)) : null,
      });
    }
  }

  console.log('Creating grade sheets…');
  await chunkedCreate('sheets', sheets, (data) => prisma.gradeSheet.createMany({ data }));

  const savedSheets = await prisma.gradeSheet.findMany({
    where: { academicYear: YEAR, courseId: { in: courses.map((c) => c.id) } },
    select: { id: true, courseId: true, term: true, status: true, course: { select: { gradeLevel: true, section: true, code: true } } },
  });

  const results: Prisma.StudentResultCreateManyInput[] = [];
  for (const sheet of savedSheets) {
    const kids = childrenByClass.get(`${sheet.course.gradeLevel}|${sheet.course.section}`) ?? [];
    const courseIndex = courses.findIndex((c) => c.id === sheet.courseId);
    for (const kid of kids) {
      const profile = profileBySid.get(kid.studentIdNumber);
      if (!profile) continue;
      const s = scores(kid.seq, Math.max(courseIndex, 0), sheet.term);
      results.push({
        gradeSheetId: sheet.id,
        studentId: profile.id,
        ...s,
        behavioralRemark: kid.seq % 19 === 0 ? 'Needs more practice at home.' : kid.seq % 11 === 0 ? 'Participates well in class.' : null,
      });
    }
  }

  console.log('Creating results…');
  await chunkedCreate('results', results, (data) => prisma.studentResult.createMany({ data }), 1000);

  const methods: PayMethod[] = ['CASH', 'BANK_TRANSFER', 'TELEBIRR', 'MPESA'];
  const payments: Prisma.PaymentCreateManyInput[] = [];
  const logs: Prisma.PaymentStatusLogCreateManyInput[] = [];

  for (const kid of children) {
    const profile = profileBySid.get(kid.studentIdNumber);
    if (!profile) continue;
    const paidThrough = kid.seq % 7 === 0 ? 3 : kid.seq % 5 === 0 ? 6 : 7;
    for (let month = 1; month <= paidThrough; month++) {
      const method = methods[(kid.seq + month) % methods.length]!;
      const rejected = kid.seq % 41 === 0 && month === paidThrough;
      const pending = !rejected && month === paidThrough && kid.seq % 4 === 0;
      const status: PayStatus = rejected ? 'REJECTED' : pending ? 'PENDING' : 'VERIFIED';
      const createdAt = new Date(Date.UTC(2026, month - 1, 8 + (kid.seq % 12)));
      payments.push({
        parentId: profile.parentId,
        studentId: profile.id,
        academicYear: YEAR,
        term: termFromMonth(month),
        month,
        coveredMonths: String(month),
        amount: MONTHLY_TUITION_ETB,
        currency: 'ETB',
        method,
        referencePNR: `${method.slice(0, 3)}-${YEAR}-${String(month).padStart(2, '0')}-${kid.seq}`,
        payerPhone: method === 'TELEBIRR' || method === 'MPESA' ? ethiopianPhone(kid.seq) : null,
        providerRef: method === 'TELEBIRR' || method === 'MPESA' ? `prov-${kid.seq}-${month}` : null,
        status,
        verifiedById: status === 'VERIFIED' ? office.id : null,
        verifiedAt: status === 'VERIFIED' ? new Date(createdAt.getTime() + 86_400_000) : null,
        createdAt,
        updatedAt: createdAt,
      });
      if (status === 'VERIFIED') {
        logs.push({
          studentId: profile.id,
          academicYear: YEAR,
          month,
          fromStatus: 'PENDING',
          toStatus: 'VERIFIED',
          note: 'Office verified (demo seed)',
          actorId: office.id,
          createdAt: new Date(createdAt.getTime() + 86_400_000),
        });
      }
    }
  }

  console.log('Creating payments…');
  await chunkedCreate('payments', payments, (data) => prisma.payment.createMany({ data }), 800);
  await chunkedCreate('pay logs', logs, (data) => prisma.paymentStatusLog.createMany({ data }), 800);

  const attendDays = weekdays(8, new Date(Date.UTC(2026, 4, 4)));
  const attendCodes = new Set(['MAT', 'PE']);
  const attendance: Prisma.AttendanceCreateManyInput[] = [];
  const attendStatuses: Attend[] = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'ABSENT', 'EXCUSED'];
  for (const course of courses) {
    const code = subjectCodeByCourseId.get(course.id) ?? '';
    if (!attendCodes.has(code)) continue;
    const kids = childrenByClass.get(`${course.gradeLevel}|${course.section}`) ?? [];
    for (const kid of kids) {
      const profile = profileBySid.get(kid.studentIdNumber);
      if (!profile) continue;
      for (let d = 0; d < attendDays.length; d++) {
        attendance.push({
          studentId: profile.id,
          courseId: course.id,
          date: attendDays[d]!,
          status: attendStatuses[(kid.seq + d) % attendStatuses.length]!,
          recordedById: course.teacherId,
        });
      }
    }
  }

  console.log('Creating attendance…');
  await chunkedCreate('attendance', attendance, (data) => prisma.attendance.createMany({ data }), 1000);

  const pendingSheets = savedSheets.filter((s) => s.status === 'PENDING_APPROVAL').slice(0, 18);
  await prisma.inquiry.createMany({
    data: pendingSheets.map((s, i) => ({
      gradeSheetId: s.id,
      teacherId: courses.find((c) => c.id === s.courseId)!.teacherId,
      reason: i % 2 === 0 ? 'Please review the term-2 totals before approval.' : 'Two students transferred in after the draft was opened.',
      status: i % 5 === 0 ? 'APPROVED' : 'PENDING',
      resolvedById: i % 5 === 0 ? director.id : null,
    })),
  });

  await prisma.announcement.createMany({
    data: [
      {
        title: 'Welcome to 2026',
        content: 'Classes are in session. Homeroom teachers will post term dates this week.',
        audience: 'ALL',
        authorId: it.id,
        gradeLevel: null,
      },
      {
        title: 'Tuition reminder',
        content: 'Monthly tuition is 2000 ETB, due on the 30th, with a 5-day grace period.',
        audience: 'PARENTS',
        authorId: office.id,
        gradeLevel: null,
      },
      {
        title: 'Grade 5 field visit',
        content: 'Grade 5 sections will visit the Debre Tabor museum on Friday. Send a signed note if your child cannot attend.',
        audience: 'PARENTS',
        authorId: requireUser(homeroomEmail(5, 'B')).id,
        gradeLevel: 5,
      },
      {
        title: 'Submit term-2 sheets',
        content: 'Mathematics and English term-2 sheets are waiting for office review.',
        audience: 'TEACHERS',
        authorId: director.id,
        gradeLevel: null,
      },
      {
        title: 'Sports day',
        content: 'PE clubs meet on the east field after last period on Thursday.',
        audience: 'STUDENTS',
        authorId: requireUser(`pe.1${DEMO_SUFFIX}`).id,
        gradeLevel: null,
      },
    ],
  });

  console.log('\nDemo seed complete.');
  printLogins();
  console.log(`Students: ${children.length}  Courses: ${courses.length}  Sheets: ${savedSheets.length}`);
  console.log(`Results: ${results.length}  Payments: ${payments.length}  Attendance: ${attendance.length}`);
}

function printLogins(): void {
  console.log(`\nPassword for all demo accounts: ${PASSWORD}`);
  console.log('  Director     director@dt-academy.local   (existing SEED_ADMIN password)');
  console.log(`  IT admin     it${DEMO_SUFFIX}`);
  console.log(`  Tuition      office${DEMO_SUFFIX}`);
  console.log(`  Parent       family${DEMO_SUFFIX}   (Hana KG-A, Liya 3C, Ermias 5B)`);
  console.log(`  Homeroom 5B  ${homeroomEmail(5, 'B')}`);
  console.log(`  Student      ${studentEmail(studentId(ID_START + classOffset(5, 'B')))}   (Ermias, Grade 5B)`);
}

function classOffset(gradeLevel: number, section: string): number {
  const gi = GRADES.indexOf(gradeLevel as (typeof GRADES)[number]);
  const si = SECTIONS.indexOf(section as (typeof SECTIONS)[number]);
  return (gi * SECTIONS.length + si) * PER_CLASS;
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
