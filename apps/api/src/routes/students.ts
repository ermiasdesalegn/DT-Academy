import { Router } from 'express';
import { admitStudent } from '../controllers/admitController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export const studentsRouter = Router();

studentsRouter.post(
  '/admit',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'MANAGER']),
  asyncHandler(admitStudent)
);
