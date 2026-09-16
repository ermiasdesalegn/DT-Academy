import path from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ensureUploadDir, UPLOAD_DIR } from '../lib/uploads';
import { isObjectStorageConfigured } from '../lib/objectStorage';

const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function makeFilename(file: Express.Multer.File): string {
  const ext = path.extname(file.originalname).toLowerCase();
  const safe = ALLOWED.has(ext) ? ext : '.jpg';
  return `site-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safe}`;
}

const disk = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    cb(null, makeFilename(file));
  },
});

const memory = multer.memoryStorage();

function buildUpload() {
  return multer({
    storage: isObjectStorageConfigured() ? memory : disk,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!/^image\/(jpeg|pjpeg|png|webp|gif)$/.test(file.mimetype)) {
        cb(new Error('Choose a JPEG, PNG, WebP, or GIF image.'));
        return;
      }
      cb(null, true);
    },
  });
}

export function siteImageUpload(req: Request, res: Response, next: NextFunction): void {
  buildUpload().single('file')(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : 'Upload failed.';
      res.status(400).json({ message });
      return;
    }
    if (req.file && !req.file.filename) {
      req.file.filename = makeFilename(req.file);
    }
    next();
  });
}
