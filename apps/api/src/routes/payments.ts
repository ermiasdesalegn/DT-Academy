import { Router } from 'express';
import {
  createOutstandingPayment,
  createPayment,
  getPaymentStatus,
  getStudentTuition,
  listPayments,
  rejectPayment,
  setTuitionMonthStatus,
  verifyPayment,
} from '../controllers/paymentController';
import { mpesaWebhook, mockCompletePayment, telebirrWebhook } from '../payments/webhooks';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export const paymentsRouter = Router();

const office = ['DIRECTOR', 'IT_ADMIN', 'MANAGER'] as const;
const ledger = ['DIRECTOR', 'IT_ADMIN'] as const;
const familyOrOffice = ['DIRECTOR', 'IT_ADMIN', 'MANAGER', 'PARENT'] as const;

paymentsRouter.post('/webhooks/telebirr', asyncHandler(telebirrWebhook));
paymentsRouter.post('/webhooks/mpesa', asyncHandler(mpesaWebhook));

paymentsRouter.get('/', authMiddleware, requireRole([...office]), asyncHandler(listPayments));
paymentsRouter.post(
  '/',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'MANAGER', 'PARENT']),
  asyncHandler(createPayment)
);
paymentsRouter.post(
  '/outstanding',
  authMiddleware,
  requireRole([...familyOrOffice]),
  asyncHandler(createOutstandingPayment)
);
paymentsRouter.post(
  '/mock/complete',
  authMiddleware,
  requireRole([...familyOrOffice]),
  asyncHandler(mockCompletePayment)
);
paymentsRouter.post('/months', authMiddleware, requireRole([...ledger]), asyncHandler(setTuitionMonthStatus));
paymentsRouter.get(
  '/student/:studentId/tuition',
  authMiddleware,
  requireRole([...ledger]),
  asyncHandler(getStudentTuition)
);
paymentsRouter.get('/:id/status', authMiddleware, requireRole([...familyOrOffice]), asyncHandler(getPaymentStatus));
paymentsRouter.post('/:id/verify', authMiddleware, requireRole([...office]), asyncHandler(verifyPayment));
paymentsRouter.post('/:id/reject', authMiddleware, requireRole([...office]), asyncHandler(rejectPayment));
