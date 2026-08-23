import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createPrisma> };

function isRetryable(err: unknown): boolean {
  const code = err && typeof err === 'object' && 'code' in err ? String((err as { code: unknown }).code) : '';
  if (code === 'P1017' || code === 'P1001' || code === 'P2024') return true;
  const message = err instanceof Error ? err.message : String(err);
  if (/57P01/.test(message)) return true;
  return /closed|connection pool|can't reach|timed out fetching|engine is not yet connected|administrator command/i.test(
    message,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createPrisma() {
  const client = new PrismaClient({
    log: ['error'],
  });

  return client.$extends({
    query: {
      async $allOperations({ args, query }) {
        let lastError: unknown;
        for (let attempt = 0; attempt < 4; attempt++) {
          try {
            return await query(args);
          } catch (err) {
            lastError = err;
            if (!isRetryable(err) || attempt === 3) throw err;
            // Do not $disconnect the shared client — that drops the engine for every
            // in-flight request and surfaces as "Engine is not yet connected".
            await sleep(500 * (attempt + 1));
            await client.$connect().catch(() => undefined);
          }
        }
        throw lastError;
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
