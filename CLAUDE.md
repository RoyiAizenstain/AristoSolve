# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Phase 1 (current structure)
```bash
# Backend (port 3000)
npm start
npm run dev

# Frontend (port 5173)
cd client && npm start
```

### Phase 2 (after folder restructure — Assignment 4)
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
- Backend port: 3000 — Base URL: `http://localhost:3000`
- Frontend port: 5173 — set via `PORT=5173` in `frontend/package.json`
- Assignment 3: in-memory mock data only, no database

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
- ProblemDetail — 3-panel layout (description | code+tests | AristoBot), `<textarea>` for code, Tab key inserts 4 spaces, mocked AI replies, language selector with per-problem starter code
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

### Phase 2 — Assignment 4 (next)

Each feature is **additive** — nothing from Phase 1 gets rewritten, only extended.

**Always check which phase is active before adding any feature.**

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
| 3 | ✅ Write Sequelize models: User, Problem, Conversation, Message, Progress, Evaluation, Settings |
| 4 | ✅ Write migrations in `backend/migrations/` — one file per table |
| 5 | ✅ Write seeders — 5 users + 5 problems |
| 6 | ✅ Swap all controllers from in-memory helpers → Sequelize queries |
| 7 | ✅ Add at least one JOIN query (Progress + User + Problem for company dashboard) |

Required ORM relationships (A4 requires one-to-many AND many-to-many):
- one-to-many: `User` → `Conversations`, `User` → `Progress`
- many-to-many: `User` ↔ `Problem` via `Progress` (junction table)

**Note on Admin model (A4 requirement):** Assignment 4 lists "Admin" as a required model. In AristoSolve, Admin is NOT a separate table — it is a `User` record where `userRole = 'admin'`. The Sequelize `User` model covers this. When graders ask about the Admin model, point to `User` with the `userRole` enum and the last-admin protection logic in the delete controller.

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

| Item | Content |
|---|---|
| `README.md` | Purpose, install, DB setup, env vars, ORM setup, API endpoints, WebSocket feature, AI feature, known limitations |
| `.env.example` | All required keys, no real values |
| Screenshots | DB tables, CRUD op, ORM relationship, 2 Socket.IO tabs, AI input/output, migrations |
| Demo video | Required for submission |

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
| Progress page | New page, `/api/progress` already exists |
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
├── index.css              ← CSS custom properties for dark + light theme
├── services/
│   ├── api.js             ← fetch wrapper, auto-attaches x-user-role + x-user-id
│   ├── auth.js            ← login (fetches settings + applies theme), logout, getMe
│   ├── problems.js        ← listProblems, getProblem, createProblem, updateProblem, deleteProblem
│   ├── conversations.js
│   ├── messages.js
│   └── settings.js
├── components/
│   ├── Navbar.jsx         ← theme toggle (localStorage + data-theme), 🤖 brand
│   ├── PageLoader.jsx     ← spinner used for all async operations
│   ├── RequireRole.jsx    ← redirects if user's role not in allowed list
│   └── …
└── pages/
    ├── Dashboard.jsx      ← CandidateDashboard / CompanyDashboard / AdminDashboard
    ├── ProblemDetail.jsx  ← 3-panel layout, mocked AristoBot, starter code
    ├── AddProblem.jsx     ← create problem form (admin + company)
    ├── EditProblem.jsx    ← edit problem form (admin + company)
    ├── UsersPage.jsx      ← admin CRUD + modal + last-admin guard
    └── Settings.jsx       ← theme radio syncs with Navbar
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

Each model file exports the in-memory array, a `nextId` counter, and helpers: `findAll`, `findById`, `create`, `update`, `remove`. IDs are numeric auto-incremented. Data resets on server restart.

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

## Out of Scope (Phase 1 — now complete)

The following were out of scope for Assignment 3 and are now targets for Phase 2 (Assignment 4):
MySQL, real AI chat (Claude API), Socket.IO, JWT/password auth, Monaco editor, Piston live execution, Progress page, evaluation report page.
