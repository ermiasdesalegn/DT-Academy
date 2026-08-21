export type UserRole =
  | 'DIRECTOR'
  | 'IT_ADMIN'
  | 'MANAGER'
  | 'TEACHER'
  | 'PARENT'
  | 'STUDENT';

export type GradeSheetStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'UNLOCK_REQUESTED';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'TELEBIRR' | 'MPESA';

export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type InquiryStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type AnnouncementAudience = 'ALL' | 'PARENTS' | 'TEACHERS' | 'STUDENTS';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentProfile {
  _id: string;
  userId: string;
  studentIdNumber: string;
  parentId: string;
  gradeLevel: number;
  section: string;
  academicYear: string;
  isActive: boolean;
}

export interface ICourse {
  _id: string;
  name: string;
  code: string;
  gradeLevel: number;
  section: string;
  teacherId: string;
  academicYear: string;
}

export interface IGradeSheet {
  _id: string;
  courseId: string;
  teacherId: string;
  academicYear: string;
  term: number;
  status: GradeSheetStatus;
  submittedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface IStudentResult {
  _id: string;
  gradeSheetId: string;
  studentId: string;
  testScore: number;
  quizScore: number;
  finalExamScore: number;
  totalScore: number;
  letterGrade: string;
  behavioralRemark?: string;
}

export interface IPayment {
  _id: string;
  parentId: string;
  studentId: string;
  academicYear: string;
  term: number;
  amount: number;
  currency: string;
  method: PaymentMethod;
  referencePNR: string;
  receiptUrl?: string;
  status: PaymentStatus;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface IAttendance {
  _id: string;
  studentId: string;
  courseId: string;
  date: Date;
  status: AttendanceStatus;
  recordedBy: string;
}

export interface IInquiry {
  _id: string;
  gradeSheetId: string;
  teacherId: string;
  reason: string;
  status: InquiryStatus;
  resolvedBy?: string;
}

export interface IAnnouncement {
  _id: string;
  title: string;
  content: string;
  audience: AnnouncementAudience;
  authorId: string;
  gradeLevel?: number;
  createdAt: Date;
}

export interface IJwtPayload {
  id: string;
  role: UserRole;
}

export interface IAuthUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IAuthResponse {
  token: string;
  user: IAuthUser;
}
