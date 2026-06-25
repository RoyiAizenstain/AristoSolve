# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Backend (port 3000)
cd backend && npm start
cd backend && npm run dev

# Frontend (port 5173)
cd frontend && npm start
```

No test runner is configured. Test endpoints manually using the Postman collection at [docs/AristoSolve.postman_collection.json](docs/AristoSolve.postman_collection.json), or with curl passing `-H "x-user-role: admin" -H "x-user-id: 1"`.

---

## What This Is

AristoSolve is a full-stack AI-guided problem-solving platform with a single core goal: **evaluate whether a candidate is AI native**.

Traditional technical interviews test whether someone can write an algorithm from memory. AristoSolve tests something different — can this person *think alongside AI*? Do they know what questions to ask? Can they push back when the AI is wrong? Do they use AI as a thinking tool or as an answer machine?

**How it works:** Candidates solve coding problems while chatting with AristoBot, an AI mentor that guides their thinking without giving answers directly. The entire conversation is saved. At the end, Claude evaluates the conversation using the company's custom evaluation prompt — scoring not just code correctness, but AI interaction quality: prompting skill, critical thinking, and adaptability.

**What makes it different from LeetCode/NeetCode:** The conversation IS the evaluation artifact. Companies define what "AI native" means for their context via a custom eval prompt. The score reflects how a candidate thinks, not just what they output.

- Runtime: Node.js + Express (backend) + Create React App (frontend, NOT Vite)
- Database: MySQL 8.4 via Sequelize ORM
- AI: Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) via `@anthropic-ai/sdk`
- Real-time: Socket.IO for AristoBot chat and 2-tab sync
- Backend port: 3000 — Base URL: `http://localhost:3000`
- Frontend port: 5173 — set via `PORT=5173` in `frontend/package.json`

---

## Development Phases

The project is built in two phases. **Always check which phase is active before adding features.**

### Phase 1 — Assignment 3 (COMPLETE ✅)

All Phase 1 items are implemented and working.

**Completed:**
- Login + Register pages (validation, loading, error states)
- Navbar with dark/light theme toggle (sun/moon icon), 🤖 branding
- Footer, Layout, RequireAuth, RequireRole guards
- Dashboard — role-aware (candidate / company / admin — 3 separate views)
- ProblemDetail — 3-panel layout (description | code+tests | AristoBot), `<textarea>` for code, Tab key inserts 4 spaces, language selector with per-problem starter code, mocked AI replies (upgraded to real Claude in Phase 2)
- Settings page — display name, email, theme, email notifications; theme persists and syncs with Navbar
- Add Problem / Edit Problem pages (admin + company)
- Users Management page (admin: CRUD with modal + inline delete confirm, last-admin protection)
- Backend: `/api` prefix, auth routes, `/api/users/me`, settings model
- Role-based problem visibility (candidate sees public only, company sees own+public, admin sees all)
- `PageLoader` spinner component used throughout
- 🤖 emoji favicon and browser tab title

**Deliberately deferred to Phase 2:**
- Monaco editor (use `<textarea>` now)
- Piston live code execution (no Run button yet)
- Progress page
- SSE streaming for AristoBot
- MySQL / real auth

### Phase 2 — Assignment 4 (COMPLETE ✅)

All Phase 2 items are implemented and working. Each feature was additive — nothing from Phase 1 was rewritten.

#### Step 0 — Folder Restructure (A4 Required Structure) `~30 min`

Assignment 4 requires a specific folder structure. Do this **before any Phase 2 code**.

**Target structure:**
```
AristoSolve/
├── frontend/              ← renamed from client/
│   ├── public/
│   ├── src/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── server.js      ← moved from root
│   │   ├── controllers/   ← moved from root
│   │   ├── middleware/    ← moved from root
│   │   └── routes/        ← moved from root
│   ├── models/            ← Sequelize ORM models (replaces root models/)
│   ├── migrations/        ← new
│   ├── seeders/           ← new
│   └── package.json       ← moved from root
├── CLAUDE.md
├── Context/
└── docs/
```

**Steps:**
1. ✅ Rename `client/` → `frontend/`
2. ✅ Create `backend/src/`, `backend/models/`, `backend/migrations/`, `backend/seeders/`
3. ✅ Move `controllers/`, `middleware/`, `routes/`, `server.js` → `backend/src/`
4. ✅ Move root `package.json` + `node_modules/` → `backend/`
5. ✅ Update all `require()` paths in `server.js` and controllers (one level deeper)
6. ✅ Update `backend/package.json` scripts → `node src/server.js`
7. ✅ Verify frontend proxy unchanged + both servers tested from new locations

**New commands after restructure:**
```bash
# Backend
cd backend && npm start
cd backend && npm run dev

# Frontend
cd frontend && npm start
```

---

#### Part 1 — MySQL + Sequelize (30% of A4 grade)

Goal: replace all in-memory arrays with a real MySQL database so data persists after server restarts.

| Step | Task |
|---|---|
| 1 | ✅ Install `sequelize`, `mysql2`, `sequelize-cli` |
| 2 | ✅ Create `.env` — `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` |
| 3 | ✅ Write Sequelize models: User, Admin, Problem, Conversation, Message, Progress, Evaluation, Settings |
| 4 | ✅ Write migrations in `backend/migrations/` — one file per table |
| 5 | ✅ Write seeders — 5 users + 5 problems |
| 6 | ✅ Swap all controllers from in-memory helpers → Sequelize queries |
| 7 | ✅ Add at least one JOIN query (Progress + User + Problem for company dashboard) |

Required ORM relationships (A4 requires one-to-many AND many-to-many):
- one-to-one: `User` → `Admin` (admin profile extension table)
- one-to-many: `User` → `Conversations`, `User` → `Progress`
- many-to-many: `User` ↔ `Problem` via `Progress` (junction table)

**Admin model (A4 requirement):** `backend/models/Admin.js` maps to the `admins` table — a one-to-one extension of `User` that holds `isSuperAdmin`. Migration: `backend/migrations/08-create-admins.js`. Seeder: `backend/seeders/03-admins.js` (seeds Alice as super-admin). The `userRole = 'admin'` enum on `User` still drives access control; the `admins` table holds admin-specific profile data.

#### .env.example (required for A4 submission)

```
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=aristosolve

# AI
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Server
PORT=3000
```

Create `backend/.env` from this template with real values. Never commit `.env` — it is in `.gitignore`.

---

#### Part 2 — Socket.IO — AristoBot Chat (30% of A4 grade)

Goal: replace mocked AristoBot replies with real-time Socket.IO communication so the chat feels live.

| Step | Task |
|---|---|
| 1 | ✅ Install `socket.io` (backend) + `socket.io-client` (frontend) |
| 2 | ✅ Wire Socket.IO to Express server in `server.js` |
| 3 | ✅ Backend: implement 5 custom socket events |
| 4 | ✅ Frontend: replace mocked replies in `ProblemDetail.jsx` with socket flow |
| 5 | ✅ Show "AristoBot is thinking..." typing indicator while AI processes |
| 6 | ✅ Demo: 2 browser tabs on same conversation, messages sync live |

5 custom events (A4 requires minimum 3):

| Event | Direction | Emitted by | Payload | When |
|---|---|---|---|---|
| `join-conversation` | client → server | Frontend | `{ conversationId }` | User opens ProblemDetail — joins a socket room |
| `send-message` | client → server | Frontend | `{ conversationId, content }` | User sends a chat message |
| `typing` | server → client | Backend | `{ conversationId }` | Backend received message, Claude API call in progress |
| `receive-message` | server → client | Backend | `{ conversationId, message }` | Claude reply ready — broadcast to all in the room |
| `conversation-ended` | client → server | Frontend | `{ conversationId }` | User clicks Submit — backend sets endedAt |

Socket rooms: each conversation gets its own room (`conversationId`). All clients in the same room receive `receive-message` and `typing` events — this enables the 2-tab demo required by A4.

#### Part 3 — Claude AI Integration (20% of A4 grade)

Goal: implement the two AI features that make AristoSolve unique — a real Socratic mentor and an AI nativeness evaluator.

| Step | Task |
|---|---|
| 1 | ✅ Install `@anthropic-ai/sdk` |
| 2 | ✅ Add `ANTHROPIC_API_KEY` to `.env` — never exposed to frontend |
| 3 | ✅ AristoBot mentor: backend calls Claude Haiku after each `send-message` socket event, language-aware, syntax help enabled, fallback to canned replies if API unavailable |
| 4 | ✅ Evaluation: auto-triggered on submit — calls Claude with full conversation + `evalPrompt`, scores AI nativeness + code quality, company sees full report with dimension progress bars |

**AristoBot system prompt:**
```
You are AristoBot, an AI mentor for a coding interview platform.
Your job is to evaluate whether this candidate is AI native.
Guide their thinking without giving the answer directly.
Ask Socratic questions. Never reveal the solution.
Keep replies under 3 sentences.
```

**Evaluation system prompt:**
```
You are evaluating a technical interview on an AI-guided coding platform.
Score the candidate's AI nativeness — their ability to think alongside AI.

Score these dimensions (0-100 each):
- Prompting skill: did they ask clear, focused questions?
- Critical thinking: did they push back when the AI was wrong or led them astray?
- Adaptability: did they recover and redirect when they went down wrong paths?
- Code correctness: was the final solution correct and well-reasoned?

Company evaluation focus: {evalPrompt}

Return JSON: { score, feedback, thinkingAnalysis, dimensions: { prompting, criticalThinking, adaptability, codeCorrectness } }
```

#### Part 4 — Documentation (10% of A4 grade)

| Item | Status | Content |
|---|---|---|
| `README.md` | ✅ Done | Purpose, install, DB setup, env vars, ORM setup, API endpoints, WebSocket feature, AI feature, known limitations |
| `.env.example` | ✅ Done | `backend/.env.example` with all required keys, no real values |
| Screenshots | ✅ Done | 19 screenshots in `screenshots/` at project root — auto-generated by Playwright + MySQL Workbench shots |
| Demo video | ✅ Done | `demo-video/AristoSolve-Demo.webm` — 57s full product story: company assigns → candidate solves with AristoBot → company sees AI evaluation |

#### Part 1b — Test Assignment Feature (Part of MySQL phase) ✅

Goal: allow a company to assign a specific problem to a specific candidate with a deadline.

**How it works:** A `progress` record = an assignment. Company creates a progress record for a candidate with a deadline. Candidate sees assigned tests separately on their dashboard.

Backend changes:
- `POST /api/progress` — extend to allow company/admin to create for a specific `userId` (candidate) with `deadline`
- `GET /api/progress` — candidate sees their assignments; company sees their candidates' progress

Frontend — Company Dashboard:
- "Assign" button per problem row → modal: select candidate + set deadline → creates progress record

Frontend — Candidate Dashboard:
- New "Assigned to me" section above open repository — shows problem, company name, deadline, status, Start button
- Open repository stays below as separate section

---

#### Good to Have — After A4 Submitted

| Feature | Extends |
|---|---|
| Monaco editor | Replace `<textarea>` in ProblemDetail |
| Piston live execution | Add Run button + Output tab |
| Progress page | Dedicated `/progress` route with full history + statistics. Note: assigned progress IS already visible in the candidate dashboard "Assigned to me" section. `/api/progress` already exists. |
| Evaluation report page | Candidate sees their AI nativeness score |
| JWT real auth | Replace header-based mock auth |
| **Timed multi-question test assignment** | See design below |

##### Timed Test Assignment (future feature)

Company assigns a **test session** instead of a single problem. Candidate does not know the questions in advance.

New `test_assignments` table:
```json
{
  "id": 1,
  "candidateId": 3,
  "companyId": 2,
  "problemIds": "[1, 4, 2]",
  "totalQuestions": 3,
  "timeLimitMinutes": 20,
  "deadline": "2026-07-01",
  "status": "pending | in_progress | completed",
  "currentQuestionIndex": 0,
  "startedAt": null,
  "completedAt": null
}
```

Flow:
1. Company selects candidate + number of questions + time per question + deadline
2. Backend randomly picks `totalQuestions` problems from company pool at test start (not at assignment time)
3. Candidate sees "3 questions · 20 min each · Deadline Jul 1" — no problem titles
4. Start Test → question 1 revealed → timer starts
5. Submit → question 2 revealed → timer resets
6. After all questions → evaluation triggered automatically

---

## Architecture

The codebase follows a strict three-layer separation:

- **routes/** — Express Router only. No logic. Wires HTTP methods + paths to controller functions, and applies `auth()` middleware where needed.
- **controllers/** — All request/response logic. Reads `req`, calls model helpers, returns the standard response envelope.
- **models/** — In-memory arrays + CRUD helper functions. No Express objects here.

**server.js** wires middleware globally (`logger`, `express.json()`, CORS for `http://localhost:5173`) and mounts all routers under `/api`.

### Frontend structure

```
frontend/src/
├── App.js                 ← React Router v7, RequireAuth/RequireRole guards
├── index.css              ← design tokens, dark + light theme, all component styles
├── services/
│   ├── api.js             ← fetch wrapper, auto-attaches x-user-role + x-user-id
│   ├── auth.js            ← login (fetches settings + applies theme), logout, getMe
│   ├── problems.js        ← listProblems, getProblem, createProblem, updateProblem, deleteProblem
│   ├── conversations.js   ← createConversation, endConversation
│   ├── messages.js        ← sendMessage
│   └── settings.js        ← getSettings, updateSettings
├── components/
│   ├── Navbar.jsx         ← theme toggle (localStorage + data-theme), 🤖 brand
│   ├── Footer.jsx
│   ├── Layout.jsx         ← Navbar + main content + Footer
│   ├── PageLoader.jsx     ← spinner used for all async operations
│   ├── RequireAuth.jsx    ← redirect to /login if no localStorage user
│   ├── RequireRole.jsx    ← redirects if user's role not in allowed list
│   ├── StatCard.jsx       ← reusable feature card (icon + title + description)
│   ├── MessageBubble.jsx  ← chat bubble with syntax-highlighted code blocks + copy button
│   ├── ProblemsTable.jsx  ← problems data table with solved status
│   ├── DifficultyPill.jsx ← colored difficulty badge (easy/medium/hard)
│   ├── Toast.jsx          ← success/error notification, fixed bottom-right, 3s auto-dismiss
│   └── …
└── pages/
    ├── Login.jsx          ← email + password, validation, theme apply on success
    ├── Register.jsx       ← name + email + password + role (candidate/company)
    ├── Dashboard.jsx      ← CandidateDashboard / CompanyDashboard / AdminDashboard
    ├── ProblemDetail.jsx  ← 3-panel layout, Socket.IO AristoBot, real Claude responses, chat history
    ├── AddProblem.jsx     ← create problem form (admin + company)
    ├── EditProblem.jsx    ← edit problem form (admin + company)
    ├── UsersPage.jsx      ← admin CRUD + modal + last-admin guard
    └── Settings.jsx       ← 4 fields, theme radio syncs with Navbar
```

### Auth middleware pattern

`auth.js` exports a factory: `auth(['admin', 'company'])` returns an Express middleware that reads `x-user-role` from the request header and returns 403 if the role isn't in the allowed list.

"Own" access is checked inside the controller by comparing the resource's `userId` to `x-user-id`.

### Theme system

- CSS custom properties under `[data-theme="dark"]` (default) and `[data-theme="light"]`
- `data-theme` attribute lives on `<html>`
- Touch points: login (from API settings), Navbar toggle (live), Settings save (persist)
- `localStorage` key: `aristosolve_theme`

### Model layer pattern

**Phase 2 (current):** Sequelize ORM models in `backend/models/`. Models: User, Admin, Problem, Conversation, Message, Progress, Evaluation, Settings. Each model maps to a MySQL table. Controllers use async Sequelize queries (`findAll`, `findByPk`, `create`, `update`, `destroy`). Data persists after server restart.

**Legacy (Phase 1):** In-memory arrays remain in `backend/models/legacy/` for reference only — not used by any active controller.

---

## Standard Response Envelope

Every endpoint must return this shape:

```json
// Success
{ "success": true, "data": {}, "error": null }

// Error
{ "success": false, "data": null, "error": { "code": "ERROR_CODE", "message": "...", "details": {} } }
```

| Code             | Status | When                      |
|------------------|--------|---------------------------|
| VALIDATION_ERROR | 400    | Missing/invalid fields    |
| NOT_FOUND        | 404    | ID not in array           |
| FORBIDDEN        | 403    | Role not permitted        |
| INTERNAL_ERROR   | 500    | Unexpected error          |

---

## Roles

| Role      | Permissions |
|-----------|-------------|
| admin     | Full CRUD on all resources |
| company   | Create/update/delete own problems; view evaluations of their candidates |
| candidate | Read problems (public only); own conversations, progress, evaluations |

Auth is simulated via the `x-user-role` request header. Frontend attaches it automatically from localStorage.

---

## Data Models

### users
```json
{ "userId": 1, "firstName": "", "lastName": "", "email": "", "password": "", "userRole": "admin|company|candidate", "level": "beginner|intermediate|advanced", "createDate": "", "updateDate": "" }
```

### problems
```json
{ "id": 1, "title": "", "difficulty": "easy|medium|hard", "topic": "arrays|trees|graphs|dp|strings|...", "type": "algorithm|system-design|debugging", "description": "", "constraints": "", "examples": [], "testCases": [{ "label": "", "stdin": "", "expected": "" }], "starterCode": { "python": "", "javascript": "", "java": "" }, "evalPrompt": "", "isPublic": true, "createdBy": 1, "createdAt": "" }
```

### conversations / messages / evaluations / progress
See original data model definitions — unchanged from Assignment 2.

### settings
```json
{ "userId": 1, "displayName": "", "email": "", "theme": "dark|light", "emailNotifications": true }
```

---

## API Routes

All routes are under `/api`. Key access rules:

### Users
| Method | Path          | Access              |
|--------|---------------|---------------------|
| GET    | /users        | admin, company      |
| GET    | /users/me     | own (x-user-id)     |
| GET    | /users/:id    | admin, own          |
| POST   | /users        | public              |
| PUT    | /users/:id    | admin, own          |
| DELETE | /users/:id    | admin               |

### Problems
| Method | Path          | Access                                |
|--------|---------------|---------------------------------------|
| GET    | /problems     | all (filtered by role)                |
| GET    | /problems/:id | all (403 if candidate + private)      |
| POST   | /problems     | admin, company                        |
| PUT    | /problems/:id | admin; company (own only)             |
| DELETE | /problems/:id | admin; company (own only)             |

### Auth
| Method | Path         | Access |
|--------|--------------|--------|
| POST   | /auth/login  | public |
| POST   | /auth/logout | public |

### Settings
| Method | Path      | Access |
|--------|-----------|--------|
| GET    | /settings | own    |
| PUT    | /settings | own    |

### Conversations / Messages / Evaluations / Progress
- Conversations POST: admin, candidate, company
- Conversations GET /:id: admin, candidate, company
- Conversations PUT: admin, candidate, company (endedAt)
- Messages POST: admin, candidate, company (own conv)
- Progress POST: admin, candidate, company (own or assigned)
- Evaluations POST: admin only

---

## Validation Rules

POST and PUT must validate:
- Required fields present and non-empty
- `userRole`: `admin | company | candidate`
- `difficulty`: `easy | medium | hard`
- `status` (progress): `in_progress | completed`
- `role` (message): `user | assistant`
- `language` (conversation): `python | java | javascript`
- Route `:id` params must be numeric

Special rules:
- Cannot delete the last admin account (`adminCount <= 1`)
- Company can only edit/delete their own problems (`problem.createdBy === x-user-id`)
- Candidate cannot access private problems (`isPublic: false`)

---

## Mock Data (seed users)

| userId | Name | Email | Password | Role |
|--------|------|-------|----------|------|
| 1 | Alice Admin | alice@example.com | admin123 | admin |
| 2 | Bob Builder | bob@example.com | company123 | company |
| 3 | Carol Chen | carol@example.com | candidate123 | candidate |
| 4 | Dave Dev | dave@example.com | candidate123 | candidate |
| 5 | Eva Evans | eva@example.com | candidate123 | candidate |

---

## Testing (Playwright E2E)

Install: `cd frontend && npm install --save-dev @playwright/test && npx playwright install`
Run: `cd frontend && npx playwright test` (requires both servers running)
Demo video: `cd frontend && npx playwright test tests/demo-video.spec.js --config=playwright.demo.config.js`

### Test Suite

#### Auth (`tests/01-auth.spec.js`)
| # | Test | Status |
|---|---|---|
| 1 | Candidate login → dashboard | ✅ |
| 2 | Company login → company dashboard | ✅ |
| 3 | Admin login → admin dashboard | ✅ |
| 4 | Wrong password → error message shown | ✅ |
| 5 | Logout → redirect to /login | ✅ |
| 6 | Register new candidate → auto-login → dashboard | ✅ |

#### Candidate Flow (`tests/02-candidate.spec.js`)
| # | Test | Status |
|---|---|---|
| 7 | Dashboard shows problems table with difficulty pills | ✅ |
| 8 | Click problem → 3-panel ProblemDetail page | ✅ |
| 9 | Send message → typing indicator → AristoBot reply | ✅ |
| 10 | Submit → navigate back to dashboard | ✅ |
| 11 | Return to same problem → chat history loads | ✅ |

#### Company Flow (`tests/03-company.spec.js`)
| # | Test | Status |
|---|---|---|
| 12 | Login as company → see My Problems + Evaluations tables | ✅ |
| 13 | Create a problem → appears in My Problems | ✅ |
| 14 | Assign problem to candidate with deadline | ✅ |
| 15 | Evaluation modal shows score + dimension bars | ⏭ skipped (no evaluations yet — run candidate submit first) |

#### Admin Flow (`tests/04-admin.spec.js`)
| # | Test | Status |
|---|---|---|
| 16 | Login as admin → see all problems + all users | ✅ |
| 17 | Create user via modal → appears in table | ✅ |
| 18 | Edit user → saves correctly | ✅ |
| 19 | Delete non-admin user → row removed | ✅ |
| 20 | Cannot delete last admin → error shown | ✅ |

#### Settings (`tests/05-settings.spec.js`)
| # | Test | Status |
|---|---|---|
| 21 | Change display name → PUT request succeeds | ✅ |
| 22 | Toggle theme → dark/light switch works | ✅ |

#### Problems CRUD (`tests/06-problems-crud.spec.js`)
| # | Test | Status |
|---|---|---|
| 23 | Company creates problem → visible in dashboard | ✅ |
| 24 | Company edits problem → updated title shows | ✅ |
| 25 | Company deletes problem → removed from table | ⏭ skipped (no problems in table after previous run deleted them) |
| 26 | Private problem inaccessible to unassigned candidate | ✅ |

---

## Deployment (Final Project) ✅ COMPLETE

### Live URLs

| Item | URL |
|---|---|
| **Public website** | https://aristosolve.onrender.com |
| **Backend API** | https://aristosolve.onrender.com/api |
| **AWS RDS endpoint** | `aristo.cjkq8eiikl4n.eu-north-1.rds.amazonaws.com` |
| **DB name** | `aristosolve` |
| **DB user** | `admin` |

### Approach — Monolithic (Express serves React build)

Express serves the compiled React app as static files. One Render Web Service handles both frontend and backend.

```
Render Web Service (backend/)
  ├── /api/* → Express API routes
  ├── /socket.io → Socket.IO
  └── /* → serves frontend/build/index.html (React SPA)
```

### What's deployed ✅

- ✅ AWS RDS MySQL (eu-north-1) — created, firewall open, seeded
- ✅ Render Web Service — live at https://aristosolve.onrender.com
- ✅ All env vars set on Render (DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, ANTHROPIC_API_KEY, JWT_SECRET)
- ✅ `frontend/build/` committed to git — Express serves it as static files
- ✅ Socket.IO CORS fixed — uses `process.env.FRONTEND_URL` (not hardcoded localhost)
- ✅ Frontend socket URL fixed — uses `window.location.origin` in production
- ✅ Claude evaluation is fire-and-forget — submit navigates instantly, evaluation runs in background

### Render Web Service settings

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Build command | `npm install` |
| Start command | `node src/server.js` |

### Re-seed the production database

```bash
cd backend
npm run seed
```

> This runs against whatever `DB_HOST` is in `backend/.env` — make sure it points to the RDS endpoint.

### Update production after frontend changes

```bash
cd frontend && npm run build
cd .. && git add -f frontend/build/ && git commit -m "rebuild frontend" && git push
```

Render redeploys automatically on every push to `master`.

### Submission requirements (from deployment PDF)

| Item | Value |
|---|---|
| Public website URL | https://aristosolve.onrender.com |
| Backend URL | https://aristosolve.onrender.com (monolithic) |
| AWS RDS endpoint | `aristo.cjkq8eiikl4n.eu-north-1.rds.amazonaws.com` |
| Database username | `admin` |
| Database password | (in `backend/.env` — do not commit) |

### Running tests against production

```powershell
# Full suite against production
$env:BASE_URL="https://aristosolve.onrender.com"; cd frontend; npx playwright test

# Single test
$env:BASE_URL="https://aristosolve.onrender.com"; cd frontend; npx playwright test tests/evaluation-scenario.spec.js --headed

# Locally (both servers must be running)
cd frontend; npx playwright test
```

> Tests that create/delete data affect the real production DB. Re-seed with `cd backend && npm run seed` after test runs if needed.

### Presentation checklist

| # | Required step | AristoSolve flow |
|---|---|---|
| 1 | Create new user | Register page → new candidate |
| 2 | Log in | Login with new credentials |
| 3 | Navigate to main page | Dashboard with problems |
| 4 | Primary feature | Open problem → write code |
| 5 | AI feature | Chat with AristoBot (real Claude) |
| 6 | WebSocket | Typing indicator + real-time reply |
| 7 | Settings page | Navigate to Settings |
| 8 | Modify a setting | Change display name → Save |
| 9 | Navigation bar | Click Dashboard link |
| 10 | Log out | Logout → /login |

Run rehearsal: `cd frontend && npx playwright test tests/presentation-demo.spec.js --headed`
Run evaluation scenario: `$env:BASE_URL="https://aristosolve.onrender.com"; cd frontend; npx playwright test tests/evaluation-scenario.spec.js --headed`

---

## Final Project — 100/100 Plan

### What the grader checks (from PDF)

| # | Required | Sub-requirement | AristoSolve action |
|---|---|---|---|
| 1 | Create new user | Show invalid input handling | Submit empty Register form → `⚠ Required` errors appear |
| 2 | Log in | Show wrong password handling | Type wrong password → `✖ Invalid email or password` banner |
| 3 | Navigate to main page | — | Auto-redirect to `/dashboard` after login |
| 4 | Primary feature | CREATE + UPDATE + DELETE DB call | Add problem → Edit problem → Delete problem |
| 5 | AI feature | Show empty/invalid input handling | Try send with empty chat → button stays disabled (greyed out) |
| 6 | WebSocket | Show live update | Open 2nd tab on same problem → typing indicator + reply appear in both |
| 7 | Settings page | — | Click Settings in navbar |
| 8 | Modify setting | — | Change display name → Save |
| 9 | Navbar navigation | Navigate to another page | Click Dashboard in navbar |
| 10 | Log out | — | Click Logout → redirect to `/login` |

---

### Exact 3-Minute Demo Script ✅ Tested & Verified (27s on Render)

**Role: Company user (register fresh on presentation day)**

| Clock | Action | Requirement |
|---|---|---|
| 0:00–0:15 | Go to `/register`, click "Create account" with empty form → red `⚠ Required` errors appear | Step 1 — invalid input |
| 0:15–0:30 | Fill valid company account → submit → auto-login → dashboard | Step 1 — **CREATE** user |
| 0:30–0:40 | Logout → Login page → type wrong password → `✖` error banner | Step 2 — wrong password |
| 0:40–0:50 | Enter correct password → company dashboard loads | Step 2 — login |
| 0:50–1:00 | Point at company dashboard ("main application page") | Step 3 |
| 1:00–1:10 | Click "+ Add Problem" → fill title + description → "Create Problem" → appears in My Problems | Step 4 — **CREATE** |
| 1:10–1:20 | Click "Edit" → change title → Save → updated title shows in table | Step 4 — **UPDATE** |
| 1:20–1:35 | Click on the edited problem title → ProblemDetail opens | Step 4 continued |
| 1:35–1:45 | Click send with empty chat input → send button stays grey/disabled | Step 5 — invalid AI input |
| 1:45–2:05 | Type a real message → AristoBot typing indicator → reply appears | Step 5 — AI feature |
| 2:05–2:20 | Open **2nd browser tab** on same problem URL → send message in tab 1 → reply appears in **both tabs** | Step 6 — WebSocket |
| 2:20–2:25 | Click "← Problems" to exit ProblemDetail → back to dashboard | Navigation |
| 2:25–2:30 | Click Settings in navbar | Step 7 |
| 2:30–2:40 | Change display name → "Save changes" → toast appears | Step 8 |
| 2:40–2:45 | Click Dashboard in navbar | Step 9 |
| 2:45–2:55 | Click "Delete" on the problem → confirm → row disappears | Step 4 — **DELETE** |
| 2:55–3:00 | Click Logout → `/login` | Step 10 |

> **Note:** DELETE is shown after returning to the dashboard (step 9) because ProblemDetail has no navbar. This is the natural flow a real user would follow.

---

### MySQL Workbench 40-Second Demo

Pre-save a connection in Workbench before presentation day:

| Field | Value |
|---|---|
| Connection name | AristoSolve RDS |
| Hostname | `aristo.cjkq8eiikl4n.eu-north-1.rds.amazonaws.com` |
| Port | `3306` |
| Username | `admin` |
| Password | (save in keychain) |
| Default schema | `aristosolve` |

During the 40 seconds, run these two queries to show DB was updated:
```sql
SELECT userId, firstName, lastName, email, userRole, createDate FROM users ORDER BY createDate DESC LIMIT 5;
SELECT id, role, content, createdAt FROM messages ORDER BY createdAt DESC LIMIT 5;
```

This shows: the new user registered during the demo + the AristoBot messages from the chat.

---

### Bugs found and fixed during E2E testing

| Bug | Root cause | Fix |
|---|---|---|
| Company couldn't delete own problems | `DELETE /problems/:id` route had `auth(['admin'])` — company role was excluded | Changed to `auth(['admin', 'company'])` in `backend/src/routes/problems.js` |

### Before Presentation Day Checklist

- [ ] **Render cold start** — Render free tier sleeps after 15 min. Open https://aristosolve.onrender.com 2 minutes before presenting so it's warm when the grader's computer connects.
- [ ] **Re-seed the DB** — Run `cd backend && npm run seed` so the demo starts with clean seed data (no leftover test records from Playwright runs).
- [ ] **Save MySQL Workbench connection** — Pre-configure the RDS connection so you don't type credentials live.
- [ ] **Pre-open 2nd tab** — Have the problem URL ready in a second tab before the WebSocket demo moment (step 6).
- [ ] **Submit credentials form** — Fill the submission form with: URL, RDS endpoint, username, password.
- [ ] **Run E2E test** — Verify the live app passes all 10 steps before walking in.

### Verify with E2E test

After any change, run the full 10-step presentation test against production:

```powershell
$env:BASE_URL="https://aristosolve.onrender.com"; cd frontend; npx playwright test tests/evaluation-scenario.spec.js --headed
```

Expected: `1 passed` in ~30 seconds. This test covers all 10 required presentation steps exactly as the grader will check them. If it fails, do not present until fixed.

---

## Out of Scope (Phase 2 — now complete)

The following are deferred post-submission good-to-have features:
- Monaco editor (replace `<textarea>` in ProblemDetail)
- Piston live code execution (Run button + Output tab)
- Progress page (route + UI for candidate progress statistics)
- Evaluation report page (candidate views their own AI nativeness score)
- JWT real auth (replace header-based mock auth with bcrypt + JWT)
- Timed multi-question test assignment (see design in CLAUDE.md "Good to Have")
