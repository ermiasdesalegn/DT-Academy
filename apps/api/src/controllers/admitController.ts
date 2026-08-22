import { randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { toAuthUser } from '../utils/toAuthUser';
import { parseGradeLevel, studentLoginAllowed } from '../utils/parseGrade';
import { normalizePhone, phoneLookupVariants } from '../utils/phone';

function tempPassword(): string {
  return randomBytes(9).toString('base64url').slice(0, 12);
}

function yearPrefix(academicYear: string): string {
  const digits = academicYear.replace(/\D/g, '').slice(0, 4);
  return digits || String(new Date().getFullYear());
}

async function mintStudentId(academicYear: string): Promise<string> {
  const prefix = `DT-${yearPrefix(academicYear)}-`;
  const last = await prisma.studentProfile.findFirst({
    where: { studentIdNumber: { startsWith: prefix } },
    orderBy: { studentIdNumber: 'desc' },
    select: { studentIdNumber: true },
  });
  const next = last ? Number(last.studentIdNumber.slice(prefix.length)) + 1 : 1;
  const seq = Number.isFinite(next) && next > 0 ? next : 1;
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

export async function admitStudent(req: Request, res: Response): Promise<void> {
  const {
    studentName,
    grade,
    section,
    academicYear,
    parentName,
    parentPhone,
    parentEmail,
    enableStudentLogin,
  } = req.body as {
    studentName?: string;
    grade?: string;
    section?: string;
    academicYear?: string;
    parentName?: string;
    parentPhone?: string;
    parentEmail?: string;
    enableStudentLogin?: boolean;
  };

  if (!studentName?.trim() || !grade?.trim() || !section?.trim() || !academicYear?.trim()) {
    res.status(400).json({ message: 'Student name, grade, section, and academic year are required' });
    return;
  }
  if (!parentName?.trim() || !parentPhone?.trim()) {
    res.status(400).json({ message: 'Parent name and phone are required' });
    return;
  }

  const gradeLevel = parseGradeLevel(grade);
  if (gradeLevel === null) {
    res.status(400).json({ message: 'Grade must be KG, 1–8, or Prep' });
    return;
  }

  const phoneDigits = normalizePhone(parentPhone);
  if (phoneDigits.length < 9) {
    res.status(400).json({ message: 'Enter a valid parent phone number' });
    return;
  }

  const sectionCode = section.trim().toUpperCase().slice(0, 4);
  const year = academicYear.trim();
  const emailInput = parentEmail?.trim().toLowerCase() || undefined;
  const allowLogin = Boolean(enableStudentLogin) && studentLoginAllowed(gradeLevel);

  const phoneVariants = phoneLookupVariants(parentPhone);
  const existingParent = await prisma.user.findFirst({
    where: {
      role: 'PARENT',
      OR: [
        ...(emailInput ? [{ email: emailInput }] : []),
        { phone: { in: phoneVariants } },
      ],
    },
  });

  let parent = existingParent;
  let parentCreated = false;
  let parentTemporaryPassword: string | undefined;

  if (!parent) {
    const parentMail =
      emailInput ?? `p${phoneDigits}@parents.dt-academy.local`;
    const taken = await prisma.user.findUnique({ where: { email: parentMail } });
    if (taken) {
      res.status(409).json({ message: 'That email is already used by another account' });
      return;
    }
    parentTemporaryPassword = tempPassword();
    parent = await prisma.user.create({
      data: {
        name: parentName.trim(),
        email: parentMail,
        passwordHash: await bcrypt.hash(parentTemporaryPassword, 12),
        phone: phoneDigits.startsWith('0') ? phoneDigits : `0${phoneDigits.slice(-9)}`,
        role: 'PARENT',
        isActive: true,
      },
    });
    parentCreated = true;
  } else if (!parent.phone) {
    parent = await prisma.user.update({
      where: { id: parent.id },
      data: { phone: phoneDigits.startsWith('0') ? phoneDigits : `0${phoneDigits.slice(-9)}` },
    });
  }

  const studentIdNumber = await mintStudentId(year);
  const studentEmail = `${studentIdNumber.toLowerCase()}@students.dt-academy.local`;
  const studentTemporaryPassword = allowLogin ? tempPassword() : tempPassword();

  const student = await prisma.user.create({
    data: {
      name: studentName.trim(),
      email: studentEmail,
      passwordHash: await bcrypt.hash(studentTemporaryPassword, 12),
      role: 'STUDENT',
      isActive: allowLogin,
      studentProfile: {
        create: {
          studentIdNumber,
          parentId: parent.id,
          gradeLevel,
          section: sectionCode,
          academicYear: year,
          isActive: false,
        },
      },
    },
    include: { studentProfile: true },
  });

  const profile = student.studentProfile;
  if (!profile) {
    res.status(500).json({ message: 'Admission saved but student profile is missing' });
    return;
  }

  res.status(201).json({
    parent: toAuthUser(parent),
    parentCreated,
    ...(parentCreated ? { parentTemporaryPassword } : {}),
    student: toAuthUser(student),
    studentProfile: {
      _id: profile.id,
      userId: profile.userId,
      studentIdNumber: profile.studentIdNumber,
      parentId: profile.parentId,
      gradeLevel: profile.gradeLevel,
      section: profile.section,
      academicYear: profile.academicYear,
      isActive: profile.isActive,
    },
    studentLoginEnabled: allowLogin,
    ...(allowLogin ? { studentTemporaryPassword } : {}),
  });
}
