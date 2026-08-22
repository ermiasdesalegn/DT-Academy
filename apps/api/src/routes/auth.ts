import { Router } from 'express';
import { login, me, register } from '../controllers/authController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export const authRouter = Router();

authRouter.post(
  '/register',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'MANAGER']),
  asyncHandler(register)
);
authRouter.post('/login', asyncHandler(login));
authRouter.get('/me', authMiddleware, asyncHandler(me));
