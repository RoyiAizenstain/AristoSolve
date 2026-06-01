# AristoSolve — Full UI Plan

---

## Design System

### Colors (Dark Theme Throughout)

```css
--bg:          #0f0f1a   /* page background */
--surface:     #1e1e2e   /* cards, navbar, panels */
--surface-2:   #2a2a3e   /* inputs, table rows, hover */
--surface-3:   #353550   /* active states, selected rows */
--border:      #2e2e42   /* all borders */
--text:        #e2e8f0   /* primary text, headings */
--muted:       #94a3b8   /* secondary text, labels */
--subtle:      #475569   /* placeholders, meta info */
--accent:      #4f46e5   /* indigo — buttons, links, active */
--accent-hover:#4338ca
--accent-bg:   #1e1b4b   /* accent tint for backgrounds */
--error:       #ef4444
--error-bg:    #450a0a
--success:     #22c55e
--success-bg:  #14532d

/* Difficulty */
--easy-text:   #4ade80
--easy-bg:     #14532d
--medium-text: #fb923c
--medium-bg:   #431407
--hard-text:   #f87171
--hard-bg:     #450a0a
```

### Typography

```css
font-family: Inter, system-ui, -apple-system, sans-serif;

--text-xs:   12px / 400
--text-sm:   13px / 400
--text-base: 15px / 400
--text-lg:   17px / 500
--text-xl:   20px / 600
--text-2xl:  24px / 700
--text-3xl:  30px / 700
```

### Spacing & Shape

```
Spacing scale: 4 8 12 16 20 24 32 48 64px
Border radius: 6px (pills/badges), 8px (inputs/buttons), 10px (cards), 12px (panels)
Shadows: none by default — box-shadow: 0 0 0 1px var(--border) on cards
Transitions: 150ms ease on hover/focus
```

### Component Tokens

```
Navbar height:       56px
Left sidebar width:  240px
Right sidebar width: 280px
Input height:        40px
Button height:       38px
Table row height:    52px
```

---

## Routes

```
/               → redirect to /dashboard
/login          → Login (public)
/register       → Register (public)
/dashboard      → Dashboard (guarded, role-aware)
/problems/:id   → ProblemDetail + AristoBot (guarded, candidate)
/progress       → Progress (guarded, candidate + admin)
/settings       → Settings (guarded, all roles)
```

---

## File Structure

```
client/
├── public/
│   └── index.html
├── src/
│   ├── App.js                    ← routing + RequireAuth
│   ├── index.js
│   ├── index.css                 ← design tokens + global reset
│   │
│   ├── services/
│   │   ├── api.js                ← fetch wrapper (auto-headers)
│   │   ├── auth.js               ← login, logout, getMe
│   │   ├── problems.js
│   │   ├── conversations.js
│   │   ├── messages.js
│   │   ├── evaluations.js
│   │   ├── progress.js
│   │   ├── settings.js
│   │   └── codeRunner.js         ← Piston API live execution
│   │
│   ├── components/
│   │   ├── Navbar.jsx            ← top bar, logo, logout
│   │   ├── Footer.jsx            ← single-line footer
│   │   ├── Layout.jsx            ← Navbar + Footer wrapper
│   │   ├── Sidebar.jsx           ← left nav sidebar
│   │   ├── RequireAuth.jsx       ← redirect if not logged in
│   │   ├── StatCard.jsx          ← reusable card #1
│   │   ├── MessageBubble.jsx     ← reusable card #2
│   │   ├── ProgressCard.jsx      ← reusable card #3
│   │   ├── ProblemsTable.jsx     ← required data table
│   │   ├── DifficultyPill.jsx    ← shared badge component
│   │   └── Toast.jsx             ← success/error notification
│   │
│   └── pages/
│       ├── Login.jsx
│       ├── Register.jsx
│       ├── Dashboard.jsx
│       ├── ProblemDetail.jsx
│       ├── Progress.jsx
│       └── Settings.jsx
│
└── package.json                  ← PORT=5173, proxy: http://localhost:3000
```

---

## Auth & State Strategy

No Redux. localStorage only.

```js
// localStorage key
"aristosolve_user" = {
  userId:    1,
  userRole:  "candidate",
  firstName: "Royi",
  lastName:  "Aizen"
}
```

- `RequireAuth.jsx` — reads localStorage on render, redirects to `/login` if missing
- `api.js` — every request auto-attaches `x-user-id` and `x-user-role` from localStorage
- On logout: clear localStorage, navigate to `/login`

---

## Backend Additions Required

| Endpoint | Purpose |
|---|---|
| `POST /api/auth/login` | email + password → returns user object |
| `POST /api/auth/logout` | no-op, returns success |
| `GET /api/users/me` | returns current user by x-user-id |
| `GET /api/settings` | get per-user settings by x-user-id |
| `PUT /api/settings` | update per-user settings |

All existing routes remounted under `/api` prefix. CORS enabled for `http://localhost:5173`.

---

## Page: Login (`/login`)

### Layout
Centered card on full dark page. No Navbar. No Footer.

### Wireframe
```
┌──────────────────────────────────────────────────────┐
│                   bg: #0f0f1a                        │
│                                                      │
│              ◆  AristoSolve                          │
│        AI-guided problem solving platform            │
│                                                      │
│        ┌────────────────────────────────────┐        │
│        │  surface: #1e1e2e  radius: 12px    │        │
│        │                                    │        │
│        │  Email                             │        │
│        │  ┌──────────────────────────────┐  │        │
│        │  │  you@example.com             │  │        │
│        │  └──────────────────────────────┘  │        │
│        │  ⚠ Please enter a valid email      │        │
│        │                                    │        │
│        │  Password                          │        │
│        │  ┌──────────────────────────────┐  │        │
│        │  │  ••••••••                    │  │        │
│        │  └──────────────────────────────┘  │        │
│        │  ⚠ At least 6 characters           │        │
│        │                                    │        │
│        │  ┌──────────────────────────────┐  │        │
│        │  │   ⟳  Logging in...           │  │        │
│        │  └──────────────────────────────┘  │        │
│        │                                    │        │
│        │  ✖ Invalid email or password        │        │
│        │                                    │        │
│        │  Don't have an account? Register   │        │
│        └────────────────────────────────────┘        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### State
```js
{ email, password, errors: { email, password }, loading, apiError }
```

### Validation
- Email: required, must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Password: required, min 6 characters
- Validated on submit (not on every keystroke)

### Flow
1. Submit → validate → show inline errors if invalid
2. Valid → `POST /api/auth/login` → show spinner on button
3. Success → store user in localStorage → navigate to `/dashboard`
4. Failure → show red apiError banner above button

---

## Page: Register (`/register`)

### Layout
Centered card on full dark page. No Navbar. No Footer.

### Wireframe
```
┌──────────────────────────────────────────────────────┐
│                   bg: #0f0f1a                        │
│                                                      │
│              ◆  AristoSolve                          │
│                                                      │
│        ┌────────────────────────────────────┐        │
│        │                                    │        │
│        │  First name                        │        │
│        │  ┌──────────────────────────────┐  │        │
│        │  │  Royi                        │  │        │
│        │  └──────────────────────────────┘  │        │
│        │                                    │        │
│        │  Last name                         │        │
│        │  ┌──────────────────────────────┐  │        │
│        │  │  Aizen                       │  │        │
│        │  └──────────────────────────────┘  │        │
│        │                                    │        │
│        │  Email                             │        │
│        │  ┌──────────────────────────────┐  │        │
│        │  │  you@example.com             │  │        │
│        │  └──────────────────────────────┘  │        │
│        │                                    │        │
│        │  Password                          │        │
│        │  ┌──────────────────────────────┐  │        │
│        │  │  ••••••••                    │  │        │
│        │  └──────────────────────────────┘  │        │
│        │                                    │        │
│        │  I am a...                         │        │
│        │  ┌──────────────┐ ┌─────────────┐  │        │
│        │  │ ● Candidate  │ │ ○ Company   │  │        │
│        │  └──────────────┘ └─────────────┘  │        │
│        │                                    │        │
│        │  ┌──────────────────────────────┐  │        │
│        │  │      Create account          │  │        │
│        │  └──────────────────────────────┘  │        │
│        │                                    │        │
│        │  Already have an account? Log in   │        │
│        └────────────────────────────────────┘        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### State
```js
{ form: { firstName, lastName, email, password, userRole }, errors, loading, apiError }
```

### Validation
- firstName, lastName: required, non-empty
- Email: required, valid format
- Password: required, min 6 characters
- userRole: one of `candidate | company` (admin not selectable)

### Flow
1. Submit → validate → `POST /api/users`
2. Success → auto-login via `POST /api/auth/login` → navigate to `/dashboard`

---

## Component: Navbar

### Wireframe
```
┌──────────────────────────────────────────────────────────────────────┐
│  ◆ AristoSolve    [Dashboard]  [Progress]  [Settings]   Royi  Logout │
│  height: 56px  bg: #1e1e2e  border-bottom: 1px solid #2e2e42         │
└──────────────────────────────────────────────────────────────────────┘
```

### Details
- Brand `◆ AristoSolve` → navigates to `/dashboard`
- Active link: `color: #4f46e5`, `border-bottom: 2px solid #4f46e5`
- Logout: calls `POST /api/auth/logout` → clear localStorage → `/login`
- Right side: shows `firstName + lastName` from localStorage
- Nav links shown by role:

| Link | Candidate | Company | Admin |
|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ |
| Progress | ✅ | — | ✅ |
| Settings | ✅ | ✅ | ✅ |

---

## Component: Footer

```
┌──────────────────────────────────────────────────────────────────────┐
│       AristoSolve · 2026 · AI mentor that guides your thinking       │
│       height: 48px  bg: #1e1e2e  border-top: 1px #2e2e42             │
└──────────────────────────────────────────────────────────────────────┘
```

Single line, centered, `color: #475569`, `font-size: 13px`.

---

## Component: Sidebar (left navigation)

```
┌───────────────────────┐
│  Menu              ✕  │
│  ─────────────────    │
│                       │
│  ▸ Problems           │  ← all roles
│    Company Tagged     │
│    Cheatsheets        │
│                       │
│  ▸ Progress           │  ← candidate, admin
│                       │
│  ▸ Evaluations        │  ← company, admin
│                       │
│  ▸ Users              │  ← admin only
│                       │
└───────────────────────┘
width: 240px  bg: #1e1e2e  border-right: 1px #2e2e42
Active link: bg #1e1b4b  color #4f46e5
```

---

## Page: Dashboard (`/dashboard`)

### Layout
Three columns: Sidebar (240px) | Main content (flex-1) | Stats sidebar (280px)

### Wireframe
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Navbar                                                                           │
├──────────────┬─────────────────────────────────────────┬────────────────────────┤
│              │                                         │                        │
│  Sidebar     │  AI-Guided Problems                     │  June 2026             │
│  ─────────── │  Practice with an AI mentor.            │  ┌──────────────────┐  │
│              │                                         │  │ S  M  T  W  T  F │  │
│  Problems  ◀ │  Easy 0/2  Med 1/3  Hard 0/3   ◯ 1/8   │  │ 1  2  3  4  5  6 │  │
│  Progress    │                            Solved       │  └──────────────────┘  │
│  Settings    │                                         │                        │
│              │  ┌────────────┐ ┌──────────┐ ┌───────┐ │  Current    Best       │
│              │  │ AI-Guided, │ │ Mentor,  │ │Detail │ │  Streak     Streak     │
│              │  │ Not Solved │ │ Not      │ │Eval   │ │  🔥 0 days  🏆 5 days  │
│              │  └────────────┘ └──────────┘ └───────┘ │                        │
│              │     ↑ StatCard × 3 (reusable card #1)   │  Top 17.4%  8 solved   │
│              │                                         │                        │
│              │  Status  Problem     Diff   Topic  Type │                        │
│              │  ─────────────────────────────────────  │                        │
│              │  ☑        Two Sum    Easy   arrays algo │                        │
│              │  ☐        Inv Tree   Med    trees  algo │                        │
│              │  ☐        LIS        Hard   dp     algo │                        │
│              │  ☐        BFS Path   Med    graphs algo │                        │
│              │  ☐        JS Async   Easy   strings deb │                        │
│              │                                         │                        │
├──────────────┴─────────────────────────────────────────┴────────────────────────┤
│ Footer                                                                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Role-Aware Main Content

| Role | Content |
|---|---|
| **Candidate** | Header stats + 3 StatCards + ProblemsTable (all public problems) |
| **Company** | My Problems table (createdBy=me) + EvaluationsTable (companyId=me) |
| **Admin** | All Problems table + All Users table |

### Right Stats Sidebar (candidate only)
- Mini calendar (display only, highlight today)
- Current Streak / Best Streak
- Difficulty breakdown (Easy X/Y, Med X/Y, Hard X/Y)
- Total solved donut

### Endpoints
- `GET /api/problems`
- `GET /api/evaluations` (company/admin)
- `GET /api/users` (admin)
- `GET /api/progress` (candidate — to compute solved status per problem)

---

## Component: StatCard (reusable card #1)

Used 3× on Dashboard.

```
┌──────────────────────────────┐
│  bg: #1e1e2e  radius: 10px   │
│  border: 1px #2e2e42         │
│                              │
│  [icon]  24px indigo         │
│                              │
│  AI-Guided, Not AI-Solved    │  text-base bold #e2e8f0
│                              │
│  Nudges your thinking        │  text-sm #94a3b8
│  without giving answers.     │
└──────────────────────────────┘
```

Props: `{ icon, title, description }`

The three instances:
1. "AI-Guided, Not AI-Solved" — bot icon
2. "Mentor, Not Solver" — chat icon
3. "Detailed Evaluation at the End" — chart icon

---

## Component: ProblemsTable (required data table)

```
┌──────────────────────────────────────────────────────────────────┐
│  Status  Problem         Difficulty   Topic     Type    History  │
│  header: text-xs #94a3b8 uppercase  border-bottom: 1px #2e2e42  │
├──────────────────────────────────────────────────────────────────┤
│  ☑        Two Sum        [Easy]       arrays    algo    🕐       │  solved: bg #0d1f0d
│  ☐        Invert Tree    [Med]        trees     algo    —        │  hover: bg #2a2a3e
│  ☐        LIS            [Hard]       dp        algo    —        │
└──────────────────────────────────────────────────────────────────┘
```

- Clicking a row → `/problems/:id`
- Solved row: green tinted bg
- History icon: clock if conversation exists for that problem

Props: `{ problems, progress }`

---

## Component: DifficultyPill

```
[Easy]    bg: #14532d  text: #4ade80  radius: 6px  px:8 py:2
[Medium]  bg: #431407  text: #fb923c
[Hard]    bg: #450a0a  text: #f87171
```

Props: `{ difficulty }` — `easy | medium | hard`

---

## Page: ProblemDetail (`/problems/:id`)

### Layout
Full screen, full dark. No standard Navbar. Custom top bar + **three panels** side-by-side (NeetCode style).

### Top Bar
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Problems   Two Sum   [Python ▾]       🕐 08:11    [Run]  [Submit]  [Exit] │
│  bg: #1e1e2e  height: 52px  border-bottom: 1px #2e2e42                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

- `← Problems` → `/dashboard`
- Language dropdown: Python / Java / JavaScript (updates code editor language + starter template)
- Timer: counts up from session start (mm:ss)
- Run: simulated — shows a "Run" toast (no actual execution, out of scope)
- Submit: sends final code as last user message → `PUT /api/conversations/:id` with `endedAt` → `/dashboard`
- Exit: navigate to `/dashboard` without submitting

### Three-Panel Layout
```
┌──────────────────────┬───────────────────────────────┬────────────────────────┐
│  DESCRIPTION         │  CODE EDITOR                  │  ARISTOBOT             │
│  bg: #161622         │  bg: #1e1e2e                  │  bg: #1e1e2e           │
│  width: 320px        │  flex: 1                      │  width: 400px          │
│  overflow-y: auto    │                               │                        │
│                      │  # Write your solution here   │  Guide  Output  AristoBot│
│  [Easy] arrays algo  │  def twoSum(nums, target):    │  ────────────────────  │
│                      │      pass                     │                        │
│  Two Sum             │                               │  (empty state)         │
│  ─────────────────   │                               │                        │
│                      │                               │      ┌──────────┐      │
│  Given an array of   │                               │      │    ◆     │      │
│  integers, return    │                               │      └──────────┘      │
│  indices of two      │                               │                        │
│  numbers that add    │                               │      AristoBot         │
│  up to target.       │                               │                        │
│                      │                               │  I'll guide your       │
│  Constraints         │                               │  thinking, but I won't │
│  • 2 ≤ n ≤ 10^4      │                               │  give you the answer.  │
│  • -10^9 ≤ val       │                               │                        │
│                      │                               │  ──────────────────    │
│  Examples            │                               │  Ask  Guides thinking  │
│  [2,7,11,15], t=9    │                               │                        │
│  → [0,1]             │                               │  ┌──────────────────┐  │
│                      │                               │  │ Ask for a hint.. │[↑]│
│                      │                               │  └──────────────────┘  │
│                      │                               │                        │
│                      │                               │  0 / 30 messages       │
└──────────────────────┴───────────────────────────────┴────────────────────────┘
```

### Code Editor
- Library: `@monaco-editor/react` (VS Code engine, supports Python/Java/JavaScript)
- Theme: `vs-dark` (matches overall dark design)
- Starter templates per language injected when language changes:

```js
const STARTER = {
  python: `def solution():\n    # Write your solution here\n    pass\n`,
  java: `class Solution {\n    public void solution() {\n        // Write your solution here\n    }\n}\n`,
  javascript: `function solution() {\n    // Write your solution here\n}\n`,
};
```

- Code is local state — NOT persisted to backend on every keystroke
- On Submit: final code sent as last user message content before ending conversation

### AristoBot — After Messages
```
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ◆  What's your first instinct on this problem?       │   │  AI: bg #2a2a3e, left
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│              ┌──────────────────────────────────────────┐   │
│              │  Maybe brute force with two nested loops? │   │  User: bg #4f46e5, right
│              └──────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ◆  Good start. What's the time complexity?           │   │
│  └──────────────────────────────────────────────────────┘   │
```

### AristoBot Tabs
| Tab | Content |
|---|---|
| Guide | Problem description (mirrors left panel, useful on mobile) |
| Output | **Live test results** after clicking Run |
| AristoBot | Chat interface (default active) |

### Output Tab — Live Code Execution (Piston API)

When user clicks **Run** in the top bar:
1. Frontend collects `language` + `code` from the editor
2. Calls `codeRunner.runCode(language, code, problem.testCases)` for each test case in parallel
3. Output tab becomes active automatically
4. Results shown as pass/fail per test case

```
┌──────────────────────────────────────────────────────┐
│  Guide      Output ←active      AristoBot            │
│  ─────────────────────────────────────────────────── │
│                                                      │
│  Test Results                        2 / 3 passed    │
│                                                      │
│  ✓  Example 1                                12ms    │
│     Input:    4  /  2 7 11 15  /  target 9           │
│     Expected: 0 1                                    │
│     Output:   0 1                                    │
│                                                      │
│  ✓  Example 2                                10ms    │
│     Input:    3  /  3 2 4  /  target 6               │
│     Expected: 1 2                                    │
│     Output:   1 2                                    │
│                                                      │
│  ✗  Duplicate values              bg: #450a0a  8ms   │
│     Input:    2  /  3 3  /  target 6                 │
│     Expected: 0 1                                    │
│     Output:   []                                     │
│     Stderr:   (none)                                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### codeRunner.js Service

```js
const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

const LANGUAGE_MAP = {
  python:     { language: 'python',     version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  java:       { language: 'java',       version: '15.0.2' },
};

async function runTestCase(language, code, stdin) {
  const { language: lang, version } = LANGUAGE_MAP[language];
  const res = await fetch(PISTON_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: lang,
      version,
      files: [{ content: code }],
      stdin,
    }),
  });
  const data = await res.json();
  return {
    stdout: data.run.stdout.trim(),
    stderr: data.run.stderr.trim(),
    exitCode: data.run.code,
  };
}

export async function runCode(language, code, testCases) {
  return Promise.all(
    testCases.map(async (tc) => {
      const start = Date.now();
      const { stdout, stderr, exitCode } = await runTestCase(language, code, tc.stdin);
      return {
        label:    tc.label,
        stdin:    tc.stdin,
        expected: tc.expected,
        output:   stdout,
        stderr,
        passed:   exitCode === 0 && stdout === tc.expected,
        ms:       Date.now() - start,
      };
    })
  );
}
```

### Updated State
```js
{
  problem,
  conversation,
  messages,
  activeTab,        // 'guide' | 'output' | 'aristobot'
  language,         // 'python' | 'java' | 'javascript'
  code,             // current editor content
  testResults,      // null | array of { label, expected, output, passed, stderr, ms }
  running,          // true while Piston calls are in flight
  input,
  loading,
  sending,
  elapsed,
}
```

### Updated Flow
1. Mount → `GET /api/problems/:id` (includes testCases + starterCode)
2. `POST /api/conversations` `{ problemId, language }` → get conversationId
3. Load `problem.starterCode[language]` into editor
4. Auto-send first AristoBot message
5. **Run clicked** → `codeRunner.runCode(language, code, problem.testCases)` → switch to Output tab → show results
6. Language changed → swap `problem.starterCode[newLanguage]` into editor (warn if code was modified)
7. **Submit** → send final code as last user message → `PUT /api/conversations/:id` `{ endedAt }` → `/dashboard`

### Mocked AI Responses (cycle in order per conversation)
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

### State
```js
{
  problem,
  conversation,
  messages,
  activeTab,      // 'guide' | 'output' | 'aristobot'
  language,       // 'python' | 'java' | 'javascript'
  code,           // current code editor content
  input,          // chat input text
  loading,
  sending,
  elapsed,        // seconds since start, for timer display
}
```

### Flow
1. Mount → `GET /api/problems/:id`
2. `POST /api/conversations` `{ problemId, language }` → get conversationId
3. Load starter code template for selected language
4. Auto-send first AI message (MENTOR_REPLIES[0]) → `POST /api/conversations/:id/messages` `{ role:'assistant', content }`
5. User chats → `POST .../messages` `{ role:'user', content }` → auto-reply with next canned message
6. Language change → swap starter template (warn if code has been edited)
7. Submit → send final code as user message → `PUT /api/conversations/:id` `{ endedAt: new Date() }` → `/dashboard`

---

## Component: MessageBubble (reusable card #2)

```
AI (role='assistant'):
┌───────────────────────────────────────┐
│  ◆  What's your first instinct?       │  bg: #2a2a3e  text: #e2e8f0  left-aligned
└───────────────────────────────────────┘

User (role='user'):
                ┌───────────────────────┐
                │  Maybe brute force?   │  bg: #4f46e5  text: #fff  right-aligned
                └───────────────────────┘
```

Props: `{ role, content, createdAt }`

---

## Page: Progress (`/progress`)

### Layout
Two columns: Profile sidebar (280px, left) | Main content (flex-1, right)

### Wireframe
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Navbar                                                                      │
├──────────────────────┬──────────────────────────────────────────────────────┤
│                      │                                                      │
│  ┌────────────────┐  │  Your Progress                                       │
│  │   R  A         │  │  Track your solving journey                          │
│  │  (initials)    │  │                                                      │
│  │                │  │  ┌─────────────┐ ┌─────────────┐ ┌───────────────┐  │
│  │  Royi Aizen    │  │  │  8          │ │  3          │ │  5            │  │
│  │  candidate     │  │  │  Total      │ │  In Progress│ │  Completed    │  │
│  │  advanced      │  │  └─────────────┘ └─────────────┘ └───────────────┘  │
│  └────────────────┘  │          ↑ ProgressCard × 3 (reusable card #3)      │
│                      │                                                      │
│  Current   Best      │  Activity — 2026                                     │
│  Streak    Streak    │  ┌────────────────────────────────────────────────┐  │
│  🔥 0 days 🏆 5 days │  │ Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec│  │
│                      │  │ [heatmap — green squares on active days]       │  │
│  Easy    2 solved    │  └────────────────────────────────────────────────┘  │
│  Medium  4 solved    │                                                      │
│  Hard    2 solved    │  Problem             Status        Attempts  Last    │
│                      │  ──────────────────────────────────────────────────  │
│                      │  Two Sum             ✓ completed   3         Jun 1   │
│                      │  LIS                 ⟳ in_progress 1         Jun 1   │
│                      │  Invert Tree         ✓ completed   2         May 30  │
│                      │                                                      │
├──────────────────────┴──────────────────────────────────────────────────────┤
│ Footer                                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### State
```js
{ progress, problems, loading }
```

### Endpoints
- `GET /api/progress` — filtered by `x-user-id` for candidate; all records for admin

### Admin Difference
User selector dropdown at top to filter by user.

---

## Component: ProgressCard (reusable card #3)

Used 3× on Progress page.

```
┌───────────────────────────┐
│  bg: #1e1e2e  radius:10px │
│  border: 1px #2e2e42      │
│                           │
│  8                        │  text-3xl bold #e2e8f0
│  Total Solved             │  text-sm #94a3b8
└───────────────────────────┘
```

Props: `{ value, label, highlight? }`
`highlight=true` adds `border-left: 3px solid #4f46e5`.

The three instances:
1. `{ value: 8, label: "Total Solved" }`
2. `{ value: 3, label: "In Progress", highlight: true }`
3. `{ value: 5, label: "Completed" }`

---

## Page: Settings (`/settings`)

### Layout
Centered panel, `max-width: 640px`, full dark page with Navbar + Footer.

### Wireframe
```
┌──────────────────────────────────────────────────────────────────┐
│ Navbar                                                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Settings                                                        │
│  Manage your profile and preferences                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  bg: #1e1e2e  radius: 12px  padding: 32px                │   │
│  │                                                          │   │
│  │  Display name                                            │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Royi Aizen                                        │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  Email                                                   │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  royi@example.com                                  │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ⚠ Invalid email format                                  │   │
│  │                                                          │   │
│  │  Theme                                                   │   │
│  │  ┌──────────────────┐  ┌──────────────────┐             │   │
│  │  │  ○  Light        │  │  ●  Dark         │             │   │
│  │  └──────────────────┘  └──────────────────┘             │   │
│  │                                                          │   │
│  │  Notifications                                           │   │
│  │  ☑  Email me about new assigned tests                    │   │
│  │                                                          │   │
│  │  ─────────────────────────────────────────              │   │
│  │                                                          │   │
│  │                    ┌──────────────────────┐             │   │
│  │                    │  Save changes        │             │   │
│  │                    └──────────────────────┘             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────┐                                 │
│  │  ✓  Settings saved          │  ← fixed bottom-right, 3s      │
│  └─────────────────────────────┘                                 │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ Footer                                                           │
└──────────────────────────────────────────────────────────────────┘
```

### State
```js
{ form, original, loading, saving, errors: { displayName, email }, showSuccess }
```

### Validation
- displayName: required, non-empty after trim
- email: required, valid format

### Flow
1. Mount → `GET /api/settings` → populate `form` + `original`
2. Any change → mark dirty (enables Save button)
3. Submit → validate → `PUT /api/settings` → show Toast → reset `original`

---

## Component: Toast

```
┌───────────────────────────────────┐
│  ✓  Settings saved                │  bg: #14532d  text: #4ade80  radius: 8px
└───────────────────────────────────┘
position: fixed  bottom: 24px  right: 24px  z-index: 999
Auto-dismiss after 3000ms
```

Props: `{ message, type: 'success' | 'error' }`

---

## Reusable Card Summary (Assignment 3: ≥3 uses)

| Component | Page | Renders |
|---|---|---|
| `StatCard` | Dashboard header | 3 (AI-Guided, Mentor, Evaluation) |
| `MessageBubble` | ProblemDetail chat | N (1 per message, always ≥3) |
| `ProgressCard` | Progress page | 3 (Total, In Progress, Completed) |

---

## Data Table Summary (Assignment 3: required)

| Table | Page | Columns | Endpoint |
|---|---|---|---|
| `ProblemsTable` | Dashboard | Status, Problem, Difficulty, Topic, Type | `GET /api/problems` |
| `EvaluationsTable` | Dashboard (company/admin) | Candidate, Problem, Score, Feedback | `GET /api/evaluations` |
| `UsersTable` | Dashboard (admin) | Name, Email, Role, Joined | `GET /api/users` |
| Progress table | Progress page | Problem, Status, Attempts, Last Attempt | `GET /api/progress` |

---

## User Stories Coverage

| Story | Screen |
|---|---|
| Register with name, email, password | Register page |
| Log in securely | Login page |
| Role-aware screens | Dashboard (3 views), Sidebar nav |
| Candidate sees assigned tests + deadlines | Candidate dashboard ProblemsTable |
| Choose language | ProblemDetail top bar dropdown |
| AI chat, thought process saved | ProblemDetail AristoBot panel |
| Company sees candidate scores | Company dashboard EvaluationsTable |
| Problem repository by difficulty/topic | ProblemsTable with difficulty pills |
| AI mentor chat (guides, won't give answer) | AristoBot canned mentor replies |
| Progress statistics over time | Progress page heatmap + table |
| RBAC | RequireAuth + role-aware nav + sidebar |

---

## Assignment 3 Checklist

| Requirement | Satisfied by |
|---|---|
| Login page (email, password, validation) | Login page |
| Navbar (logo, links, user, logout) | Navbar component |
| Footer (name, year, slogan) | Footer component |
| Settings (≥3 fields, GET/PUT backend) | Settings page |
| Dashboard / Home page | Dashboard page |
| Reusable Card (≥3 uses) | StatCard, MessageBubble, ProgressCard |
| Data Table (dynamic rows from backend) | ProblemsTable |
| `src/components/` `src/pages/` `src/services/` `App.js` | File structure |
| README.md | Written last |
| Port note (5173 vs assignment's 3000) | README disclaimer |
