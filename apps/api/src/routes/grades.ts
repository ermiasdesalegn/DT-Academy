import { Router } from 'express';
import {
  approveSheet,
  getOrCreateSheet,
  getSheetForDirector,
  inquireSheet,
  listMySheets,
  listSheetQueue,
  resolveInquiry,
  returnSheet,
  submitSheet,
  updateSheetResults,
} from '../controllers/gradeController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export const gradesRouter = Router();

gradesRouter.get('/mine', authMiddleware, requireRole(['TEACHER']), asyncHandler(listMySheets));
gradesRouter.get(
  '/courses/:courseId',
  authMiddleware,
  requireRole(['TEACHER']),
  asyncHandler(getOrCreateSheet)
);
gradesRouter.put(
  '/sheets/:id/results',
  authMiddleware,
  requireRole(['TEACHER']),
  asyncHandler(updateSheetResults)
);
gradesRouter.post(
  '/sheets/:id/submit',
  authMiddleware,
  requireRole(['TEACHER']),
  asyncHandler(submitSheet)
);
gradesRouter.post(
  '/sheets/:id/inquire',
  authMiddleware,
  requireRole(['TEACHER']),
  asyncHandler(inquireSheet)
);
gradesRouter.get('/queue', authMiddleware, requireRole(['DIRECTOR']), asyncHandler(listSheetQueue));
gradesRouter.get(
  '/sheets/:id',
  authMiddleware,
  requireRole(['DIRECTOR']),
  asyncHandler(getSheetForDirector)
);
gradesRouter.post(
  '/sheets/:id/approve',
  authMiddleware,
  requireRole(['DIRECTOR']),
  asyncHandler(approveSheet)
);
gradesRouter.post(
  '/sheets/:id/return',
  authMiddleware,
  requireRole(['DIRECTOR']),
  asyncHandler(returnSheet)
);
gradesRouter.post(
  '/inquiries/:id/resolve',
  authMiddleware,
  requireRole(['DIRECTOR']),
  asyncHandler(resolveInquiry)
);
