import type { Request, Response } from 'express';
import type { PaymentMethod, PaymentStatus } from '@prisma/client';
import type { ICreatePaymentRequest, IPaymentListItem } from '@dt-academy/types';
import { academicYearNumber, MONTHLY_TUITION_ETB, termFromMonth } from '@dt-academy/types';
import { env } from '../config/env';
import { createCheckout } from '../payments/provider';
import { markPaymentVerified } from '../payments/settle';
import { prisma } from '../lib/prisma';
import { buildTuitionMonths, monthsCovered } from '../lib/tuitionMonths';

const METHODS: PaymentMethod[] = ['CASH', 'BANK_TRANSFER', 'TELEBIRR', 'MPESA'];
const STATUSES: PaymentStatus[] = ['PENDING', 'VERIFIED', 'REJECTED'];

function toListItem(row: {
  id: string;
  parentId: string;
  studentId: string;
  academicYear: string;
  term: number;
  month: number;
  amount: { toString(): string } | number;
  currency: string;
  method: PaymentMethod;
  referencePNR: string;
  providerRef: string | null;
  payerPhone: string | null;
  receiptUrl: string | null;
  status: PaymentStatus;
  verifiedById: string | null;
  verifiedAt: Date | null;
  parent: { name: string };
  student: { studentIdNumber: string; user: { name: string } };
}): IPaymentListItem {
  return {
    _id: row.id,
    parentId: row.parentId,
    studentId: row.studentId,
    academicYear: row.academicYear,
    term: row.term,
    month: row.month,
    amount: Number(row.amount),
    currency: row.currency,
    method: row.method,
    referencePNR: row.referencePNR,
    providerRef: row.providerRef ?? undefined,
    payerPhone: row.payerPhone ?? undefined,
    receiptUrl: row.receiptUrl ?? undefined,
    status: row.status,
    verifiedBy: row.verifiedById ?? undefined,
    verifiedAt: row.verifiedAt ?? undefined,
    parentName: row.parent.name,
    studentName: row.student.user.name,
    studentIdNumber: row.student.studentIdNumber,
  };
}

const paymentInclude = {
  parent: { select: { name: true } },
  student: { select: { studentIdNumber: true, user: { select: { name: true } } } },
} as const;

export async function listPayments(req: Request, res: Response): Promise<void> {
  const statusRaw = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : undefined;
  if (statusRaw && !STATUSES.includes(statusRaw as PaymentStatus)) {
    res.status(400).json({ message: 'Invalid payment status' });
    return;
  }

  const payments = await prisma.payment.findMany({
    where: statusRaw ? { status: statusRaw as PaymentStatus } : undefined,
    orderBy: { createdAt: 'desc' },
    include: paymentInclude,
    take: 50,
  });

  res.json({ payments: payments.map(toListItem) });
}

export async function createPayment(req: Request, res: Response): Promise<void> {
  const { studentProfileId, amount, method, referencePNR, academicYear, term, month } =
    req.body as Partial<ICreatePaymentRequest>;

  const numericMonth = Math.trunc(Number(month));
  if (
    !studentProfileId ||
    amount == null ||
    !method ||
    !referencePNR?.trim() ||
    !academicYear?.trim() ||
    !Number.isFinite(numericMonth) ||
    numericMonth < 1 ||
    numericMonth > 12
  ) {
    res.status(400).json({ message: 'studentProfileId, amount, method, referencePNR, academicYear, and month (1-12) are required' });
    return;
  }

  if (!METHODS.includes(method)) {
    res.status(400).json({ message: 'Invalid payment method' });
    return;
  }

  const numericAmount = Number(amount);
  const numericTerm = Number.isInteger(Number(term)) && Number(term) >= 1 && Number(term) <= 3
    ? Number(term)
    : termFromMonth(numericMonth);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    res.status(400).json({ message: 'amount must be a positive number' });
    return;
  }

  const profile = await prisma.studentProfile.findUnique({ where: { id: studentProfileId } });
  if (!profile) {
    res.status(404).json({ message: 'Student not found' });
    return;
  }

  if (req.user?.role === 'PARENT' && profile.parentId !== req.user.id) {
    res.status(403).json({ message: 'You can only submit payment for your own children' });
    return;
  }

  const year = academicYear.trim();
  const existing = await prisma.payment.findFirst({
    where: {
      studentId: profile.id,
      academicYear: year,
      month: numericMonth,
      status: { in: ['PENDING', 'VERIFIED'] },
    },
  });
  if (existing) {
    res.status(409).json({
      message:
        existing.status === 'VERIFIED'
          ? 'This month is already paid and verified.'
          : 'A receipt for this month is already with the office.',
    });
    return;
  }

  const payment = await prisma.payment.create({
    data: {
      parentId: profile.parentId,
      studentId: profile.id,
      academicYear: year,
      term: numericTerm,
      month: numericMonth,
      amount: numericAmount,
      method,
      referencePNR: referencePNR.trim(),
      status: 'PENDING',
    },
    include: paymentInclude,
  });

  res.status(201).json({ payment: toListItem(payment) });
}

export async function verifyPayment(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
  if (!payment) {
    res.status(404).json({ message: 'Payment not found' });
    return;
  }
  if (payment.status !== 'PENDING') {
    res.status(409).json({ message: 'Only pending payments can be verified' });
    return;
  }

  const result = await markPaymentVerified(payment.id, { verifiedById: req.user.id });
  if (!result.ok) {
    res.status(409).json({ message: 'Only pending payments can be verified' });
    return;
  }
  const updated = await prisma.payment.findUnique({
    where: { id: payment.id },
    include: paymentInclude,
  });
  if (!updated) {
    res.status(404).json({ message: 'Payment not found' });
    return;
  }

  res.json({ payment: toListItem(updated) });
}

export async function rejectPayment(req: Request, res: Response): Promise<void> {
  const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
  if (!payment) {
    res.status(404).json({ message: 'Payment not found' });
    return;
  }
  if (payment.status !== 'PENDING') {
    res.status(409).json({ message: 'Only pending payments can be rejected' });
    return;
  }

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'REJECTED' },
    include: paymentInclude,
  });

  res.json({ payment: toListItem(updated) });
}

export async function createOutstandingPayment(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const { studentProfileId, method, referencePNR, payerPhone } = req.body as {
    studentProfileId?: string;
    method?: PaymentMethod;
    referencePNR?: string;
    payerPhone?: string;
  };
  if (!studentProfileId || !method) {
    res.status(400).json({ message: 'studentProfileId and method are required' });
    return;
  }
  const mobile = method === 'TELEBIRR' || method === 'MPESA';
  if (!mobile && !referencePNR?.trim()) {
    res.status(400).json({ message: 'Receipt number is required for cash and bank transfer.' });
    return;
  }
  if (method === 'MPESA' && !payerPhone?.trim()) {
    res.status(400).json({ message: 'Enter the M-Pesa phone number that will approve this payment.' });
    return;
  }
  if (!METHODS.includes(method)) {
    res.status(400).json({ message: 'Invalid payment method' });
    return;
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    include: { payments: true },
  });
  if (!profile) {
    res.status(404).json({ message: 'Student not found' });
    return;
  }
  if (req.user.role === 'PARENT' && profile.parentId !== req.user.id) {
    res.status(403).json({ message: 'You can only submit payment for your own children' });
    return;
  }

  const year = academicYearNumber(profile.academicYear);
  const months = buildTuitionMonths(year, profile.payments);
  const unpaid = months.filter((m) => m.status === 'UNPAID');
  if (!unpaid.length) {
    res.status(409).json({ message: 'Nothing is outstanding for this student.' });
    return;
  }

  const amount = unpaid.reduce((sum, m) => sum + m.totalDueEtb, 0);
  const covered = unpaid.map((m) => m.month).join(',');
  const receipt = mobile ? `DT${Date.now()}` : referencePNR!.trim();
  const payment = await prisma.payment.create({
    data: {
      parentId: profile.parentId,
      studentId: profile.id,
      academicYear: profile.academicYear,
      term: termFromMonth(unpaid[0].month),
      month: unpaid[0].month,
      coveredMonths: covered,
      amount,
      method,
      referencePNR: receipt,
      payerPhone: mobile ? payerPhone?.trim() || null : null,
      status: 'PENDING',
    },
    include: paymentInclude,
  });

  if (mobile) {
    try {
      const checkout = await createCheckout({
        method: method === 'MPESA' ? 'MPESA' : 'TELEBIRR',
        paymentId: payment.id,
        amountEtb: amount,
        phone: payerPhone,
      });
      const updated = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          referencePNR: `DT${payment.id.replace(/[^A-Za-z0-9]/g, '').slice(0, 20)}`,
          providerRef: checkout.providerRef ?? payment.id,
        },
        include: paymentInclude,
      });
      res.status(201).json({
        payment: toListItem(updated),
        months: unpaid.map((m) => m.month),
        amount,
        checkoutUrl: checkout.redirectUrl,
        waitingForPhone: checkout.waitingForPhone ?? false,
      });
      return;
    } catch (err) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'REJECTED' },
      });
      const message = err instanceof Error ? err.message : 'Could not start mobile money.';
      res.status(502).json({ message });
      return;
    }
  }

  res.status(201).json({ payment: toListItem(payment), months: unpaid.map((m) => m.month), amount });
}

export async function setTuitionMonthStatus(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const { studentProfileId, month, status, note } = req.body as {
    studentProfileId?: string;
    month?: number;
    status?: 'PAID' | 'UNPAID';
    note?: string;
  };
  const numericMonth = Math.trunc(Number(month));
  if (!studentProfileId || !Number.isFinite(numericMonth) || numericMonth < 1 || numericMonth > 12) {
    res.status(400).json({ message: 'studentProfileId and month (1-12) are required' });
    return;
  }
  if (status !== 'PAID' && status !== 'UNPAID') {
    res.status(400).json({ message: 'status must be PAID or UNPAID' });
    return;
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    include: { payments: true },
  });
  if (!profile) {
    res.status(404).json({ message: 'Student not found' });
    return;
  }

  const year = academicYearNumber(profile.academicYear);
  const months = buildTuitionMonths(year, profile.payments);
  const current = months.find((m) => m.month === numericMonth);
  const fromStatus = current?.status ?? 'UPCOMING';

  if (status === 'PAID') {
    const pending = profile.payments.find(
      (p) => p.status === 'PENDING' && monthsCovered(p).length === 1 && monthsCovered(p)[0] === numericMonth
    );
    if (pending) {
      await prisma.payment.update({
        where: { id: pending.id },
        data: { status: 'VERIFIED', verifiedById: req.user.id, verifiedAt: new Date() },
      });
    } else if (fromStatus !== 'PAID') {
      await prisma.payment.create({
        data: {
          parentId: profile.parentId,
          studentId: profile.id,
          academicYear: profile.academicYear,
          term: termFromMonth(numericMonth),
          month: numericMonth,
          coveredMonths: '',
          amount: MONTHLY_TUITION_ETB,
          method: 'CASH',
          referencePNR: note?.trim() || 'Office: paid before the portal',
          status: 'VERIFIED',
          verifiedById: req.user.id,
          verifiedAt: new Date(),
        },
      });
    }
  } else {
    const singles = profile.payments.filter(
      (p) =>
        (p.status === 'VERIFIED' || p.status === 'PENDING') &&
        monthsCovered(p).length === 1 &&
        monthsCovered(p)[0] === numericMonth
    );
    for (const row of singles) {
      await prisma.payment.update({ where: { id: row.id }, data: { status: 'REJECTED' } });
    }
  }

  await prisma.paymentStatusLog.create({
    data: {
      studentId: profile.id,
      academicYear: profile.academicYear,
      month: numericMonth,
      fromStatus,
      toStatus: status,
      note: note?.trim() || null,
      actorId: req.user.id,
    },
  });

  const refreshed = await prisma.studentProfile.findUnique({
    where: { id: profile.id },
    include: { payments: true },
  });
  res.json({
    months: buildTuitionMonths(year, refreshed?.payments ?? []),
  });
}

export async function getStudentTuition(req: Request, res: Response): Promise<void> {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: req.params.studentId },
    include: {
      user: { select: { name: true } },
      payments: true,
      statusLogs: { orderBy: { createdAt: 'desc' }, take: 40, include: { actor: { select: { name: true } } } },
    },
  });
  if (!profile) {
    res.status(404).json({ message: 'Student not found' });
    return;
  }
  const year = academicYearNumber(profile.academicYear);
  res.json({
    studentName: profile.user.name,
    studentIdNumber: profile.studentIdNumber,
    academicYear: profile.academicYear,
    months: buildTuitionMonths(year, profile.payments),
    logs: profile.statusLogs.map((row) => ({
      _id: row.id,
      studentId: row.studentId,
      academicYear: row.academicYear,
      month: row.month,
      fromStatus: row.fromStatus,
      toStatus: row.toStatus,
      note: row.note ?? undefined,
      actorId: row.actorId,
      actorName: row.actor.name,
      createdAt: row.createdAt.toISOString(),
    })),
  });
}

export async function getPaymentStatus(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const payment = await prisma.payment.findUnique({
    where: { id: req.params.id },
    include: paymentInclude,
  });
  if (!payment) {
    res.status(404).json({ message: 'Payment not found' });
    return;
  }
  const office = req.user.role === 'DIRECTOR' || req.user.role === 'IT_ADMIN' || req.user.role === 'MANAGER';
  if (req.user.role === 'PARENT' && payment.parentId !== req.user.id) {
    res.status(403).json({ message: 'You can only view your own payments.' });
    return;
  }
  if (!office && req.user.role !== 'PARENT') {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  res.json({
    payment: toListItem(payment),
    mode: env.paymentsMode,
  });
}
