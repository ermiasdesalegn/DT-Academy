import type { Request, Response } from 'express';
import { sendContactEmail } from '../lib/mail';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function clientKey(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) return forwarded.split(',')[0]!.trim();
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function allow(ip: string): boolean {
  const now = Date.now();
  const prev = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (prev.length >= MAX_PER_WINDOW) {
    hits.set(ip, prev);
    return false;
  }
  prev.push(now);
  hits.set(ip, prev);
  return true;
}

function parseBody(body: unknown): { name: string; phone: string; message: string; email?: string } | null {
  if (!body || typeof body !== 'object') return null;
  const src = body as Record<string, unknown>;
  const name = typeof src.name === 'string' ? src.name.trim() : '';
  const phone = typeof src.phone === 'string' ? src.phone.trim() : '';
  const message = typeof src.message === 'string' ? src.message.trim() : '';
  const emailRaw = typeof src.email === 'string' ? src.email.trim() : '';
  if (name.length < 2 || name.length > 120) return null;
  if (phone.length < 6 || phone.length > 40) return null;
  if (message.length < 8 || message.length > 4000) return null;
  if (emailRaw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) return null;
  return { name, phone, message, ...(emailRaw ? { email: emailRaw } : {}) };
}

export async function submitContact(req: Request, res: Response): Promise<void> {
  if (!allow(clientKey(req))) {
    res.status(429).json({ message: 'Too many messages. Wait a few minutes or call the office.' });
    return;
  }
  const parsed = parseBody(req.body);
  if (!parsed) {
    res.status(400).json({ message: 'Enter your name, a working phone, and a short message.' });
    return;
  }
  const result = await sendContactEmail(parsed);
  if (!result.ok) {
    res.status(result.status).json({ message: result.message });
    return;
  }
  res.json({ ok: true });
}
