# DT-Academy: Enterprise Elementary School Portal (MERN Monorepo)

## 1. Project Architecture & Stack
- **Architecture:** Monorepo using npm workspaces (`apps/api`, `apps/web`, `packages/types`, `packages/shared`).
- **Backend:** Node.js, Express.js, TypeScript, Mongoose (MongoDB), JWT, bcrypt.
- **Frontend (Web):** React (Vite), TypeScript, Tailwind CSS, Zustand (state), Lucide React (icons), Axios / React Query.
- **Headless Prep (React Native Ready):** All business logic, custom API hooks (`useAuth`, `useGrades`, `usePayments`), and type definitions must live in `packages/types` and `packages/shared` or `/src/hooks` so they can be reused 1:1 in a mobile Expo app later. UI components must contain zero direct API fetching logic.
- **Design Aesthetic:** Minimalist, clean, modern UI (inspired by Linear and modern SaaS). Generous whitespace, subtle slate borders, legible typography, and cards instead of dense spreadsheets.

---

## 2. Role-Based Access Control (RBAC) - 6 Roles

1. **Director (Main Owner):** Full administrative authority. Final approval for class grade sheets. Final verification for manual tuition payments. School-wide analytics.
2. **IT Admin:** User account provisioning, password resets, review and approval of "Grade Unlock" inquiries, verification of cash and bank transfer payments.
3. **Manager:** Academic schedule configuration, class/section assignments, teacher-to-course mapping, student admissions, parent-student linkage.
4. **Teacher:** Grade entry for assigned subjects/sections, daily roll-call attendance, class-specific notices, submits grade sheets for Director approval.
5. **Parent:** View enrolled children's profiles, track academic performance and attendance (when active), submit tuition payments (Cash PNR / Bank Reference, Telebirr, M-Pesa), read announcements.
6. **Student (K-8):** Simple, engaging read-only dashboard. View current approved grades, report cards, daily schedule, and notices. Strictly locked out of grade views if tuition is overdue (`isActive: false`).

---

## 3. Core Business Workflows & State Machines

### A. Gradebook & Immutability Lifecycle
1. **DRAFT:** Teacher creates/updates marks. Autosaves to DB.
2. **PENDING_APPROVAL:** Teacher finalizes and submits the entire class grade sheet. Teacher editing becomes locked.
3. **APPROVED (LOCKED):** Director reviews and approves. Records become immutable. Results become visible to active Students and Parents.
4. **UNLOCK_REQUESTED:** If a teacher finds an error, they submit a formal `Inquiry` with a justification.
5. **UNLOCKED:** IT Admin or Director approves the inquiry. Grade sheet status resets to `DRAFT` for correction.

### B. Tuition Payment & Student Activation Lifecycle
1. **Invoice Issued:** System / Manager sets term fee schedule.
2. **Manual Payment (Cash / Bank Transfer):** Parent inputs the transaction reference / PNR and uploads a receipt. Status: `PENDING_VERIFICATION`. IT Admin or Director physically verifies and marks `VERIFIED`.
3. **Digital Payment (Telebirr / M-Pesa):** Parent pays via gateway. Webhook (`/api/webhooks/payment`) verifies transaction and automatically sets status to `VERIFIED`.
4. **Active Status Rule:** When payment is `VERIFIED`, `StudentProfile.isActive` is set to `true`. If overdue, `isActive` is set to `false`, hiding report cards behind a friendly payment reminder screen.

---

## 4. Shared TypeScript Interfaces (`packages/types`)

```typescript
export type UserRole = 'DIRECTOR' | 'IT_ADMIN' | 'MANAGER' | 'TEACHER' | 'PARENT' | 'STUDENT';

export type GradeSheetStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'UNLOCK_REQUESTED';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'TELEBIRR' | 'MPESA';

export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

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
  gradeLevel: number; // e.g., 1 to 8
  section: string;    // e.g., 'A', 'B'
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
  term: number; // 1, 2, 3
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
  currency: string; // 'ETB'
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  resolvedBy?: string;
}

export interface IAnnouncement {
  _id: string;
  title: string;
  content: string;
  audience: 'ALL' | 'PARENTS' | 'TEACHERS' | 'STUDENTS';
  authorId: string;
  gradeLevel?: number;
  createdAt: Date;
}