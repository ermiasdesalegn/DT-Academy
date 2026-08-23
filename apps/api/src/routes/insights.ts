import { Router } from 'express';
import { getInsights } from '../controllers/insightsController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export const insightsRouter = Router();

insightsRouter.get(
  '/',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'MANAGER']),
  asyncHandler(getInsights)
);
