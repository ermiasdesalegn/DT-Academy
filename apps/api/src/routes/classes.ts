import { Router } from 'express';
import {
  applyClassCourseTemplate,
  getClassOverall,
  getTeachingHome,
  listClassCourses,
  listClasses,
  setHomeroom,
  upsertClassCourse,
} from '../controllers/classController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export const classesRouter = Router();

classesRouter.get(
  '/',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'MANAGER']),
  asyncHandler(listClasses)
);
classesRouter.put(
  '/homeroom',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN']),
  asyncHandler(setHomeroom)
);
classesRouter.get(
  '/courses',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN']),
  asyncHandler(listClassCourses)
);
classesRouter.put(
  '/courses',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN']),
  asyncHandler(upsertClassCourse)
);
classesRouter.post(
  '/courses/apply-template',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN']),
  asyncHandler(applyClassCourseTemplate)
);
classesRouter.get(
  '/overall',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN', 'TEACHER']),
  asyncHandler(getClassOverall)
);
classesRouter.get('/teaching/me', authMiddleware, requireRole(['TEACHER']), asyncHandler(getTeachingHome));
