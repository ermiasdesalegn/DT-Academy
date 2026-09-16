# DT Academy — What Is Done

This document describes the **current shipped state** of the DT Academy school portal as of the latest `master` branch. Use it as onboarding context: what the product is, what works in production-shaped environments, and where the important code lives.

It does **not** list unfinished work. For that, see [`WHAT-TO-DO-NEXT.md`](./WHAT-TO-DO-NEXT.md).

---

## 1. Product in one paragraph

DT Academy is a **closed school operations system** for a Debre Tabor campus (mainly KG–Grade 8), not an open social product. Staff run admissions, join-request approval, classes, grades, attendance, tuition recording (ledger only for now), website content, notices, and school memorials. Parents and older students use a **family portal** for report cards, attendance, notices, memorials that apply to them, and tuition payment submission. The public site accepts **join requests**; accounts are created only after director/office approval (or direct office admit).

---

## 2. Architecture

| Layer | Location | Stack |
|--------|----------|--------|
| API | `apps/api` | Express, TypeScript, Prisma, JWT, Multer, optional S3 SDK |
| Web | `apps/web` | React (Vite), Tailwind, Shadcn-style UI, React Query, Zustand |
| Shared types | `packages/types` | TypeScript interfaces shared by API and web |
| Database | Neon PostgreSQL | Schema in `apps/api/prisma/schema.prisma` |
| Deploy | Render free web service | `render.yaml`; Express serves API **and** built web app |

**Local defaults:** API `http://localhost:5000`, web `http://localhost:5173` (or combined when started via the production-style Express entry).

**Roles:** `DIRECTOR`, `IT_ADMIN`, `MANAGER`, `TEACHER`, `PARENT`, `STUDENT`. Staff use `/admin/*`. Families use `/portal/*`. `RoleGate` and nav are role-aware.

---

## 3. Auth and account lifecycle

- Login: `POST /api/auth/login` → JWT in localStorage (`dt-token`).
- Hydrate: `GET /api/auth/me` on app load; hardened against transient API errors.
- Staff can sign out from a **header account menu**.
- **Admit student** creates or reuses a parent account, mints a student profile/ID, and optional student login (typically G5–G8).
- **Public join request:** anyone can submit on `/admissions` (`POST /api/join-requests`). Director / IT Admin / Manager review on **Join requests**; approve runs the same admit path (section + year required).
- <!-- Tuition academic lock paused for now: students are admitted with profile `isActive = true` so the family portal shows academics without fee verification. Re-enable by admitting locked and unlocking in `payments/settle.ts`. -->
- Students are admitted **active** (`isActive = true`). Tuition recording may still exist in the office ledger, but it does **not** gate academics right now.
- **Former people:** students and teachers can be marked former (cannot log in; history kept) and restored. People tabs include former students and former teachers. Person history page shows marks, attendance, courses/sheets, and memorials for students.

---

## 4. Teaching and classroom (working path)

### Gradebook immutability (implemented)

1. Teacher drafts a class sheet (save draft).
2. Teacher submits → editing stops.
3. Director approves → families with active students can see marks.
4. Teacher can request unlock; Director can open the sheet again.

### Attendance

- Teachers mark **per subject course** for a day (`PRESENT` / `ABSENT` / `LATE` / `EXCUSED`) on Teaching → Attendance.
- Roll lists **current** students only (excludes former / left accounts).
- Date picker uses the teacher’s **local calendar day**.
- Families see those statuses on the portal (recent window ≈ 60 days).

### Classes and subjects (KG–8)

Previously, **courses only appeared via demo seed**. That is fixed for live ops:

- Office (`DIRECTOR` / `IT_ADMIN`) opens **Classes**.
- Sets **class representative** (homeroom).
- Manages **Subjects**: name, code, teacher — upsert via `GET`/`PUT /api/classes/courses`.
- Unique key: `[code, academicYear, gradeLevel, section]`.
- Shared KG–G8 prefill catalog in `apps/web/src/lib/subjectCatalog.ts`.
- **Apply to all classes** copies subjects + teachers from the selected class onto every other KG–8 class in the same year (`POST /api/classes/courses/apply-template`).
- Teachers then see their courses on **My classes** and can open gradebooks and attendance **without re-running seed**.

Related: class overall ranks for the representative; exam results queue for the Director (modal review).

---

## 5. Family portal

- Operations-style overview: cards/charts for marks, attendance, notices.
- Tabs: class/teachers, report card, attendance, payments, notices, **memorials**.
- Parent multi-child switcher; former-student badge when applicable.
- Student dashboard shows the same academic surfaces for the logged-in student.
- English and Amharic via locale store + `useT()` for portal chrome.

---

## 6. Tuition and payments (what exists — carefully)

**Implemented and in use for office workflows:**

- Tuition months ledger per student.
- Office can mark months paid/unpaid (cash/bank style notes).
- Family **Pay** flow for due months; Telebirr / M-Pesa paths exist in **mock** (and optional sandbox) mode.
- Director overview pending/verified payment charts.

**Explicit product stance today:**

- `PAYMENTS_MODE=mock` on Render by default.
- **Academic lock via tuition is paused:** admits set `StudentProfile.isActive = true`. Fee verification still updates the ledger but is not required to see grades/attendance.
- Do not treat live merchant production as “done” unless ops intentionally flips env and validates webhooks.

---

## 7. Communications and public site

- **Office notices:** audience (`ALL` / `PARENTS` / `TEACHERS` / `STUDENTS`) and optional grade; shown in family and teacher portals (not the public blog).
- **Website CMS:** public copy, photos, blog posts in EN and AM; library photos preferred; uploads supported.
- **Contact form:** works with Resend when configured; logs in development if keys are empty.
- **Join requests:** public form on Admissions; office queue at `/admin/join-requests`.
- Ethiopian-friendly date/time formatting in the UI locale helpers.

---

## 8. School Memorials (full feature)

Staff and teachers can publish memorials about a student, a group of students, or a whole **batch** (grade + year + optional section), always with an attached note.

| Kind | Meaning |
|------|---------|
| `NOTE` | Text note |
| `BLOG` | Longer story |
| `PHOTO` | Image + note |
| `VIDEO` | Video + note |

**API:** `GET/POST /api/memorials`, `POST /api/memorials/upload`, `PUT /api/memorials/:id`, `DELETE /api/memorials/:id` (delete office-only).

**Visibility:**

- Parents: children tagged or matching batch.
- Students: self / batch.
- Office: full list; person history shows memorials for that student.

**UI:** `/admin/memorials` titled **School Memorials**; create/edit; teacher nav included; family portal Memorials tab / student section.

**Schema:** `SchoolMemorial`, `SchoolMemorialStudent`, enums `MemorialKind` / `MemorialScope`; migration + startup `ensureSchoolMemorialsTables`.

---

## 9. Media uploads (durable when configured)

- Shared upload helpers; site images and memorial media.
- If `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and `S3_PUBLIC_BASE_URL` are set (R2-compatible), files go to object storage and public URLs are returned.
- If not set, files land on local disk under `apps/api/uploads` and are served at `/api/uploads/...` (fine locally; **ephemeral on free Render** unless S3 is configured).
- Env documented in `apps/api/.env.example` and `render.yaml`.

---

## 10. People directory and search

- People tabs: all, students, parents, staff, former students, former teachers.
- Actions: set password, record payment (where allowed), view history, mark former, restore.
- **Server search:** `GET /api/users?q=&take=&skip=` (name, email, student ID); response `{ users, total }`.
- People UI search box; memorials student picker debounces `q` instead of loading the entire school client-side.

---

## 11. Localization

| Area | Status |
|------|--------|
| Public site, login, family portal | Localized (EN / AM) |
| Office people / overview / sheets queue | Localized |
| Memorials admin + feed | Localized |
| Teaching (dashboard, attendance, grade sheet) | Localized |
| Classes office, notices, admit form chrome, tuition office chrome, website editor chrome | Localized |
| CMS field labels inside website editor | Mostly English labels for editors; content itself is EN/AM fields |

Mechanism: `apps/web/src/i18n/en.ts` + `am.ts`, `translate()` + `useT()`.

---

## 12. Reliability and deploy notes already handled

- Neon `DATABASE_URL` + `DIRECT_URL` expectations for Prisma on Render.
- Retry/reconnect behavior around Prisma disconnects for classroom flows.
- Auth hydrate and empty/not-found states hardened.
- Single Render service build: Prisma generate + web build; Express starts API and static SPA.

---

## 13. Important code map (for navigators)

| Concern | Start here |
|---------|------------|
| Schema | `apps/api/prisma/schema.prisma` |
| Server mount | `apps/api/src/server.ts` |
| Classes / courses | `apps/api/src/controllers/classController.ts`, `apps/web/src/pages/ClassesOfficePage.tsx` |
| Join requests | `apps/api/src/controllers/joinRequestController.ts`, `apps/web/src/pages/JoinRequestsPage.tsx`, `apps/web/src/pages/public/Admissions.tsx` |
| Admit | `apps/api/src/services/admitStudent.ts`, `apps/web/src/pages/AdmitStudentPage.tsx` |
| Grades | `apps/api/src/controllers/gradeController.ts`, `apps/web/src/pages/GradeSheetPage.tsx` |
| Memorials | `apps/api/src/controllers/memorialController.ts`, `apps/web/src/pages/MemorialsPage.tsx` |
| Users / former / history | `apps/api/src/controllers/userController.ts`, `apps/web/src/pages/AdminDashboard.tsx` |
| Family portal | `apps/web/src/pages/ParentDashboard.tsx`, `StudentDashboard.tsx` |
| Uploads / S3 | `apps/api/src/lib/objectStorage.ts`, `resolveUpload.ts` |
| i18n | `apps/web/src/i18n/en.ts`, `am.ts` |
| Types | `packages/types/src/index.ts` |
| Product blueprint (older / broader) | `project-master-plan.md` |

---

## 14. Recent commit series (memorials → ops completion)

Illustrative tip of `master` (newest first among this arc):

1. Localize teaching and office staff pages (EN + AM)
2. Memorials edit API, teacher create, feed i18n
3. Server people search
4. R2/S3 durable uploads
5. Office course / teacher assignment
6. School memorials (schema → API → admin → family)
7. Former people + history + portal badges
8. Family portal restyle, staff sign-out, contact/blog/locale, etc.

Treat git history as the source of truth for exact SHAs.

---

## 15. How to verify “done” quickly

1. Public join request on `/admissions` → office Join requests → approve → parent login works.
2. Admit a student → appear in Classes (profile active; academics visible without tuition verify).
3. Assign subjects + teachers on one class → **Apply to all classes** → other KG–8 classes get the same subjects.
4. Teacher marks attendance for a course/day → parent Attendance tab shows it.
5. Teacher saves/submits sheet → Director approves → parent sees marks.
6. Post a memorial (photo optional) → parent Memorials tab shows it for that child/batch.
7. People search finds a student by ID without loading the whole school.
8. With S3 env empty, local upload still works to `/api/uploads/...`.

If those paths work, you are standing on the **completed** foundation this document describes.
