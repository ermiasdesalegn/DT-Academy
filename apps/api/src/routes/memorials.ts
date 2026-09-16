import { Router } from 'express';
import {
  createMemorial,
  deleteMemorial,
  listMemorials,
  updateMemorial,
  uploadMemorialMedia,
} from '../controllers/memorialController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { memorialMediaUpload } from '../middleware/memorialMediaUpload';

export const memorialsRouter = Router();

const writers = ['DIRECTOR', 'IT_ADMIN', 'MANAGER', 'TEACHER'] as const;
const deleters = ['DIRECTOR', 'IT_ADMIN', 'MANAGER'] as const;

memorialsRouter.get(
  '/',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'MANAGER', 'TEACHER', 'PARENT', 'STUDENT']),
  asyncHandler(listMemorials)
);

memorialsRouter.post('/', authMiddleware, requireRole([...writers]), asyncHandler(createMemorial));

memorialsRouter.post(
  '/upload',
  authMiddleware,
  requireRole([...writers]),
  memorialMediaUpload,
  asyncHandler(uploadMemorialMedia)
);

memorialsRouter.put('/:id', authMiddleware, requireRole([...writers]), asyncHandler(updateMemorial));

memorialsRouter.delete(
  '/:id',
  authMiddleware,
  requireRole([...deleters]),
  asyncHandler(deleteMemorial)
);
