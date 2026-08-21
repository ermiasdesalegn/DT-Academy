import mongoose, { Document, Schema, Types } from 'mongoose';
import type { InquiryStatus } from '@dt-academy/types';

export const INQUIRY_STATUSES: InquiryStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

export interface InquiryDocument extends Document {
  gradeSheetId: Types.ObjectId;
  teacherId: Types.ObjectId;
  reason: string;
  status: InquiryStatus;
  resolvedBy?: Types.ObjectId;
}

const inquirySchema = new Schema<InquiryDocument>(
  {
    gradeSheetId: { type: Schema.Types.ObjectId, ref: 'GradeSheet', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: INQUIRY_STATUSES, default: 'PENDING' },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Inquiry = mongoose.model<InquiryDocument>('Inquiry', inquirySchema);
