import mongoose, { Document, Schema, Types } from 'mongoose';
import type { AnnouncementAudience } from '@dt-academy/types';

export const ANNOUNCEMENT_AUDIENCES: AnnouncementAudience[] = [
  'ALL',
  'PARENTS',
  'TEACHERS',
  'STUDENTS',
];

export interface AnnouncementDocument extends Document {
  title: string;
  content: string;
  audience: AnnouncementAudience;
  authorId: Types.ObjectId;
  gradeLevel?: number;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<AnnouncementDocument>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    audience: { type: String, enum: ANNOUNCEMENT_AUDIENCES, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gradeLevel: { type: Number, min: 1, max: 8 },
  },
  { timestamps: true }
);

export const Announcement = mongoose.model<AnnouncementDocument>(
  'Announcement',
  announcementSchema
);
