import { prisma } from '../lib/prisma';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectDb(): Promise<boolean> {
  const waits = [0, 3000, 6000, 10000];
  for (let i = 0; i < waits.length; i++) {
    if (waits[i]) await sleep(waits[i]);
    try {
      await prisma.$connect();
      console.log('PostgreSQL connected');
      return true;
    } catch (err) {
      console.warn(`Neon not ready (attempt ${i + 1}/${waits.length}). Open the project in the Neon console to wake it.`);
      console.warn(err instanceof Error ? err.message : err);
    }
  }
  return false;
}
