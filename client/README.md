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

| Email | Password | Role |
|---|---|---|
| alice@example.com | admin123 | admin |
| bob@example.com | company123 | company |
| carol@example.com | candidate123 | candidate |

---

## Pages

| Route | Page | Access |
|---|---|---|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | Dashboard — problems + stat cards | All roles |
| `/problems/:id` | Problem detail + AristoBot chat | Logged in |
| `/settings` | Settings — display name, email, theme | Logged in |

---

## Tech stack

- React 19 + React Router v7
- Plain CSS (no Tailwind, no UI library) — design tokens in `src/index.css`
- No Redux — `localStorage` only for session
- `src/services/api.js` — single fetch wrapper (auto-injects auth headers)

---

## Project structure

```
src/
├── App.js                  ← routes
├── index.css               ← design tokens + global styles
├── services/
│   ├── api.js              ← fetch wrapper, localStorage helpers
│   ├── auth.js             ← login / logout / getMe
│   ├── problems.js
│   ├── conversations.js
│   ├── messages.js
│   └── settings.js
├── components/
│   ├── RequireAuth.jsx     ← route guard
│   ├── Layout.jsx          ← Navbar + Footer wrapper
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── StatCard.jsx        ← reusable card (×3 on Dashboard)
│   ├── MessageBubble.jsx   ← reusable card (×N in AristoBot chat)
│   ├── ProblemsTable.jsx   ← data table
│   ├── DifficultyPill.jsx  ← Easy / Medium / Hard badge
│   └── Toast.jsx           ← success/error notification
└── pages/
    ├── Login.jsx
    ├── Register.jsx
    ├── Dashboard.jsx
    ├── ProblemDetail.jsx
    └── Settings.jsx
```
