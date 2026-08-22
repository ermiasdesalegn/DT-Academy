import { Router } from 'express';
import { listMyChildren } from '../controllers/familyController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export const familyRouter = Router();

familyRouter.get(
  '/children',
  authMiddleware,
  requireRole(['PARENT']),
  asyncHandler(listMyChildren)
);
