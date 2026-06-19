# Architectural Decisions — AristoSolve

Key decisions made during development and the reasoning behind them.

---

## Frontend

**Create React App, not Vite**
Using `react-scripts 5.0.1`. The assignment environment and existing `client/` scaffold used CRA. Vite would require a different build config and proxy setup — not worth the churn mid-assignment.

**Port 5173 for frontend, not 3000**
Both backend and CRA default to 3000. We override frontend to 5173 via `PORT=5173` in `client/package.json` so both can run simultaneously. Backend has CORS enabled for `localhost:5173`.

**No Redux — localStorage only**
Session state is simple: userId, userRole, firstName, lastName. No cross-component state sharing needed beyond that. localStorage + prop drilling is sufficient for Phase 1.

**`<textarea>` not Monaco editor**
Monaco is Phase 2. Using a plain textarea with Tab-key handler (inserts 4 spaces via `selectionStart/End` + `requestAnimationFrame`) keeps Phase 1 simple and avoids a heavy dependency.

**3-panel layout at ≥ 1400px**
Coding interfaces (LeetCode, NeetCode) are designed for wide screens. The 28% / 42% / flex:1 split requires ~1400px to be comfortable. Mobile tabbed layout is deferred to Phase 2.

---

## Theme System

**`data-theme` on `<html>`, CSS custom properties**
No JS theme library. CSS vars under `[data-theme="dark"]` and `[data-theme="light"]` — simple, fast, no flash. Three touch points:
1. Login — applies theme from user's saved settings
2. Navbar toggle — live switch, saves to localStorage
3. Settings save — persists to API + localStorage

Settings page does NOT apply theme on load (would override the user's live preference).

---

## Backend

**`/api` prefix on all routes**
Keeps API routes clearly separated from any future static file serving. Frontend `api.js` wrapper prepends `/api` automatically.

**Header-based mock auth (`x-user-role`, `x-user-id`)**
No real sessions or JWT for Phase 1. Frontend auto-attaches headers from localStorage. Real auth (JWT + bcrypt) is Phase 2 — backend swap only, frontend unchanged.

**Two-layer access control**
- Route level: `auth(['admin', 'company'])` middleware blocks wrong roles immediately
- Controller level: ownership checks (e.g. company can only edit own problems, candidate can only message own conversation)
Both layers are needed — middleware can't know resource ownership without a DB query.

**Last-admin protection**
`DELETE /users/:id` counts admins before deleting. Blocks if `adminCount <= 1` and target is an admin. Prevents locking out the platform.

---

## Route Ordering (React Router)

`/problems/new` and `/problems/:id/edit` must be defined **before** `/problems/:id` in App.js. React Router v7 matches top-to-bottom — if `:id` comes first, it captures "new" and ":id/edit" as IDs.

---

## Git

**`feature/frontend-phase1` branch merged into `master` after Phase 1 completion.**
Master now contains the full Phase 1 codebase. Phase 2 work should branch off master again.

---

## Database (Phase 2)

**MySQL, not SQLite or PostgreSQL**
Assignment 4 explicitly requires MySQL. No alternative considered.

**Sequelize, not Prisma**
Both are strong ORMs. Sequelize chosen because it is the most common Node.js ORM in university courses, has better-documented migration CLI (`sequelize-cli`), and the team has no prior Prisma experience. Prisma's type-safety advantage is not meaningful without TypeScript.

**Admin is a User with userRole='admin', not a separate table**
Assignment 4 lists "Admin" as a required model. In AristoSolve, Admin is not a separate entity — it is a `User` record where `userRole = 'admin'`. The `User` Sequelize model covers this requirement. The last-admin protection logic in the delete controller demonstrates admin-specific business rules.

**MySQL installed via winget on Windows 11**
`winget install MySQL.MySQL` and `winget install MySQL.MySQLWorkbench`. Workbench provides the visual GUI needed for A4 screenshots (DB tables, migrations, ORM relationships).

**In-memory models kept in `backend/models/legacy/`**
Not deleted — kept as reference while Sequelize models are built. Removed after all controllers are swapped and verified.

**`backend/.env` for all secrets**
DB credentials and `ANTHROPIC_API_KEY` live in `backend/.env`. Never committed — listed in `.gitignore`. A `backend/.env.example` with placeholder values is committed for A4 submission.
