# AristoSolve — Frontend

React frontend for the AristoSolve AI-guided problem-solving platform.

---

## Running the app

You need **both** the backend and frontend running at the same time.

### 1. Start the backend (from the project root)

```bash
npm run dev
```

Runs on **http://localhost:3000**

### 2. Start the frontend (from the `client/` folder)

```bash
cd client
npm start
```

Runs on **http://localhost:5173**

> **Note:** The assignment spec mentions port 3000, but this frontend runs on **5173** to avoid conflicting with the backend. Both ports are configured — the backend has CORS enabled for `localhost:5173`, and CRA's proxy forwards all `/api` requests to `localhost:3000`.

---

## Login credentials (mock data)

| Name | Email | Password | Role |
|---|---|---|---|
| Alice Admin | alice@example.com | admin123 | admin |
| Bob Builder | bob@example.com | company123 | company |
| Carol Chen | carol@example.com | candidate123 | candidate |
| Dave Dev | dave@example.com | candidate123 | candidate |
| Eva Evans | eva@example.com | candidate123 | candidate |

---

## Pages

| Route | Page | Access |
|---|---|---|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | Dashboard — role-aware (candidate / company / admin) | All roles |
| `/problems/new` | Add Problem | admin, company |
| `/problems/:id/edit` | Edit Problem | admin, company |
| `/problems/:id` | Problem detail + AristoBot chat (3-panel) | Logged in |
| `/users` | Users management (CRUD) | admin only |
| `/settings` | Settings — display name, email, theme, notifications | Logged in |

---

## Tech stack

- React 19 + React Router v7 (Create React App — not Vite)
- Plain CSS (no Tailwind, no UI library) — design tokens in `src/index.css`
- Dark/light theme via CSS custom properties + `data-theme` on `<html>`
- No Redux — `localStorage` only for session and theme
- `src/services/api.js` — single fetch wrapper (auto-injects `x-user-id` + `x-user-role` headers)

---

## Screenshots

| File | Shows |
|---|---|
| `screenshots/01-login.png` | Login page |
| `screenshots/02-dashboard-admin.png` | Admin dashboard |
| `screenshots/03-dashboard-table.png` | Problems table |
| `screenshots/04-settings.png` | Settings page |
| `screenshots/05-problem-detail.png` | 3-panel problem solver |
| `screenshots/06-dashboard-company.png` | Company dashboard |

---

## Project structure

```
src/
├── App.js                  ← routes + RequireAuth/RequireRole guards
├── index.css               ← design tokens + global styles (dark + light theme)
├── services/
│   ├── api.js              ← fetch wrapper, localStorage helpers
│   ├── auth.js             ← login (applies theme from settings) / logout / getMe
│   ├── problems.js         ← listProblems, getProblem, createProblem, updateProblem, deleteProblem
│   ├── conversations.js    ← createConversation, endConversation
│   ├── messages.js         ← sendMessage
│   └── settings.js         ← getSettings, updateSettings
├── components/
│   ├── RequireAuth.jsx     ← redirects to /login if no session
│   ├── RequireRole.jsx     ← redirects to /dashboard if role not allowed
│   ├── Layout.jsx          ← Navbar + Footer wrapper
│   ├── Navbar.jsx          ← 🤖 brand, theme toggle (☀️/🌙), logout
│   ├── Footer.jsx
│   ├── StatCard.jsx        ← reusable card (×3 on candidate Dashboard)
│   ├── MessageBubble.jsx   ← chat bubble (×N in AristoBot chat)
│   ├── ProblemsTable.jsx   ← data table (candidate view)
│   ├── DifficultyPill.jsx  ← Easy / Medium / Hard badge
│   ├── Toast.jsx           ← success/error notification, auto-dismiss 3s
│   └── PageLoader.jsx      ← spinner for async loading states
└── pages/
    ├── Login.jsx
    ├── Register.jsx
    ├── Dashboard.jsx       ← CandidateDashboard / CompanyDashboard / AdminDashboard
    ├── ProblemDetail.jsx   ← 3-panel: description | code+tests | AristoBot
    ├── AddProblem.jsx      ← create problem (admin + company)
    ├── EditProblem.jsx     ← edit problem (admin + company)
    ├── UsersPage.jsx       ← user CRUD with modal + inline delete (admin only)
    └── Settings.jsx        ← 4 fields, theme radio syncs with Navbar
```
