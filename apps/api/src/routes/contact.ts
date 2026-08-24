import { Router } from 'express';
import { submitContact } from '../controllers/contactController';
import { asyncHandler } from '../middleware/asyncHandler';

export const contactRouter = Router();

contactRouter.post('/', asyncHandler(submitContact));
