import { Router } from 'express';
import { listUsers, setUserPassword } from '../controllers/userController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export const usersRouter = Router();

usersRouter.get(
  '/',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'MANAGER']),
  asyncHandler(listUsers)
);

usersRouter.post(
  '/:id/password',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'MANAGER']),
  asyncHandler(setUserPassword)
);
