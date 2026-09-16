import type { Request, Response } from 'express';
import { admitStudentCore } from '../services/admitStudent';

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

  const result = await admitStudentCore({
    studentName: studentName ?? '',
    grade: grade ?? '',
    section: section ?? '',
    academicYear: academicYear ?? '',
    parentName: parentName ?? '',
    parentPhone: parentPhone ?? '',
    parentEmail,
    enableStudentLogin,
  });

  if (!result.ok) {
    res.status(result.status).json({ message: result.message });
    return;
  }

  const { ok: _ok, ...body } = result;
  res.status(201).json(body);
}
