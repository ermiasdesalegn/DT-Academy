import mongoose, { Document, Schema, Types } from 'mongoose';
import type { GradeSheetStatus } from '@dt-academy/types';

export const GRADE_SHEET_STATUSES: GradeSheetStatus[] = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'UNLOCK_REQUESTED',
];

export interface GradeSheetDocument extends Document {
  courseId: Types.ObjectId;
  teacherId: Types.ObjectId;
  academicYear: string;
  term: number;
  status: GradeSheetStatus;
  submittedAt?: Date;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
}

const gradeSheetSchema = new Schema<GradeSheetDocument>({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  academicYear: { type: String, required: true, trim: true },
  term: { type: Number, required: true, min: 1, max: 3 },
  status: {
    type: String,
    enum: GRADE_SHEET_STATUSES,
    default: 'DRAFT',
  },
  submittedAt: { type: Date },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
});

gradeSheetSchema.index({ courseId: 1, term: 1, academicYear: 1 }, { unique: true });

export const GradeSheet = mongoose.model<GradeSheetDocument>('GradeSheet', gradeSheetSchema);
