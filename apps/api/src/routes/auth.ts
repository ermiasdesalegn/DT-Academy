import { Router } from 'express';
import { login, me, register } from '../controllers/authController';
import { authMiddleware, requireRole } from '../middleware/auth';

export const authRouter = Router();

authRouter.post(
  '/register',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'MANAGER']),
  register
);
authRouter.post('/login', login);
authRouter.get('/me', authMiddleware, me);
