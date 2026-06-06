# AristoSolve

> AI-guided problem-solving platform that trains *how* you think, not just what you answer.

Inspired by NeetCode — but instead of writing code directly, candidates interact with an AI mentor (AristoBot) that guides them toward the solution through questions and hints, never giving the answer directly. Named after Aristotle (*aristos* = excellence).

This is **Assignment 3**: a full-stack app — Node.js + Express backend (in-memory mock data) + React frontend.

---

## Quick Start

### Prerequisites
- Node.js v18 or higher
- npm (comes with Node.js)

### 1. Clone & install backend

```bash
git clone https://github.com/RoyiAizenstain/AristoSolve.git
cd AristoSolve
npm install
```

### 2. Install frontend

```bash
cd client
npm install
cd ..
```

### 3. Run both servers

Open two terminals:

**Terminal 1 — backend (port 3000)**
```bash
npm run dev
```

**Terminal 2 — frontend (port 5173)**
```bash
cd client
npm start
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

> Note: The assignment spec says port 3000 for the frontend. This project uses CRA (`react-scripts`), which defaults to port 3000. We override it to 5173 via `PORT=5173` in `client/package.json` so both servers can run simultaneously. The backend stays on port 3000.

---

## Test Credentials

| Name | Email | Password | Role |
|---|---|---|---|
| Alice Admin | alice@example.com | admin123 | admin |
| Bob Builder | bob@example.com | company123 | company |
| Carol Chen | carol@example.com | candidate123 | candidate |
| Dave Dev | dave@example.com | candidate123 | candidate |
| Eva Evans | eva@example.com | candidate123 | candidate |

---

## Features (Phase 1 — Assignment 3)

### Authentication
- Login / Register pages with full validation
- Role-based access: `admin`, `company`, `candidate`
- Theme preference applied from user settings on login

### Dashboard (role-aware)
| Role | View |
|---|---|
| **Candidate** | Stats header, 3 feature cards, problems table |
| **Company** | My problems table (Edit/Delete/Add), candidate evaluations with real names |
| **Admin** | All problems table (Edit/Delete/Add), all users table, stat chips |

### Problem Solving
- 3-panel layout: Description | Code Editor + Test Cases | AristoBot
- Tab key inserts 4 spaces in code area
- Language selector (Python / JavaScript / Java) with per-problem starter code
- Live timer, Submit + Exit actions
- AristoBot chat with mocked mentor replies (cycles through 8 Socratic prompts)

### Problem Management (admin + company)
- Add Problem form: title, difficulty, topic, type, description, constraints, visibility, starter code per language
- Edit Problem: pre-filled form, same fields
- Delete: confirm dialog; company can only delete own problems
- Role-based visibility: candidates see only public problems, company sees own + public, admin sees all

### Settings
- Display name, email, theme (light/dark), email notifications
- Theme applies live on save and persists in `localStorage`
- Theme toggle also available in Navbar (sun/moon icon)

### Users Management (admin only)
- Full CRUD: create, edit, delete users via modal / inline confirm
- Cannot delete the last admin account

### UI Details
- Dark/light theme via CSS custom properties + `data-theme` on `<html>`
- 🤖 branding throughout (logo, favicon, AristoBot icon)
- `PageLoader` spinner for all async operations
- CRA frontend, no Vite

---

## Architecture

```
AristoSolve/
├── server.js                    ← entry point, middleware + route mounting
├── routes/                      ← Express Router (no logic)
├── controllers/                 ← request/response logic + validation
├── models/                      ← in-memory arrays + CRUD helpers
├── middleware/
│   ├── auth.js                  ← role-based middleware factory: auth(['admin'])
│   └── logger.js
├── docs/
│   └── AristoSolve.postman_collection.json
└── client/                      ← Create React App frontend
    ├── public/
    │   └── index.html           ← 🤖 emoji favicon, title "AristoSolve"
    └── src/
        ├── App.js               ← React Router routes + RequireAuth/RequireRole
        ├── index.css            ← design tokens + global styles (dark + light theme)
        ├── services/            ← api.js, auth.js, problems.js, conversations.js,
        │                           messages.js, settings.js
        ├── components/          ← Navbar, Footer, Layout, RequireAuth, RequireRole,
        │                           StatCard, MessageBubble, ProblemsTable,
        │                           DifficultyPill, Toast, PageLoader
        └── pages/               ← Login, Register, Dashboard, ProblemDetail,
                                     Settings, UsersPage, AddProblem, EditProblem
```

### Three-layer backend pattern
- **routes/** — wires HTTP verbs + paths to controllers, applies `auth()` middleware
- **controllers/** — reads `req`, calls model helpers, returns standard envelope
- **models/** — in-memory arrays + `findAll / findById / create / update / remove`

### Auth simulation
No real sessions. Mock headers in every request:
- `x-user-role` — checked by `auth()` middleware per route
- `x-user-id` — checked by controllers for "own" access

The React frontend auto-attaches both from `localStorage` via `api.js`.

---

## API

Base URL: `http://localhost:3000`
All routes are prefixed with `/api` (e.g. `GET /api/problems`).

### Standard response envelope

```json
{ "success": true,  "data": {},   "error": null }
{ "success": false, "data": null, "error": { "code": "NOT_FOUND", "message": "..." } }
```

### Endpoints summary

| Resource | GET all | GET one | POST | PUT | DELETE |
|---|---|---|---|---|---|
| `/api/users` | admin, company | admin, own | public | admin, own | admin |
| `/api/users/me` | — | own | — | — | — |
| `/api/auth/login` | — | — | public | — | — |
| `/api/auth/logout` | — | — | public | — | — |
| `/api/problems` | all (filtered by role) | all (role-gated) | admin, company | admin, company | admin |
| `/api/conversations` | admin | admin, own | admin, candidate | admin, candidate | admin |
| `/api/conversations/:id/messages` | admin, own | — | admin, candidate | admin | admin |
| `/api/evaluations` | admin, company | admin, company, own | admin | admin | admin |
| `/api/progress` | admin | admin, own | admin, candidate | admin, own | admin |
| `/api/settings` | — | own | — | own | — |

### Problem visibility rules
- **Candidate**: sees only `isPublic: true`
- **Company**: sees own problems + all public
- **Admin**: sees everything

---

## Testing

### Postman (API testing)
1. Open Postman → **Import** → select `docs/AristoSolve.postman_collection.json`
2. Start backend (`npm run dev`), send any request

### curl examples

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"admin123"}'

# List all problems (admin)
curl http://localhost:3000/api/problems \
  -H "x-user-role: admin" -H "x-user-id: 1"

# Create a problem (company)
curl -X POST http://localhost:3000/api/problems \
  -H "Content-Type: application/json" \
  -H "x-user-role: company" -H "x-user-id: 2" \
  -d '{"title":"Test","difficulty":"easy","topic":"arrays","type":"algorithm","description":"..."}'
```

---

## Screenshots

See the `client/screenshots/` directory:

| File | Shows |
|---|---|
| `01-login.png` | Login page |
| `02-dashboard-admin.png` | Admin dashboard |
| `03-dashboard-table.png` | Problems table |
| `04-settings.png` | Settings page |
| `05-problem-detail.png` | 3-panel problem solver |
| `06-dashboard-company.png` | Company dashboard |

---

## Out of Scope (Phase 2 — post submission)

- Monaco editor (currently `<textarea>`)
- Piston live code execution (no Run button yet)
- SSE streaming for AristoBot (currently mocked replies)
- MySQL / real auth (currently in-memory + header-based)
- Progress page
