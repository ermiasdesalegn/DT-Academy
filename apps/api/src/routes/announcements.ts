import { Router } from 'express';
import { createAnnouncement, listAnnouncements } from '../controllers/announcementController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export const announcementsRouter = Router();

announcementsRouter.get(
  '/',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'MANAGER', 'TEACHER', 'PARENT', 'STUDENT']),
  asyncHandler(listAnnouncements)
);
announcementsRouter.post(
  '/',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'MANAGER']),
  asyncHandler(createAnnouncement)
);
