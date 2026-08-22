import '../config/env';
import { ensurePaymentMonthColumn } from '../lib/ensureSiteContent';
import { prisma } from '../lib/prisma';

ensurePaymentMonthColumn()
  .then(() => console.log('Payment.month column is ready'))
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
