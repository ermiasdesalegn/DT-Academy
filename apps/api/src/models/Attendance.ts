import mongoose, { Document, Schema, Types } from 'mongoose';
import type { AttendanceStatus } from '@dt-academy/types';

export const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  'PRESENT',
  'ABSENT',
  'LATE',
  'EXCUSED',
];

export interface AttendanceDocument extends Document {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  recordedBy: Types.ObjectId;
}

const attendanceSchema = new Schema<AttendanceDocument>({
  studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ATTENDANCE_STATUSES, required: true },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

attendanceSchema.index({ studentId: 1, courseId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model<AttendanceDocument>('Attendance', attendanceSchema);
