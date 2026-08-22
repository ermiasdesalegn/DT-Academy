import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { connectDb } from './config/db';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { studentsRouter } from './routes/students';
import { seedDirector } from './seed/seedDirector';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/students', studentsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Server error. Try again in a moment.' });
});

async function start(): Promise<void> {
  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });

  const ok = await connectDb();
  if (ok) {
    await seedDirector().catch((err) => console.warn('Seed skipped', err));
  } else {
    console.warn('API is up, but Postgres is still unreachable. Login will retry when Neon wakes.');
  }
}

start().catch((err) => {
  console.error('Failed to start API', err);
  process.exit(1);
});
