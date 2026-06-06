# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Backend (port 3000)
npm start        # Run server (node server.js)
npm run dev      # Run with nodemon (auto-restart on file changes)

# Frontend (port 5173)
cd client && npm start
```

No test runner is configured. Test endpoints manually using the Postman collection at [docs/AristoSolve.postman_collection.json](docs/AristoSolve.postman_collection.json), or with curl passing `-H "x-user-role: admin" -H "x-user-id: 1"`.

---

## What This Is

AristoSolve is a full-stack AI-guided problem-solving platform (think NeetCode). Users write code in a built-in editor and simultaneously chat with an AI mentor (AristoBot) that guides their thinking without giving answers directly.

- Runtime: Node.js + Express (backend) + Create React App (frontend, NOT Vite)
- Backend port: 3000 — Base URL: `http://localhost:3000`
- Frontend port: 5173 — set via `PORT=5173` in `client/package.json`
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

### Phase 2 — Full Product (after submission)

Each feature is **additive** — nothing from Phase 1 gets rewritten, only extended.

| Feature | Replaces / Extends |
|---|---|
| Monaco editor | `<textarea>` in ProblemDetail |
| Piston live execution | Add Run button + Output tab |
| Progress page | New page, `/api/progress` already exists |
| SSE streaming AristoBot | Replace mocked replies in ProblemDetail |
| MySQL / real auth | Backend swap, frontend unchanged |

---

## Architecture

The codebase follows a strict three-layer separation:

- **routes/** — Express Router only. No logic. Wires HTTP methods + paths to controller functions, and applies `auth()` middleware where needed.
- **controllers/** — All request/response logic. Reads `req`, calls model helpers, returns the standard response envelope.
- **models/** — In-memory arrays + CRUD helper functions. No Express objects here.

**server.js** wires middleware globally (`logger`, `express.json()`, CORS for `http://localhost:5173`) and mounts all routers under `/api`.

### Frontend structure

```
client/src/
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
- Conversations POST: admin, candidate
- Conversations PUT: admin, candidate (endedAt)
- Messages POST: admin, candidate (own conv)
- Progress POST: admin, candidate (own)
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

## Out of Scope (this assignment)

Real AI chat, MySQL, JWT/password auth, file uploads, WebSockets, Monaco editor, Piston execution, Progress page.
