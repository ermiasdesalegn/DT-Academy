import type { Request, Response } from 'express';
import { isObjectStorageConfigured, putUpload } from '../lib/objectStorage';

export async function resolveUploadUrl(file: Express.Multer.File): Promise<string> {
  if (isObjectStorageConfigured() && file.buffer) {
    return putUpload(file.filename, file.buffer, file.mimetype || 'application/octet-stream');
  }
  return `/api/uploads/${file.filename}`;
}

export async function handleUploadResponse(
  req: Request,
  res: Response,
  missingMessage: string,
  status = 200
): Promise<void> {
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: missingMessage });
    return;
  }
  try {
    const url = await resolveUploadUrl(file);
    res.status(status).json({ url, durable: isObjectStorageConfigured() });
  } catch {
    res.status(500).json({ message: 'Could not store the upload.' });
  }
}
