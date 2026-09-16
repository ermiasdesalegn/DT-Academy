# DT Academy — What To Do Next

Pick-up guide for the next work. Each item is written so **any engineer** can take it without prior chat context.

**Read first:** [`WHAT-IS-DONE.md`](./WHAT-IS-DONE.md) for what already ships.  
**Do not casually change:** live Telebirr–M-Pesa production flip unless product explicitly asks. Tuition→`isActive` academic lock is **paused** (admit sets active); do not re-enable without product ask.

Suggested order is top to bottom. Smaller items can be pulled in parallel if people are available.

---

## How to use this file

1. Claim one **Work item** (or a clearly marked sub-task).
2. Follow **Goal**, **Scope**, **Out of scope**, **Touch points**, **Acceptance**.
3. Prefer small PRs: API → UI → i18n if needed.
4. When done, move the item to a “Done” section in this file or delete it and note the PR/commit in `WHAT-IS-DONE.md`.

---

## Work item A — Turn on durable media in production (ops + light code check)

**Priority:** High if memorials/CMS photos matter on Render free tier.  
**Size:** S (mostly configuration)

### Goal

Live uploads for website CMS and School Memorials survive Render redeploy/sleep.

### Scope

1. Create a Cloudflare R2 (or S3) bucket with public read for objects (or a CDN public base URL).
2. Set Render env vars (already listed in `render.yaml`):

   - `S3_ENDPOINT`
   - `S3_BUCKET`
   - `S3_ACCESS_KEY_ID`
   - `S3_SECRET_ACCESS_KEY`
   - `S3_PUBLIC_BASE_URL`
   - `S3_REGION` (often `auto` for R2)

3. Redeploy. Upload a test image from Website CMS and a memorial photo/video.
4. Confirm returned URL is the public base URL (not only `/api/uploads/...`).
5. Redeploy or sleep the service; confirm the media URL still loads.

### Out of scope

- Migrating historical disk files already lost on free instances
- Changing multer limits unless product asks

### Touch points

- `apps/api/src/lib/objectStorage.ts`
- `apps/api/src/lib/resolveUpload.ts`
- `apps/api/.env.example`
- `render.yaml`

### Acceptance

- With env set: new uploads return durable public URLs and survive restart.
- With env unset (local): disk fallback still works.

---

## Work item B — Cmd+K / command palette people search

**Priority:** Medium–High for ~2k students (called out in `project-master-plan.md`).  
**Size:** M

### Goal

Staff open a command palette (⌘K / Ctrl+K) and jump to a person or common office action without hunting tabs.

### Scope

1. Reuse existing `GET /api/users?q=&take=&skip=` (already returns `{ users, total }`).
2. Add a palette UI in the staff layout (Director / IT Admin / Manager at minimum).
3. Results: name, role, student ID; Enter → person history or People focus.
4. Optional secondary actions: Admit student, School Memorials, Classes (route links only).

### Out of scope

- Replacing the People page
- Full ERP “global search” across gradesheets and payments

### Touch points

- `apps/web/src/components/layouts/` (staff shell)
- `apps/web/src/hooks/useUsers.ts`
- `apps/api/src/controllers/userController.ts` (extend only if ranking/highlight needed)

### Acceptance

- Typing 2+ characters debounces and shows server results within `take`.
- Keyboard open/close and arrow navigation work on desktop.
- Works in EN/AM for chrome labels.

---

## Work item C — Course delete / archive (safe)

**Priority:** Medium  
**Size:** M

### Goal

Office can remove or archive a wrongly created subject course **only when safe**.

### Scope

1. API: `DELETE /api/classes/courses/:id` (or archive flag).
2. Block delete if grade sheets or attendance rows exist; return a clear 409 message.
3. Classes Subjects UI: Remove button with confirm; show why blocked when applicable.

### Out of scope

- Multi-teacher per course
- Separate `Subject` entity
- Bulk curriculum wizard

### Touch points

- `apps/api/src/controllers/classController.ts`
- `apps/api/src/routes/classes.ts`
- `apps/web/src/pages/ClassesOfficePage.tsx`
- `packages/types`

### Acceptance

- Empty course deletes; course with sheets/attendance refuses with readable error.
- Teacher dashboard updates after delete (query invalidation).

---

## Work item D — Memorials pagination and richer admin list

**Priority:** Low–Medium  
**Size:** S–M

### Goal

School Memorials admin scales past the current “latest 100” mental model.

### Scope

1. API: `take` / `skip` or cursor on `GET /api/memorials` for office list.
2. Admin UI: “Load more” or simple pager.
3. Keep family/student filtered lists as-is unless they also need paging.

### Out of scope

- Public memorials feed on the marketing site
- Comments / reactions

### Touch points

- `apps/api/src/controllers/memorialController.ts`
- `apps/web/src/hooks/useMemorials.ts`
- `apps/web/src/pages/MemorialsPage.tsx`

### Acceptance

- Office can page through more than 100 memorials without loading everything at once.

---

## Work item E — Deeper website editor i18n

**Priority:** Low  
**Size:** M

### Goal

Website CMS chrome (section titles, field labels like “Hero title”) follows EN/AM locale, not only page title/save/upload.

### Scope

1. Add `websiteEditor.*` keys for remaining hardcoded labels in `WebsiteContentPage.tsx`.
2. Mirror in `am.ts`.
3. Do **not** merge EN/AM **content** fields; keep separate CMS language toggle.

### Out of scope

- Translating user-authored school copy automatically
- Redesigning the CMS layout

### Touch points

- `apps/web/src/pages/WebsiteContentPage.tsx`
- `apps/web/src/i18n/en.ts`, `am.ts`

### Acceptance

- Switching app locale updates editor chrome; content language toggle still independent.

---

## Work item F — Admissions UX hardening

**Priority:** Medium  
**Size:** M

### Goal

Admit flow matches office reality: clearer temporary password handoff, fewer confusing English leftovers, safer validation messages.

### Scope

1. Finish i18n for remaining Admit strings (checkbox copy, success details).
2. Optional: copy-to-clipboard for temporary passwords.
3. Optional: tabbed or stepped form (Student → Parent → Confirm) without changing API contract.

### Out of scope

- Changing tuition unlock rules (academic lock is paused already)

### Touch points

- `apps/web/src/pages/AdmitStudentPage.tsx`
- `apps/web/src/pages/JoinRequestsPage.tsx` (approve handoff polish)
- `apps/api` admit / join-request endpoints (only if validation messages need codes)

### Acceptance

- Office can admit and hand passwords without reading English-only scraps (when UI locale is AM).
- API errors still readable.

---

## Work item G — Payments production readiness (only when product says go)

**Priority:** High for go-live fees; **do not start** as casual polish.  
**Size:** L

### Goal

Move from `PAYMENTS_MODE=mock` to validated sandbox, then production merchants, with webhook settle that matches office policy.

### Scope (when authorized)

1. Document required Telebirr / M-Pesa env vars and callback URLs.
2. Sandbox end-to-end: family Pay → provider → webhook/callback → month pending/paid behavior agreed with product.
3. Production keys, monitoring, and failure UX.
4. Explicit tests around **not** unlocking students incorrectly.

### Out of scope until product sign-off

- Silent changes to `isActive` rules
- Removing cash/bank office ledger

### Touch points

- `apps/api/src/config/env.ts`
- Payment controllers/routes under `apps/api`
- `apps/web/src/pages/PayTuitionPage.tsx`
- `render.yaml` (`PAYMENTS_MODE`)

### Acceptance

- Written runbook + successful sandbox checklist signed off by product/ops.
- Mock mode still available for demos.

---

## Work item H — Portraits / student photos

**Priority:** Low (mentioned as “later” in product copy)  
**Size:** L

### Goal

Office can attach a portrait to a student; portals and People can show it.

### Scope

1. Schema field or media relation on `StudentProfile`.
2. Upload via existing upload pipeline (prefer S3).
3. Display on People, history, and family child switcher (small avatar).

### Out of scope

- Face recognition
- Parent self-service photo upload (unless product asks)

### Touch points

- Prisma schema + migration/ensure
- Users/family mappers
- Admin + portal UI

### Acceptance

- Portrait survives deploy when S3 configured; falls back to initials when missing.

---

## Work item I — Demo seed vs live school hygiene

**Priority:** Medium for handoff to a real school  
**Size:** S–M

### Goal

Clear docs/scripts so a real campus does not depend on `seed:demo` for courses (courses are assignable in UI now) and understands what seed still does.

### Scope

1. Update or add a short `README` section: first-week office checklist (admit → classes subjects → teachers → notices).
2. Document `seed:demo` / `seed:demo:reset` as **demo only**.
3. Optional: seed flag to create director only (already partly true via `seedDirector`).

### Out of scope

- Deleting seed entirely

### Touch points

- `apps/api/package.json` scripts
- `apps/api/src/seed/*`
- Root docs (`WHAT-IS-DONE.md` / this file / optional README)

### Acceptance

- A new operator can open a term using only UI + real admits, without reading chat history.

---

## Explicitly not next (unless product reopens)

| Topic | Why parked |
|-------|------------|
| Public self-service admissions ERP | Accounts stay office-provisioned |
| Cmd+K already listed above as B — do not duplicate as “search rewrite” | Server `q` exists |
| Subject entity separate from Course | Course name/code is enough |
| Broad K–12 blueprint churn in `project-master-plan.md` | Ship incremental ops value first |

---

## Quick claim table

| ID | Title | Size | Depends on |
|----|--------|------|------------|
| A | Production S3/R2 media | S | Bucket + Render secrets |
| B | Cmd+K people palette | M | Users search API (done) |
| C | Safe course delete | M | Course upsert (done) |
| D | Memorials paging | S–M | Memorials (done) |
| E | Website editor deep i18n | M | — |
| F | Admissions UX | M | — |
| G | Payments production | L | Product authorization |
| H | Portraits | L | Prefer A first |
| I | Operator checklist / seed docs | S–M | — |

---

## Definition of ready for a PR

- Touches only the claimed work item’s scope.
- Leaves payment settle logic unchanged unless the PR **is** item G and is labeled as such.
- Adds/updates EN + AM strings for any new user-visible copy.
- Notes manual test steps in the PR body (use Acceptance above).
