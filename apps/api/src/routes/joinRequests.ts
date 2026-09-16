import { Router } from 'express';
import {
  approveJoinRequest,
  listJoinRequests,
  rejectJoinRequest,
  submitJoinRequest,
} from '../controllers/joinRequestController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export const joinRequestsRouter = Router();

joinRequestsRouter.post('/', asyncHandler(submitJoinRequest));

joinRequestsRouter.get(
  '/',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'MANAGER']),
  asyncHandler(listJoinRequests)
);

joinRequestsRouter.post(
  '/:id/approve',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'MANAGER']),
  asyncHandler(approveJoinRequest)
);

joinRequestsRouter.post(
  '/:id/reject',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'MANAGER']),
  asyncHandler(rejectJoinRequest)
);
