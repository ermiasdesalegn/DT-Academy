import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/dt-academy',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL ?? 'director@dt-academy.local',
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMeNow!',
  seedAdminName: process.env.SEED_ADMIN_NAME ?? 'Academy Director',
};
