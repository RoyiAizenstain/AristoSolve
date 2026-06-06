# AristoSolve — UI Documentation (Phase 1 Implemented)

This document describes the **implemented** UI as of Assignment 3 (Phase 1). It reflects actual code, not aspirational specs.

---

## Design System

### Theme System

Two themes: `dark` (default) and `light`. Applied via `data-theme` attribute on `<html>`.

**Dark theme (default):**
```css
--bg:          #0f0f1a
--surface:     #1e1e2e
--surface-2:   #2a2a3e
--surface-3:   #353550
--border:      #2e2e42
--text:        #e2e8f0
--muted:       #94a3b8
--subtle:      #475569
--accent:      #4f46e5
--accent-hover:#4338ca
--accent-bg:   #1e1b4b
--error:       #ef4444
--error-bg:    #450a0a
--success:     #22c55e
--success-bg:  #14532d
```

**Light theme (`[data-theme="light"]`):**
```css
--bg:        #f8fafc
--surface:   #ffffff
--surface-2: #f1f5f9
--surface-3: #e2e8f0
--border:    #cbd5e1
--text:      #0f172a
--muted:     #475569
--subtle:    #94a3b8
```

Theme persistence:
- `localStorage` key: `aristosolve_theme`
- Applied on: login (from API settings), Navbar toggle (live), Settings save
- Toggle button in Navbar: ☀️ (switch to light) / 🌙 (switch to dark)

### Typography
```css
font-family: Inter, system-ui, -apple-system, sans-serif;
--text-xs:   12px
--text-sm:   13px
--text-base: 15px
--text-lg:   17px
--text-xl:   20px
--text-2xl:  24px
--text-3xl:  30px
```

### Difficulty Pills
```css
.pill-easy   { background: #14532d; color: #4ade80 }
.pill-medium { background: #431407; color: #fb923c }
.pill-hard   { background: #450a0a; color: #f87171 }
```

---

## Branding

- Logo: 🤖 AristoSolve (replaces ◆ from original plan)
- Browser tab favicon: 🤖 emoji SVG via `<link rel="icon">` in `index.html`
- AristoBot icon: 🤖 in MessageBubble and ProblemDetail empty state

---

## Component: PageLoader

New component — used for all async loading states throughout the app.

```jsx
// client/src/components/PageLoader.jsx
export default function PageLoader({ message = 'Loading…' }) {
  return (
    <div className="page-loader">
      <div className="page-loader-spinner" />
      <span className="page-loader-text">{message}</span>
    </div>
  );
}
```

Styles: spinning border animation, centered, visible in both themes.

---

## Component: Navbar

```
┌──────────────────────────────────────────────────────────────────────┐
│  🤖 AristoSolve    [Dashboard]  [Settings]   Royi  ☀️/🌙  Logout   │
│  height: 56px  bg: var(--surface)  border-bottom: 1px var(--border) │
└──────────────────────────────────────────────────────────────────────┘
```

- 🤖 brand → `/dashboard`
- Theme toggle button (☀️ or 🌙 depending on current theme)
- Active link: `color: var(--accent)`, `border-bottom: 2px solid var(--accent)`
- Right side: `firstName + lastName` from localStorage
- Logout: clears localStorage → `/login`

Nav links by role:
| Link | Candidate | Company | Admin |
|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ✅ |

---

## Component: RequireRole

```jsx
// Used in App.js to gate routes by role
<RequireRole roles={['admin', 'company']}>
  <AddProblem />
</RequireRole>
```

Redirects to `/dashboard` if user's role is not in the `roles` array.

---

## Routes (App.js)

```
/               → redirect to /dashboard
/login          → Login (public)
/register       → Register (public)
/dashboard      → Dashboard (RequireAuth, role-aware)
/problems/new   → AddProblem (RequireAuth + RequireRole admin,company)
/problems/:id/edit → EditProblem (RequireAuth + RequireRole admin,company)
/problems/:id   → ProblemDetail (RequireAuth)  ← must be AFTER /new and /:id/edit
/users          → UsersPage (RequireAuth + RequireRole admin)
/settings       → Settings (RequireAuth)
```

Route ordering matters: `/problems/new` and `/problems/:id/edit` must be defined before `/problems/:id` to prevent the `:id` param from capturing "new" or ":id/edit".

---

## File Structure (actual)

```
client/
├── public/
│   └── index.html            ← title "AristoSolve", 🤖 emoji favicon
└── src/
    ├── App.js                ← routing + guards
    ├── index.js
    ├── index.css             ← design tokens, dark + light theme, all component styles
    │
    ├── services/
    │   ├── api.js            ← fetch wrapper, auto x-user-id + x-user-role headers
    │   ├── auth.js           ← login (applies theme from settings), logout, getMe
    │   ├── problems.js       ← listProblems, getProblem, createProblem, updateProblem, deleteProblem
    │   ├── conversations.js  ← createConversation, endConversation
    │   ├── messages.js       ← sendMessage
    │   └── settings.js       ← getSettings, updateSettings
    │
    ├── components/
    │   ├── Navbar.jsx        ← theme toggle, 🤖 brand
    │   ├── Footer.jsx
    │   ├── Layout.jsx        ← Navbar + main content + Footer
    │   ├── RequireAuth.jsx   ← redirect to /login if no localStorage user
    │   ├── RequireRole.jsx   ← redirect to /dashboard if role not in allowed list
    │   ├── StatCard.jsx      ← reusable feature card (icon + title + description)
    │   ├── MessageBubble.jsx ← chat bubble (user = accent right, ai = surface-2 left + 🤖)
    │   ├── ProblemsTable.jsx ← candidate problems table with solved status
    │   ├── DifficultyPill.jsx
    │   ├── Toast.jsx         ← success/error notification, fixed bottom-right, 3s auto-dismiss
    │   └── PageLoader.jsx    ← spinner for async loading states
    │
    └── pages/
        ├── Login.jsx         ← email + password, validation, theme apply on success
        ├── Register.jsx      ← name + email + password + role (candidate/company)
        ├── Dashboard.jsx     ← 3 role-specific sub-components
        ├── ProblemDetail.jsx ← 3-panel layout, no Navbar (custom topbar)
        ├── AddProblem.jsx    ← create problem form
        ├── EditProblem.jsx   ← edit problem form (pre-filled)
        ├── UsersPage.jsx     ← admin CRUD with modal + inline delete
        └── Settings.jsx      ← 4 fields, theme radio syncs with Navbar
```

---

## Page: Login (`/login`)

Centered card, no Navbar/Footer.

- Email + password fields with validation
- Loading spinner on button while API call in flight
- On success: fetches `/api/settings`, applies theme from `settings.theme` to `data-theme` + `localStorage`, stores user in localStorage, navigates to `/dashboard`
- On failure: red error banner

---

## Page: Register (`/register`)

Centered card, no Navbar/Footer.

- First name, last name, email, password, role (candidate | company radio)
- Admin role not selectable from registration
- On success: auto-login → `/dashboard`

---

## Page: Dashboard (`/dashboard`)

Role-aware — renders one of three sub-components based on `user.userRole`.

### CandidateDashboard
- Header: difficulty stats (Easy X / Med X / Hard X) + solved ratio
- 3 StatCards: "AI-Guided, Not AI-Solved" | "Mentor, Not Solver" | "Detailed Evaluation"
- ProblemsTable (public problems only, shows solved status from progress records)

### CompanyDashboard
```
Header: "Company Dashboard" | [+ Add Problem] button
─────────────────────────────────────────────────
My Problems table:
  Title | Difficulty | Topic | Type | Visibility (Public/Private pill) | Edit | Delete
  (row click → /problems/:id)

Candidate Evaluations table:
  Candidate name | Email | Problem | Score | Feedback
  (real names resolved by fetching /api/users)
```

### AdminDashboard
```
Header: "Admin Dashboard" | [+ Add Problem] | Easy/Med/Hard/Users stat chips
─────────────────────────────────────────────────────────────────────────────
All Problems table:
  Title | Difficulty | Topic | Type | Visibility | Edit | Delete
  (row click → /problems/:id)

All Users table:
  Name | Email | Role | Level | Joined
```

Edit/Delete buttons use `e.stopPropagation()` to prevent row click navigation.
Delete uses `window.confirm()` dialog.

---

## Page: ProblemDetail (`/problems/:id`)

Full screen, no standard Navbar. Custom top bar.

### Top Bar
```
[← Problems]  Problem Title  [Language ▾]  🕐 MM:SS  [Submit]  [Exit]
```

- Back button and Exit → `/dashboard`
- Language dropdown: Python / JavaScript / Java (swaps starter code)
- Timer: counts up from session start
- Submit: sends final code as last user message + ends conversation + navigates to `/dashboard`

### 3-Panel Layout
```
┌────────────────────┬──────────────────────────┬──────────────────────┐
│  DESCRIPTION       │  CODE EDITOR             │  ARISTOBOT           │
│  flex: 0 0 28%     │  flex: 0 0 42%           │  flex: 1             │
│                    │                          │                      │
│  [Easy] arrays     │  Code ─────────────────  │  [AristoBot] [Guide] │
│                    │  <textarea>              │  ─────────────────   │
│  Two Sum           │  (Tab = 4 spaces)        │  <messages>          │
│  ─────────────────  │                          │                      │
│  description text  │  Test Cases ───────────  │  <input row>         │
│                    │  Case 1: stdin/expected  │  X / 30 messages     │
│  Constraints       │  Case 2: ...             │                      │
│  Examples          │                          │                      │
└────────────────────┴──────────────────────────┴──────────────────────┘
```

Panels require ≥ 1400px viewport width for comfortable use (expected for a coding interface).

### Middle Panel (Code + Tests)
- `<textarea>` with `.pd-code-area` class — monospace, dark background
- Tab key: `e.preventDefault()` + insert 4 spaces via `selectionStart/End` + `requestAnimationFrame`
- Test cases shown below: `label`, `stdin` (Input), `expected` (Expected)

### AristoBot Panel (Right)
Tabs: `AristoBot` (default) | `Guide`

**AristoBot tab:**
- Empty state: 🤖 icon + "I'll guide your thinking, but I won't give you the answer."
- Messages: `MessageBubble` per message (user = accent/right, assistant = surface-2/left)
- Sending spinner bubble while waiting
- Input textarea + send button (↑), disabled while sending
- Auto-scroll to latest message

**Mocked replies** (cycle in order):
```js
const MENTOR_REPLIES = [
  "What's your first instinct when you see this problem?",
  "Good. What would be the time complexity of that approach?",
  "Can you think of a data structure that might help reduce that complexity?",
  "What edge cases should you consider here?",
  "How would your solution handle an empty input?",
  "You're thinking in the right direction. What's the space complexity?",
  "Try to explain your approach as if I had never seen this problem.",
  "What would happen if all elements in the array are the same?",
];
```

**Guide tab:** Shows problem description (same as left panel).

---

## Page: AddProblem (`/problems/new`)

Route-guarded: admin + company only.

Form fields:
- Title (text, required)
- Difficulty (select: easy/medium/hard)
- Topic (select: arrays/trees/graphs/dp/strings/math/other)
- Type (select: algorithm/system-design/debugging)
- Description (textarea, required)
- Constraints (textarea, optional)
- Visibility (radio: Public / Private)
- Starter Code: language tabs (Python / JavaScript / Java), each with a `<textarea>` (Tab = 4 spaces)

On submit: `createProblem({ ...form, starterCode, createdBy: user.userId, examples: [], testCases: [], evalPrompt: '' })` → navigate to `/dashboard`

---

## Page: EditProblem (`/problems/:id/edit`)

Same form as AddProblem, pre-filled with existing problem data.

On mount: `getProblem(id)` → populates form state and `starterCode` object.
On submit: `updateProblem(id, { ...form, starterCode })` → navigate to `/dashboard`

Ownership enforced by backend (company can only edit own problems).

---

## Page: UsersPage (`/users`)

Admin only (RequireRole guard).

```
Header: "Users" + [+ Create User] button
────────────────────────────────────────
Table: Name | Email | Role | Level | Joined | Actions (Edit | Delete)

Delete: inline confirm row (red background), "Yes, delete" / "Cancel"
Edit/Create: opens UserModal
```

### UserModal
- Fields: First name, Last name, Email, Password (create only), Role (radio), Level (radio)
- Validation: all fields required on create, password hidden on edit
- Save button shows spinner while saving

### Last-admin protection
Backend returns 403 if deleting the last admin account. Frontend shows error toast.

---

## Page: Settings (`/settings`)

Centered panel, max-width 640px.

Fields:
1. Display name (text, required)
2. Email (text, required, validated format)
3. Theme (radio: Light | Dark)
4. Notifications (checkbox: "Email me about new assigned tests")

Save button disabled until form is dirty.
On save: applies `data-theme` + `localStorage` so Navbar toggle stays in sync.
Success / error shown via `Toast` component.

---

## Component: MessageBubble

```
AI (role='assistant'):
┌───────────────────────────────────────────┐
│  🤖  What's your first instinct?          │  bg: var(--surface-2)  left-aligned
└───────────────────────────────────────────┘

User (role='user'):
                  ┌────────────────────────┐
                  │  Maybe brute force?    │  bg: var(--accent)  right-aligned
                  └────────────────────────┘
```

Props: `{ role, content, createdAt }`

---

## Component: StatCard

Used 3× on CandidateDashboard.

Props: `{ icon, title, description }`

Instances:
1. 🤖 "AI-Guided, Not AI-Solved" — Nudges your thinking without giving answers.
2. 💬 "Mentor, Not Solver" — AristoBot asks the right questions so you find the answer.
3. 📊 "Detailed Evaluation at the End" — Get scored on your thinking process, not just the result.

---

## Component: ProblemsTable

Used on CandidateDashboard. Public problems only, shows solved status.

```
Status | Problem | Difficulty | Topic | Type
──────────────────────────────────────────
☑      Two Sum   [Easy]       arrays  algo    ← solved: green tinted bg
☐      Inv Tree  [Medium]     trees   algo
```

- Clicking a row → `/problems/:id`
- Props: `{ problems, progress }`

---

## Component: DifficultyPill

```
[Easy]    bg: #14532d  text: #4ade80
[Medium]  bg: #431407  text: #fb923c
[Hard]    bg: #450a0a  text: #f87171
```

Props: `{ difficulty }` — `easy | medium | hard`

---

## Component: Toast

Fixed bottom-right, auto-dismiss after 3000ms.

```
✓  Settings saved     ← success: green
✖  Something failed   ← error: red
```

Props: `{ message, type: 'success' | 'error', onDismiss }`

---

## Auth & State

No Redux. `localStorage` only.

```js
"aristosolve_user"  = { userId, userRole, firstName, lastName }
"aristosolve_theme" = "dark" | "light"
```

- `RequireAuth` — reads localStorage on render, redirects to `/login` if missing
- `api.js` — every request auto-attaches `x-user-id` and `x-user-role` from localStorage
- On logout: clear both keys, navigate to `/login`

---

## Phase 1 Completion Status

| Item | Status |
|---|---|
| Login + Register | ✅ |
| Navbar (theme toggle, 🤖 brand) | ✅ |
| Footer | ✅ |
| Layout + RequireAuth + RequireRole | ✅ |
| Dashboard (3 role views) | ✅ |
| ProblemDetail (3-panel, textarea, AristoBot) | ✅ |
| Add Problem / Edit Problem | ✅ |
| Settings (4 fields, theme sync) | ✅ |
| Users Management (admin CRUD) | ✅ |
| PageLoader component | ✅ |
| 🤖 favicon + tab title | ✅ |
| Dark/light theme system | ✅ |
| Role-based problem visibility | ✅ |
| Last-admin protection | ✅ |

---

## Phase 2 — Deferred Items

| Feature | Current | Phase 2 |
|---|---|---|
| Code editor | `<textarea>` | Monaco editor |
| Live execution | none (no Run button) | Piston API + Output tab |
| AristoBot | Mocked replies | SSE streaming from Claude API |
| Auth | Header-based mock | JWT + real password hashing |
| Database | In-memory arrays | MySQL |
| Progress page | Not implemented | New `/progress` route |
| Mobile layout | Not optimized | Tabbed view for ProblemDetail |
