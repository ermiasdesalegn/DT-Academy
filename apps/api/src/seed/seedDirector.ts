import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { User } from '../models';

export async function seedDirector(): Promise<void> {
  const existing = await User.findOne({ role: 'DIRECTOR' });
  if (existing) return;

  const passwordHash = await bcrypt.hash(env.seedAdminPassword, 12);
  await User.create({
    name: env.seedAdminName,
    email: env.seedAdminEmail.toLowerCase(),
    passwordHash,
    role: 'DIRECTOR',
    isActive: true,
  });

  console.log(`Seeded DIRECTOR account (${env.seedAdminEmail})`);
}
