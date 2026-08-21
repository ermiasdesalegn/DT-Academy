import mongoose, { Document, Schema, Types } from 'mongoose';

export interface CourseDocument extends Document {
  name: string;
  code: string;
  gradeLevel: number;
  section: string;
  teacherId: Types.ObjectId;
  academicYear: string;
}

const courseSchema = new Schema<CourseDocument>({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, uppercase: true },
  gradeLevel: { type: Number, required: true, min: 1, max: 8 },
  section: { type: String, required: true, trim: true, uppercase: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  academicYear: { type: String, required: true, trim: true },
});

courseSchema.index({ code: 1, academicYear: 1, gradeLevel: 1, section: 1 }, { unique: true });

export const Course = mongoose.model<CourseDocument>('Course', courseSchema);
