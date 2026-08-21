import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { ILoginRequest, IRegisterRequest, UserRole } from '@dt-academy/types';
import { USER_ROLES, User } from '../models';
import { env } from '../config/env';
import { toAuthUser } from '../utils/toAuthUser';

const REGISTER_ALLOWED: UserRole[] = ['DIRECTOR', 'IT_ADMIN', 'MANAGER'];

function signToken(id: string, role: UserRole): string {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign({ id, role }, env.jwtSecret, options);
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, role, phone } = req.body as IRegisterRequest;

  if (!name || !email || !password || !role) {
    res.status(400).json({ message: 'name, email, password, and role are required' });
    return;
  }

  if (!USER_ROLES.includes(role)) {
    res.status(400).json({ message: 'Invalid role' });
    return;
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409).json({ message: 'Email already registered' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    phone,
    isActive: true,
  });

  res.status(201).json({ user: toAuthUser(user) });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as ILoginRequest;

  if (!email || !password) {
    res.status(400).json({ message: 'email and password are required' });
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ message: 'Account is inactive' });
    return;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const token = signToken(user._id.toString(), user.role);
  res.json({ token, user: toAuthUser(user) });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json({ user: toAuthUser(user) });
}

export { REGISTER_ALLOWED };
