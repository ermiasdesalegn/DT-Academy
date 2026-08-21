import mongoose, { Document, Schema, Types } from 'mongoose';

export interface StudentProfileDocument extends Document {
  userId: Types.ObjectId;
  studentIdNumber: string;
  parentId: Types.ObjectId;
  gradeLevel: number;
  section: string;
  academicYear: string;
  isActive: boolean;
}

const studentProfileSchema = new Schema<StudentProfileDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  studentIdNumber: { type: String, required: true, unique: true, trim: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  gradeLevel: { type: Number, required: true, min: 1, max: 8 },
  section: { type: String, required: true, trim: true, uppercase: true },
  academicYear: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: false },
});

export const StudentProfile = mongoose.model<StudentProfileDocument>(
  'StudentProfile',
  studentProfileSchema
);
