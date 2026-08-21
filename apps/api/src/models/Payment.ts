import mongoose, { Document, Schema, Types } from 'mongoose';
import type { PaymentMethod, PaymentStatus } from '@dt-academy/types';

export const PAYMENT_METHODS: PaymentMethod[] = [
  'CASH',
  'BANK_TRANSFER',
  'TELEBIRR',
  'MPESA',
];

export const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'VERIFIED', 'REJECTED'];

export interface PaymentDocument extends Document {
  parentId: Types.ObjectId;
  studentId: Types.ObjectId;
  academicYear: string;
  term: number;
  amount: number;
  currency: string;
  method: PaymentMethod;
  referencePNR: string;
  receiptUrl?: string;
  status: PaymentStatus;
  verifiedBy?: Types.ObjectId;
  verifiedAt?: Date;
}

const paymentSchema = new Schema<PaymentDocument>(
  {
    parentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    academicYear: { type: String, required: true, trim: true },
    term: { type: Number, required: true, min: 1, max: 3 },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'ETB' },
    method: { type: String, enum: PAYMENT_METHODS, required: true },
    referencePNR: { type: String, required: true, trim: true },
    receiptUrl: { type: String, trim: true },
    status: { type: String, enum: PAYMENT_STATUSES, default: 'PENDING' },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<PaymentDocument>('Payment', paymentSchema);
