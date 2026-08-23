import { Router } from 'express';
import { getAttendanceDay, saveAttendanceDay } from '../controllers/attendanceController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export const attendanceRouter = Router();

attendanceRouter.get(
  '/',
  authMiddleware,
  requireRole(['TEACHER', 'DIRECTOR', 'IT_ADMIN', 'MANAGER']),
  asyncHandler(getAttendanceDay)
);
attendanceRouter.put('/', authMiddleware, requireRole(['TEACHER']), asyncHandler(saveAttendanceDay));
