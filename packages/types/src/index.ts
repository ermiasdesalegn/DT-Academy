export type UserRole =
  | 'DIRECTOR'
  | 'IT_ADMIN'
  | 'MANAGER'
  | 'TEACHER'
  | 'PARENT'
  | 'STUDENT';

export const USER_ROLES: UserRole[] = [
  'DIRECTOR',
  'IT_ADMIN',
  'MANAGER',
  'TEACHER',
  'PARENT',
  'STUDENT',
];

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
  month: number;
  amount: number;
  currency: string;
  method: PaymentMethod;
  referencePNR: string;
  providerRef?: string;
  payerPhone?: string;
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

export interface IAdmitStudentRequest {
  studentName: string;
  grade: string;
  section: string;
  academicYear: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  enableStudentLogin?: boolean;
}

export interface IAdmitStudentResponse {
  parent: IAuthUser;
  parentCreated: boolean;
  parentTemporaryPassword?: string;
  student: IAuthUser;
  studentProfile: IStudentProfile;
  studentLoginEnabled: boolean;
  studentTemporaryPassword?: string;
}

export interface IListedUser extends IAuthUser {
  studentProfile?: IStudentProfile;
}

export interface ICreatePaymentRequest {
  studentProfileId: string;
  amount: number;
  method: PaymentMethod;
  referencePNR: string;
  academicYear: string;
  term: number;
  month: number;
}

export interface IPaymentListItem extends IPayment {
  parentName: string;
  studentName: string;
  studentIdNumber: string;
}

export interface IInsights {
  students: {
    total: number;
    activePaid: number;
    lockedOverdue: number;
  };
  staff: {
    total: number;
    teachers: number;
    officeAdmin: number;
  };
}

export interface IFamilyChild {
  name: string;
  profile: IStudentProfile;
  pendingPayment?: {
    amount: number;
    method: PaymentMethod;
    referencePNR: string;
  };
  tuitionMonths: ITuitionMonth[];
  teachers: IFamilyTeacher[];
  results: IFamilyResult[];
  resultsLocked: boolean;
}

export interface IFamilyTeacher {
  subject: string;
  teacherName: string;
}

export interface IFamilyResult {
  subject: string;
  teacherName: string;
  term: number;
  letterGrade: string;
  totalScore: number;
}

export type TuitionMonthStatus = 'PAID' | 'PENDING' | 'UNPAID' | 'UPCOMING';

export interface ITuitionMonth {
  year: number;
  month: number;
  label: string;
  status: TuitionMonthStatus;
  penaltyEtb: number;
  baseEtb: number;
  totalDueEtb: number;
  referencePNR?: string;
}

export interface ISiteContent {
  schoolName: string;
  city: string;
  country: string;
  addressLine: string;
  phone: string;
  hours: string;
  heroTagline: string;
  heroTitle: string;
  heroBlurb: string;
  welcomeBody: string;
  aboutBody: string;
  footerBlurb: string;
}

export const DEFAULT_SITE_CONTENT: ISiteContent = {
  schoolName: 'DT Academy',
  city: 'Debre Tabor',
  country: 'Ethiopia',
  addressLine: 'Main gate, Debre Tabor, Ethiopia',
  phone: '011 661 4400',
  hours: 'Mon–Fri 8:00–16:00',
  heroTagline: 'Bringing talent to life',
  heroTitle: 'DT Academy',
  heroBlurb:
    'Kindergarten to Grade 8 · Debre Tabor, Ethiopia · About 2,000 students. Enrolment is by the office. There is no public sign-up.',
  welcomeBody:
    'Our team is committed to a caring classroom, professional staff, and parents who know how the school actually runs. Kindergarten through Grade 8 on one roll. The Director signs grades. Families receive a login when the child is admitted.',
  aboutBody:
    'DT Academy is a closed Kindergarten to Grade 8 school in Debre Tabor, Ethiopia. We exist for enrolled families, not as a public marketplace. The Director’s office admits each child; teachers hold the classroom; parents see school life through a family login issued at admission.',
  footerBlurb:
    'Kindergarten to Grade 8 in Debre Tabor, Ethiopia. About 2,000 students. The office admits every child. There is no public sign-up.',
};

export interface ISetTuitionMonthRequest {
  studentProfileId: string;
  month: number;
  status: 'PAID' | 'UNPAID';
  note?: string;
}

export interface IPaymentStatusLog {
  _id: string;
  studentId: string;
  academicYear: string;
  month: number;
  fromStatus: string;
  toStatus: string;
  note?: string;
  actorId: string;
  actorName: string;
  createdAt: string;
}

export interface ICreateOutstandingPaymentRequest {
  studentProfileId: string;
  method: PaymentMethod;
  referencePNR: string;
}

export interface IClassGroup {
  gradeLevel: number;
  section: string;
  academicYear: string;
  studentCount: number;
  homeroomTeacherId?: string;
  homeroomTeacherName?: string;
}

export interface IClassSubjectCol {
  name: string;
  teacherName: string;
  imported: boolean;
}

export interface IClassOverallRow {
  studentId: string;
  name: string;
  studentIdNumber: string;
  scores: Record<string, number | null>;
  overall: number | null;
  rank: number | null;
}

export interface IClassOverall {
  gradeLevel: number;
  section: string;
  academicYear: string;
  term: number;
  homeroomTeacherName?: string;
  subjects: IClassSubjectCol[];
  rows: IClassOverallRow[];
}

export {
  MONTHLY_TUITION_ETB,
  TUITION_DUE_DAY,
  TUITION_GRACE_DAYS,
  TUITION_PENALTY_ETB,
  TUITION_PENALTY_EVERY_DAYS,
  MONTH_NAMES,
  academicYearNumber,
  termFromMonth,
  tuitionDueDate,
  tuitionGraceEnd,
  tuitionPenaltyEtb,
  monthHasPassed,
  isCurrentMonth,
} from './tuition';
