import mongoose, { Document, Schema } from 'mongoose';
import type { UserRole } from '@dt-academy/types';

export const USER_ROLES: UserRole[] = [
  'DIRECTOR',
  'IT_ADMIN',
  'MANAGER',
  'TEACHER',
  'PARENT',
  'STUDENT',
];

export interface UserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    role: { type: String, enum: USER_ROLES, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDocument>('User', userSchema);
