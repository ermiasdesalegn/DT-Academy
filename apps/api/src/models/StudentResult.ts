import mongoose, { Document, Schema, Types } from 'mongoose';

export interface StudentResultDocument extends Document {
  gradeSheetId: Types.ObjectId;
  studentId: Types.ObjectId;
  testScore: number;
  quizScore: number;
  finalExamScore: number;
  totalScore: number;
  letterGrade: string;
  behavioralRemark?: string;
}

const studentResultSchema = new Schema<StudentResultDocument>({
  gradeSheetId: { type: Schema.Types.ObjectId, ref: 'GradeSheet', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  testScore: { type: Number, required: true, min: 0, default: 0 },
  quizScore: { type: Number, required: true, min: 0, default: 0 },
  finalExamScore: { type: Number, required: true, min: 0, default: 0 },
  totalScore: { type: Number, required: true, min: 0, default: 0 },
  letterGrade: { type: String, required: true, default: 'N/A' },
  behavioralRemark: { type: String, trim: true },
});

studentResultSchema.index({ gradeSheetId: 1, studentId: 1 }, { unique: true });

export const StudentResult = mongoose.model<StudentResultDocument>(
  'StudentResult',
  studentResultSchema
);
