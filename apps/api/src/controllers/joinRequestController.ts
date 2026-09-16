import type { Request, Response } from 'express';
import type { IJoinRequest } from '@dt-academy/types';
import { prisma } from '../lib/prisma';
import { admitStudentCore, gradeTokenFromLevel } from '../services/admitStudent';
import { normalizePhone } from '../utils/phone';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function clientKey(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) return forwarded.split(',')[0]!.trim();
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function allow(ip: string): boolean {
  const now = Date.now();
  const prev = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (prev.length >= MAX_PER_WINDOW) {
    hits.set(ip, prev);
    return false;
  }
  prev.push(now);
  hits.set(ip, prev);
  return true;
}

function mapJoin(row: {
  id: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string | null;
  gradeLevel: number;
  section: string | null;
  academicYear: string | null;
  note: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedAt: Date | null;
  reviewedById: string | null;
  rejectReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  reviewedBy?: { name: string } | null;
}): IJoinRequest {
  return {
    _id: row.id,
    studentName: row.studentName,
    parentName: row.parentName,
    parentPhone: row.parentPhone,
    parentEmail: row.parentEmail ?? undefined,
    gradeLevel: row.gradeLevel,
    section: row.section ?? undefined,
    academicYear: row.academicYear ?? undefined,
    note: row.note,
    status: row.status,
    reviewedAt: row.reviewedAt?.toISOString(),
    reviewedById: row.reviewedById ?? undefined,
    reviewedByName: row.reviewedBy?.name,
    rejectReason: row.rejectReason ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function submitJoinRequest(req: Request, res: Response): Promise<void> {
  if (!allow(clientKey(req))) {
    res.status(429).json({ message: 'Too many requests. Wait a few minutes or call the office.' });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const studentName = typeof body.studentName === 'string' ? body.studentName.trim() : '';
  const parentName = typeof body.parentName === 'string' ? body.parentName.trim() : '';
  const parentPhone = typeof body.parentPhone === 'string' ? body.parentPhone.trim() : '';
  const parentEmail = typeof body.parentEmail === 'string' ? body.parentEmail.trim() : '';
  const note = typeof body.note === 'string' ? body.note.trim() : '';
  const section = typeof body.section === 'string' ? body.section.trim().toUpperCase().slice(0, 4) : '';
  const academicYear = typeof body.academicYear === 'string' ? body.academicYear.trim() : '';
  const gradeLevel = Math.trunc(Number(body.gradeLevel));

  if (studentName.length < 2 || studentName.length > 120) {
    res.status(400).json({ message: 'Enter the student’s full name.' });
    return;
  }
  if (parentName.length < 2 || parentName.length > 120) {
    res.status(400).json({ message: 'Enter the parent’s full name.' });
    return;
  }
  const phoneDigits = normalizePhone(parentPhone);
  if (phoneDigits.length < 9) {
    res.status(400).json({ message: 'Enter a valid parent phone number.' });
    return;
  }
  if (!Number.isFinite(gradeLevel) || gradeLevel < 0 || gradeLevel > 8) {
    res.status(400).json({ message: 'Grade must be KG through Grade 8.' });
    return;
  }
  if (note.length < 4 || note.length > 2000) {
    res.status(400).json({ message: 'Add a short note for the office (at least a few words).' });
    return;
  }
  if (parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
    res.status(400).json({ message: 'Enter a valid email or leave it blank.' });
    return;
  }

  const row = await prisma.joinRequest.create({
    data: {
      studentName,
      parentName,
      parentPhone: phoneDigits.startsWith('0') ? phoneDigits : `0${phoneDigits.slice(-9)}`,
      parentEmail: parentEmail || null,
      gradeLevel,
      section: section || null,
      academicYear: academicYear || null,
      note,
      status: 'PENDING',
    },
  });

  res.status(201).json({ request: mapJoin(row) });
}

export async function listJoinRequests(req: Request, res: Response): Promise<void> {
  const statusRaw = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : 'PENDING';
  const status =
    statusRaw === 'ALL' || statusRaw === 'APPROVED' || statusRaw === 'REJECTED' || statusRaw === 'PENDING'
      ? statusRaw
      : 'PENDING';

  const rows = await prisma.joinRequest.findMany({
    where: status === 'ALL' ? undefined : { status },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { reviewedBy: { select: { name: true } } },
  });

  res.json({ requests: rows.map(mapJoin) });
}

export async function approveJoinRequest(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const id = String(req.params.id ?? '');
  const section =
    typeof req.body?.section === 'string' && req.body.section.trim()
      ? req.body.section.trim().toUpperCase().slice(0, 4)
      : '';
  const academicYear =
    typeof req.body?.academicYear === 'string' && req.body.academicYear.trim()
      ? req.body.academicYear.trim()
      : '';
  const enableStudentLogin = Boolean(req.body?.enableStudentLogin);

  const row = await prisma.joinRequest.findUnique({ where: { id } });
  if (!row || row.status !== 'PENDING') {
    res.status(404).json({ message: 'Pending join request not found.' });
    return;
  }

  const sectionCode = section || row.section || 'A';
  const year =
    academicYear ||
    row.academicYear ||
    `${new Date().getFullYear()}/${String(new Date().getFullYear() + 1).slice(-2)}`;

  const admitted = await admitStudentCore({
    studentName: row.studentName,
    grade: gradeTokenFromLevel(row.gradeLevel),
    section: sectionCode,
    academicYear: year,
    parentName: row.parentName,
    parentPhone: row.parentPhone,
    parentEmail: row.parentEmail ?? undefined,
    enableStudentLogin,
  });

  if (!admitted.ok) {
    res.status(admitted.status).json({ message: admitted.message });
    return;
  }

  const updated = await prisma.joinRequest.update({
    where: { id },
    data: {
      status: 'APPROVED',
      reviewedAt: new Date(),
      reviewedById: req.user.id,
      section: sectionCode,
      academicYear: year,
    },
    include: { reviewedBy: { select: { name: true } } },
  });

  const { ok: _ok, ...admitBody } = admitted;
  res.json({ request: mapJoin(updated), ...admitBody });
}

export async function rejectJoinRequest(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const id = String(req.params.id ?? '');
  const rejectReason =
    typeof req.body?.reason === 'string' ? req.body.reason.trim().slice(0, 500) : '';

  const row = await prisma.joinRequest.findUnique({ where: { id } });
  if (!row || row.status !== 'PENDING') {
    res.status(404).json({ message: 'Pending join request not found.' });
    return;
  }

  const updated = await prisma.joinRequest.update({
    where: { id },
    data: {
      status: 'REJECTED',
      reviewedAt: new Date(),
      reviewedById: req.user.id,
      rejectReason: rejectReason || null,
    },
    include: { reviewedBy: { select: { name: true } } },
  });

  res.json({ request: mapJoin(updated) });
}
