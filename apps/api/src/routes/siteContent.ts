import { Router } from 'express';
import { getSiteContent, updateSiteContent } from '../controllers/siteContentController';
import { authMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export const siteContentRouter = Router();

siteContentRouter.get('/', asyncHandler(getSiteContent));
siteContentRouter.put(
  '/',
  authMiddleware,
  requireRole(['DIRECTOR', 'IT_ADMIN']),
  asyncHandler(updateSiteContent)
);
