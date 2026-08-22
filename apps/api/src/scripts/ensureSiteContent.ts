import '../config/env';
import { ensureSiteContentTable } from '../lib/ensureSiteContent';
import { prisma } from '../lib/prisma';

ensureSiteContentTable()
  .then(() => {
    console.log('SiteContent table is ready');
  })
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
