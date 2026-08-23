import type { Request, Response } from 'express';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { parseMpesaNotify } from './mpesa';
import { parseTelebirrNotify } from './telebirr';
import { findPaymentByProviderRef, markPaymentVerified } from './settle';

export async function telebirrWebhook(req: Request, res: Response): Promise<void> {
  const parsed = parseTelebirrNotify(req.body);
  if (parsed) {
    const row = await findPaymentByProviderRef(parsed.merchOrderId);
    if (row) {
      if (parsed.paid) {
        await markPaymentVerified(row.id, { providerRef: parsed.transId ?? parsed.merchOrderId });
      } else if (row.status === 'PENDING') {
        await prisma.payment.update({ where: { id: row.id }, data: { status: 'REJECTED' } });
      }
    }
  }
  res.status(200).json({ code: '0', msg: 'success' });
}

export async function mpesaWebhook(req: Request, res: Response): Promise<void> {
  const parsed = parseMpesaNotify(req.body);
  if (parsed) {
    const ref = parsed.checkoutRequestId ?? parsed.accountRef ?? parsed.transId ?? '';
    const row = await findPaymentByProviderRef(ref);
    if (row) {
      if (parsed.paid) {
        await markPaymentVerified(row.id, { providerRef: parsed.transId ?? parsed.checkoutRequestId });
      } else if (row.status === 'PENDING') {
        await prisma.payment.update({ where: { id: row.id }, data: { status: 'REJECTED' } });
      }
    }
  }
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
}

export async function mockCompletePayment(req: Request, res: Response): Promise<void> {
  if (env.paymentsMode !== 'mock') {
    res.status(403).json({ message: 'Mock completion is disabled when PAYMENTS_MODE is sandbox.' });
    return;
  }
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const paymentId = typeof req.body?.paymentId === 'string' ? req.body.paymentId : req.body?.payment;
  if (!paymentId) {
    res.status(400).json({ message: 'paymentId is required' });
    return;
  }
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    res.status(404).json({ message: 'Payment not found' });
    return;
  }
  if (req.user.role === 'PARENT' && payment.parentId !== req.user.id) {
    res.status(403).json({ message: 'You can only complete your own test payment.' });
    return;
  }
  const result = await markPaymentVerified(payment.id, {
    providerRef: payment.providerRef ?? `MOCK-${payment.id}`,
    verifiedById: req.user.id,
  });
  if (!result.ok) {
    res.status(409).json({ message: 'This payment cannot be completed.' });
    return;
  }
  res.json({ ok: true, already: result.already ?? false });
}
