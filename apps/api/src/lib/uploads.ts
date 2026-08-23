import fs from 'node:fs';
import path from 'node:path';

export const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

export function ensureUploadDir(): void {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
