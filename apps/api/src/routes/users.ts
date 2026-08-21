import { Router } from 'express';
import { listUsers } from '../controllers/userController';
import { authMiddleware, requireRole } from '../middleware/auth';

export const usersRouter = Router();

usersRouter.get(
  '/',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'MANAGER']),
  listUsers
);
