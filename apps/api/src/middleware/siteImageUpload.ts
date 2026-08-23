import path from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ensureUploadDir, UPLOAD_DIR } from '../lib/uploads';

const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = ALLOWED.has(ext) ? ext : '.jpg';
    cb(null, `site-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(jpeg|pjpeg|png|webp|gif)$/.test(file.mimetype)) {
      cb(new Error('Choose a JPEG, PNG, WebP, or GIF image.'));
      return;
    }
    cb(null, true);
  },
});

export function siteImageUpload(req: Request, res: Response, next: NextFunction): void {
  upload.single('file')(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : 'Upload failed.';
      res.status(400).json({ message });
      return;
    }
    next();
  });
}
