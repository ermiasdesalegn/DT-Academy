import { Router } from 'express';
import { getSiteContent, updateSiteContent, uploadSiteImage } from '../controllers/siteContentController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { siteImageUpload } from '../middleware/siteImageUpload';

export const siteContentRouter = Router();

siteContentRouter.get('/', asyncHandler(getSiteContent));
siteContentRouter.put(
  '/',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN']),
  asyncHandler(updateSiteContent)
);
siteContentRouter.post(
  '/upload',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN']),
  siteImageUpload,
  asyncHandler(uploadSiteImage)
);
