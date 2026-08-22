# DT-Academy: Enterprise Elementary School Portal (Monorepo)

## 1. Project Architecture & Stack
- **Database:** PostgreSQL hosted on Neon (using Prisma ORM). Schema lives in `apps/api/prisma/schema.prisma` (not `packages/database` yet).
- **Backend (`apps/api`):** Node.js, Express.js, TypeScript, JWT. (Runs on `http://localhost:5000`)
- **Frontend (`apps/web`):** React (Vite), TypeScript, Tailwind CSS, Shadcn UI. (Runs on `http://localhost:5173`)
- **Architecture:** Monorepo using npm workspaces (`apps/api`, `apps/web`, `packages/types`, `packages/shared`).
- **Nature of the App:** This is NOT a public marketing site. It is a closed System of Record and ERP for a K-12 campus of ~2,000 students.

---

## 2. The "Two-Portal" UI Philosophy (Shadcn UI)

The frontend is strictly divided into two distinct layouts based on user roles.

### A. The "Operations" Portal (Staff)
- **Target Audience:** Director, IT Admin, Manager, Teacher.
- **Layout Style:** Dark/professional sidebar. High information density.
- **Key Shadcn Components:**
  - Data tables for Admissions, Grade Queues, and Payment Verification.
  - Command (Cmd+K) for searching ~2,000 students (later).
  - Tabs for complex forms (e.g. Admissions).
  - Badge for DRAFT vs APPROVED (and related states).

### B. The "Family" Portal (Parents & Students)
- **Target Audience:** Parents (primary) and Students (secondary).
- **Layout Style:** Clean, calm, top-navigation bar. Mobile-first (no heavy sidebars).
- **Key Shadcn Components:**
  - Card for report cards and tuition status.
  - Alert (destructive) for payment lockdown.
  - Avatar and Select for the child switcher.

---

## 3. Core Business Workflows & Integrity Rules

### A. Gradebook Immutability
1. **Draft:** Teacher drafts marks (autosave).
2. **Pending:** Teacher submits the whole class sheet. Editing stops for the teacher.
3. **Approved (Locked):** Director approves. Grades become visible to active parents/students.
4. **Unlock Requested:** Teacher files an inquiry; Admin/Director can unlock back to draft.

### B. Tuition & The "Active" Toggle
- Unpaid or unverified fees → `student.isActive = false` → report card hidden; payment reminder shown.
- Verified payment (cash PNR or future M-Pesa webhook) → `student.isActive = true` → academic data unhidden.

---

## 4. Auth & portals

- No public sign-up. Office provisions accounts.
- JWT login at `/api/auth/login`.
- Staff → Operations layout. Parent/Student → Family layout.
- RoleGate blocks the wrong portal URLs.

Live Prisma enums/models in `apps/api` remain the source of truth until a dedicated schema migration is planned. The blueprint below is the product target (K–12 `gradeLevel`, optional email, phone uniqueness).
