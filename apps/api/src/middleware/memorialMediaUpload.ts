import path from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ensureUploadDir, UPLOAD_DIR } from '../lib/uploads';

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const VIDEO_EXT = new Set(['.mp4', '.webm', '.mov']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = IMAGE_EXT.has(ext) || VIDEO_EXT.has(ext) ? ext : '.bin';
    cb(null, `memorial-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 40 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const okImage = /^image\/(jpeg|pjpeg|png|webp|gif)$/.test(file.mimetype);
    const okVideo = /^video\/(mp4|webm|quicktime)$/.test(file.mimetype);
    if (!okImage && !okVideo) {
      cb(new Error('Choose a JPEG, PNG, WebP, GIF, MP4, WebM, or MOV file.'));
      return;
    }
    cb(null, true);
  },
});

export function memorialMediaUpload(req: Request, res: Response, next: NextFunction): void {
  upload.single('file')(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : 'Upload failed.';
      res.status(400).json({ message });
      return;
    }
    next();
  });
}
