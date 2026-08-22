import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';

export async function seedDirector(): Promise<void> {
  const existing = await prisma.user.findFirst({ where: { role: 'DIRECTOR' } });
  if (existing) return;

  const passwordHash = await bcrypt.hash(env.seedAdminPassword, 12);
  await prisma.user.create({
    data: {
      name: env.seedAdminName,
      email: env.seedAdminEmail.toLowerCase(),
      passwordHash,
      role: 'DIRECTOR',
      isActive: true,
    },
  });

  console.log(`Seeded DIRECTOR account (${env.seedAdminEmail})`);
}
