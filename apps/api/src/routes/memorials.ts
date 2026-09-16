import { Router } from 'express';
import {
  createMemorial,
  deleteMemorial,
  listMemorials,
  uploadMemorialMedia,
} from '../controllers/memorialController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { memorialMediaUpload } from '../middleware/memorialMediaUpload';

export const memorialsRouter = Router();

memorialsRouter.get(
  '/',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'MANAGER', 'TEACHER', 'PARENT', 'STUDENT']),
  asyncHandler(listMemorials)
);

memorialsRouter.post(
  '/',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'MANAGER']),
  asyncHandler(createMemorial)
);

memorialsRouter.post(
  '/upload',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'MANAGER']),
  memorialMediaUpload,
  asyncHandler(uploadMemorialMedia)
);

memorialsRouter.delete(
  '/:id',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'MANAGER']),
  asyncHandler(deleteMemorial)
);
