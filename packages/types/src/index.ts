import { DEFAULT_HOME_PAGE, DEFAULT_HOME_PAGE_AM, homeWithSharedAssets, type IHomePage } from './homePage';

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

export interface INamedCount {
  key: string;
  label: string;
  count: number;
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
  family: {
    parents: number;
    parentsWithChildren: number;
    studentLoginsEnabled: number;
  };
  byYear: INamedCount[];
  byGrade: INamedCount[];
  payments: {
    pending: number;
    verified: number;
    rejected: number;
    verifiedAmountEtb: number;
    pendingAmountEtb: number;
    byMethod: { method: string; count: number; amountEtb: number }[];
    byMonth: { month: number; label: string; verified: number; pending: number; amountEtb: number }[];
  };
  grades: {
    draft: number;
    pendingApproval: number;
    approved: number;
    unlockRequested: number;
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
  attendance: IFamilyAttendance[];
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

export interface IFamilyAttendance {
  courseName: string;
  date: string;
  status: AttendanceStatus;
}

export interface IPortalAnnouncement {
  _id: string;
  title: string;
  content: string;
  audience: AnnouncementAudience;
  gradeLevel?: number;
  createdAt: string;
}

export interface IGradeResultRow {
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  testScore: number;
  quizScore: number;
  finalExamScore: number;
  totalScore: number;
  letterGrade: string;
  behavioralRemark: string;
}

export interface IGradeSheetDetail {
  _id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  gradeLevel: number;
  section: string;
  academicYear: string;
  term: number;
  status: GradeSheetStatus;
  teacherName: string;
  submittedAt?: string;
  approvedAt?: string;
  openInquiry?: { _id: string; reason: string; status: InquiryStatus };
  rows: IGradeResultRow[];
}

export interface IGradeSheetQueueItem {
  _id: string;
  courseName: string;
  courseCode: string;
  gradeLevel: number;
  section: string;
  academicYear: string;
  term: number;
  status: GradeSheetStatus;
  teacherName: string;
  submittedAt?: string;
  inquiryReason?: string;
  inquiryId?: string;
}

export interface IAttendanceMark {
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  status: AttendanceStatus | null;
}

export interface IAttendanceDay {
  courseId: string;
  courseName: string;
  date: string;
  marks: IAttendanceMark[];
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

export interface ISiteLocaleCopy {
  city: string;
  country: string;
  addressLine: string;
  hours: string;
  heroTagline: string;
  heroTitle: string;
  heroBlurb: string;
  welcomeBody: string;
  aboutBody: string;
  footerBlurb: string;
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
  home: IHomePage;
  copyAm: ISiteLocaleCopy;
  homeAm: IHomePage;
}

export const DEFAULT_SITE_COPY_AM: ISiteLocaleCopy = {
  city: 'ደብረ ታቦር',
  country: 'ኢትዮጵያ',
  addressLine: 'ዋና በር፣ ደብረ ታቦር፣ ኢትዮጵያ',
  hours: 'ሰኞ–አርብ 8:00–16:00',
  heroTagline: 'ችሎታን ወደ ሕይወት',
  heroTitle: 'ዲቲ አካዳሚ',
  heroBlurb:
    'ከኬጂ እስከ 8ኛ ክፍል · ደብረ ታቦር፣ ኢትዮጵያ · ወደ 2,000 ተማሪዎች። ምዝገባ በቢሮ ነው። የህዝብ ምዝገባ የለም።',
  welcomeBody:
    'ቡድናችን ለሚያስብ ክፍል፣ ሙያዊ ሠራተኞች እና ትምህርት ቤቱ እንዴት እንደሚሠራ ለሚያውቁ ወላጆች ቁርጠኛ ነው። ከኬጂ እስከ 8ኛ ክፍል በአንድ መዝገብ። ዳይሬክተሩ ውጤቶችን ይፈርማል። ልጁ ሲቀበል ቤተሰቦች መግቢያ ያገኛሉ።',
  aboutBody:
    'ዲቲ አካዳሚ በደብረ ታቦር፣ ኢትዮጵያ የተዘጋ ከኬጂ እስከ 8ኛ ክፍል ትምህርት ቤት ነው። ለተመዘገቡ ቤተሰቦች እንኖራለን፣ እንደ የህዝብ ገበያ አይደለም። የዳይሬክተር ቢሮ እያንዳንዱን ልጅ ይቀበላል፤ መምህራን ክፍሉን ይይዛሉ፤ ወላጆች በቅበላ ጊዜ የሚሰጥ የቤተሰብ መግቢያ በኩል የትምህርት ቤት ሕይወትን ያያሉ።',
  footerBlurb:
    'ከኬጂ እስከ 8ኛ ክፍል በደብረ ታቦር፣ ኢትዮጵያ። ወደ 2,000 ተማሪዎች። ቢሮው እያንዳንዱን ልጅ ይቀበላል። የህዝብ ምዝገባ የለም።',
};

const COPY_AM_KEYS: (keyof ISiteLocaleCopy)[] = [
  'city',
  'country',
  'addressLine',
  'hours',
  'heroTagline',
  'heroTitle',
  'heroBlurb',
  'welcomeBody',
  'aboutBody',
  'footerBlurb',
];

export function mergeSiteCopyAm(raw: unknown): ISiteLocaleCopy {
  const src = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const next = { ...DEFAULT_SITE_COPY_AM };
  for (const key of COPY_AM_KEYS) {
    const value = src[key];
    if (typeof value === 'string' && value.trim()) next[key] = value.trim();
  }
  return next;
}

export function siteForLocale(site: ISiteContent, locale: 'en' | 'am'): ISiteContent {
  if (locale !== 'am') return site;
  const copy = site.copyAm ?? DEFAULT_SITE_COPY_AM;
  return {
    ...site,
    ...copy,
    home: homeWithSharedAssets(site.homeAm ?? DEFAULT_HOME_PAGE_AM, site.home),
  };
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
  home: DEFAULT_HOME_PAGE,
  copyAm: DEFAULT_SITE_COPY_AM,
  homeAm: DEFAULT_HOME_PAGE_AM,
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

export type {
  IHomeCard,
  IHomePage,
  IHomeProgram,
  IHomeQuote,
  IHomeStat,
  IHomeWhy,
} from './homePage';
export { DEFAULT_HOME_PAGE, DEFAULT_HOME_PAGE_AM, homeWithSharedAssets, mergeHomePage, parseStatCount } from './homePage';
export { letterFromTotal, scoredResult } from './grades';
