# Architectural Decisions — AristoSolve

Key decisions made during development and the reasoning behind them.

---

## Frontend

**Create React App, not Vite**
Using `react-scripts 5.0.1`. The assignment environment and existing `client/` scaffold used CRA. Vite would require a different build config and proxy setup — not worth the churn mid-assignment.

**Port 5173 for frontend, not 3000**
Both backend and CRA default to 3000. We override frontend to 5173 via `PORT=5173` in `frontend/package.json` (using `cross-env` for Windows compatibility + `WDS_SOCKET_PORT=5173` to fix CRA's hot-reload WebSocket). Backend has CORS enabled for `localhost:5173`.

**No Redux — localStorage only**
Session state is simple: userId, userRole, firstName, lastName. No cross-component state sharing needed beyond that. localStorage + prop drilling is sufficient for Phase 1.

**`<textarea>` not Monaco editor**
Monaco is post-submission. Using a plain textarea with Tab-key handler (inserts 4 spaces via `selectionStart/End` + `requestAnimationFrame`) keeps the build simple and avoids a heavy dependency during assignment phase.

**3-panel layout at ≥ 1400px**
Coding interfaces (LeetCode, NeetCode) are designed for wide screens. The 28% / 42% / flex:1 split requires ~1400px to be comfortable. Mobile tabbed layout is deferred to post-submission.

**Socket.IO not SSE for AristoBot**
Assignment 4 explicitly requires Socket.IO. Originally planned SSE (simpler for one-directional AI streaming) but changed to Socket.IO to satisfy A4 requirements and enable the 2-tab real-time demo. Socket.IO also allows broadcasting user messages to other tabs in the same room.

**isMounted flag for React 18 Strict Mode**
React 18 Strict Mode runs effects twice in development. Socket connections registered inside `useEffect` would fire twice causing duplicate messages. Fixed with `isMounted` flag — if effect cleanup runs before async init finishes, the second run detects this and skips socket registration.

**Deduplication by message ID in receive-message handler**
Socket `receive-message` could fire twice (Strict Mode) or arrive for messages already in state. Frontend deduplicates by DB message ID before appending to state: `if (prev.some(m => m.id === message.id)) return prev`.

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

**All work on `master` branch.**
Phase 1 and Phase 2 both committed directly to master. Each major milestone committed separately with descriptive messages.

**`backend/.env` never committed — verified with `git check-ignore`.**
API key and DB password live only in `backend/.env`. Confirmed ignored on line 24 of `.gitignore` before every push.

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
Not deleted — kept as reference after all controllers were swapped to Sequelize. Safe to delete post-submission but retained for grader transparency.

**Progress record = assignment (no separate assignments table)**
A company assigns a test to a candidate by creating a `Progress` record with `deadline` set. The candidate sees it in "Assigned to me" on their dashboard. No new table needed — `Progress` already has `userId`, `problemId`, `status`, and `deadline`.

**Upsert on duplicate progress record**
`User ↔ Problem` has a unique composite index via the many-to-many `belongsToMany` relationship. `POST /api/progress` uses findOne-then-create-or-update to handle the case where a progress record already exists (re-assignment or returning to a problem).

**Evaluation triggered by REST, not socket**
The auto-evaluation on submit is triggered by `PUT /api/conversations/:id` (REST), not by the socket `conversation-ended` event. The REST controller calls Claude and creates the Evaluation row. The socket event only notifies other tabs. This avoids race conditions and keeps evaluation logic in one place.

**`backend/.env` for all secrets**
DB credentials and `ANTHROPIC_API_KEY` live in `backend/.env`. Never committed — listed in `.gitignore`. A `backend/.env.example` with placeholder values is committed for A4 submission.

---

## AI Integration (Phase 2)

**Claude Haiku, not Opus or Sonnet**
Haiku (`claude-haiku-4-5-20251001`) chosen for AristoBot chat — fastest response time, lowest cost (~$0.0003/reply), sufficient quality for Socratic mentoring. Evaluation uses the same model since the eval prompt is structured (returns JSON), not creative.

**Fallback to canned replies when API unavailable**
If the Claude API fails (no credits, network error, rate limit), AristoBot falls back to cycling through a canned mentor reply array. The app never crashes and remains demonstrable even without a funded API account.

**Language passed per-message, not stored per-session**
The candidate can switch language mid-session. Each `send-message` socket event includes the current `language` from the dropdown. The backend uses this over the DB conversation language so AristoBot always responds in the correct syntax.

**Evaluation auto-triggered on submit, not manual**
When `PUT /api/conversations/:id` is called with `endedAt`, the controller automatically calls Claude to evaluate the full conversation. The company doesn't need to trigger evaluation manually. A fallback placeholder row is created if Claude fails.

**Code analysis included in evaluation**
The final code submission is sent as the last user message with a `[Final submission]` marker. The evaluation system prompt explicitly tells Claude to assess both AI nativeness (50%) and code quality (50%) using this marker.

**Syntax-highlighted code blocks in chat**
AristoBot responses containing markdown code fences (` ```python ... ``` `) are parsed client-side and rendered as dark code panels with a language label, copy button, and basic token-level syntax highlighting (keywords, strings, numbers, comments). No external library — pure regex applied to escaped HTML.
