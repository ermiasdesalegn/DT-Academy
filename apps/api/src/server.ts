import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { connectDb } from './config/db';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { studentsRouter } from './routes/students';
import { paymentsRouter } from './routes/payments';
import { insightsRouter } from './routes/insights';
import { familyRouter } from './routes/family';
import { siteContentRouter } from './routes/siteContent';
import { classesRouter } from './routes/classes';
import { gradesRouter } from './routes/grades';
import { attendanceRouter } from './routes/attendance';
import { announcementsRouter } from './routes/announcements';
import { contactRouter } from './routes/contact';
import { seedDirector } from './seed/seedDirector';
import { ensurePaymentMonthColumn, ensureSiteContentTable } from './lib/ensureSiteContent';
import { ensureUploadDir, UPLOAD_DIR } from './lib/uploads';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/students', studentsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/family', familyRouter);
app.use('/api/classes', classesRouter);
app.use('/api/grades', gradesRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/site-content', siteContentRouter);
app.use('/api/contact', contactRouter);
app.use('/api/uploads', express.static(UPLOAD_DIR));

const webDist = path.resolve(__dirname, '../../web/dist');
if (fs.existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      next();
      return;
    }
    res.sendFile(path.join(webDist, 'index.html'));
  });
}

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Server error. Try again in a moment.' });
});

async function start(): Promise<void> {
  ensureUploadDir();
  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });

  const ok = await connectDb();
  if (ok) {
    await seedDirector().catch((err: unknown) => console.warn('Seed skipped', err));
    await ensureSiteContentTable().catch((err: unknown) => console.warn('Site content table skipped', err));
    await ensurePaymentMonthColumn().catch((err: unknown) => console.warn('Payment month column skipped', err));
  } else {
    console.warn('API is up, but Postgres is still unreachable. Login will retry when Neon wakes.');
  }
}

start().catch((err) => {
  console.error('Failed to start API', err);
  process.exit(1);
});
