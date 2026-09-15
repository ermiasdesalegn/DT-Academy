import { Router } from 'express';
import {
  getUserHistory,
  listUsers,
  markUserFormer,
  restoreUser,
  setUserPassword,
} from '../controllers/userController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export const usersRouter = Router();

const office = ['DIRECTOR', 'IT_ADMIN', 'MANAGER'] as const;

usersRouter.get('/', authMiddleware, requireRole([...office]), asyncHandler(listUsers));

usersRouter.get('/:id/history', authMiddleware, requireRole([...office]), asyncHandler(getUserHistory));

usersRouter.post('/:id/mark-former', authMiddleware, requireRole([...office]), asyncHandler(markUserFormer));

usersRouter.post('/:id/restore', authMiddleware, requireRole([...office]), asyncHandler(restoreUser));

usersRouter.post('/:id/password', authMiddleware, requireRole([...office]), asyncHandler(setUserPassword));
