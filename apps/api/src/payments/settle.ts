import { prisma } from '../lib/prisma';

export async function markPaymentVerified(
  paymentId: string,
  opts?: { providerRef?: string; verifiedById?: string | null }
): Promise<{ ok: true; already?: boolean } | { ok: false; reason: string }> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return { ok: false, reason: 'not_found' };
  if (payment.status === 'VERIFIED') {
    if (opts?.providerRef && !payment.providerRef) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { providerRef: opts.providerRef },
      });
    }
    return { ok: true, already: true };
  }
  if (payment.status !== 'PENDING') return { ok: false, reason: 'not_pending' };

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedById: opts?.verifiedById ?? undefined,
        providerRef: opts?.providerRef ?? payment.providerRef,
      },
    });
    await tx.studentProfile.update({
      where: { id: payment.studentId },
      data: { isActive: true },
    });
  });

  return { ok: true };
}

export async function findPaymentByProviderRef(ref: string) {
  if (!ref.trim()) return null;
  return prisma.payment.findFirst({
    where: {
      OR: [{ id: ref }, { providerRef: ref }, { referencePNR: ref }],
    },
  });
}
