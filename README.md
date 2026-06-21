# AristoSolve

> **Evaluate whether a candidate is AI native.**

Traditional technical interviews test whether someone can write an algorithm from memory. AristoSolve tests something different — can this person *think alongside AI*? Do they know what questions to ask? Can they push back when the AI is wrong? Do they use AI as a thinking tool or as an answer machine?

**How it works:** Candidates solve coding problems while chatting with AristoBot, an AI mentor powered by Claude Haiku. The entire conversation is saved. On submit, Claude evaluates the conversation using the company's custom evaluation prompt — scoring AI interaction quality (prompting skill, critical thinking, adaptability) alongside code correctness.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Create React App), React Router v7 |
| Backend | Node.js + Express |
| Database | MySQL 8.4 via Sequelize ORM |
| Real-time | Socket.IO |
| AI | Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) |

---

## Prerequisites

Before starting, make sure you have:

- **Node.js 18+** — download from nodejs.org
- **MySQL 8.4** — download MySQL Community Server + MySQL Workbench
- **Git**
- **An Anthropic API key** — create an account at `console.anthropic.com` and add at least $5 credit

---

## Quick Start (all commands in order)

```bash
# 1. Clone
git clone https://github.com/RoyiAizenstain/AristoSolve.git
cd AristoSolve

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Set up database (see Database Setup below first)
cd ../backend
cp .env.example .env          # then edit .env with your MySQL password + API key

# 4. Create tables + seed data
node -e "require('dotenv').config(); const {sequelize}=require('./models/index'); sequelize.sync().then(()=>process.exit(0));"
node -e "require('dotenv').config(); const {sequelize}=require('./models/index'); const u=require('./seeders/01-users'); const p=require('./seeders/02-problems'); const a=require('./seeders/03-admins'); const qi=sequelize.getQueryInterface(); u.up(qi).then(()=>p.up(qi)).then(()=>a.up(qi)).then(()=>{console.log('Seeded!');process.exit(0)});"

# 5. Start servers (two separate terminals)
cd backend && npm start        # Terminal 1 — port 3000
cd frontend && npm start       # Terminal 2 — port 5173
```

Open **http://localhost:5173** — you should see the AristoSolve login page.

---

## Project Purpose

AristoSolve is a full-stack AI-guided coding interview platform with three user roles:

| Role | What they do |
|---|---|
| **Company** | Creates coding problems with custom AI evaluation prompts, assigns tests to candidates, views AI-scored evaluations |
| **Candidate** | Solves problems while chatting with AristoBot (Claude Haiku), submits code + conversation for AI evaluation |
| **Admin** | Manages all users and problems on the platform |

The core insight: by making candidates solve problems *through conversation with AI*, AristoSolve reveals whether they know how to think with AI tools — a skill that matters more than algorithm memorization.

---

## Installation

### Step 1 — Clone the repository

```bash
git clone https://github.com/RoyiAizenstain/AristoSolve.git
cd AristoSolve
```

### Step 2 — Install backend dependencies

```bash
cd backend
npm install
```

Expected output: `added N packages`

### Step 3 — Install frontend dependencies

```bash
cd ../frontend
npm install
```

Expected output: `added N packages`

---

## Database Setup

### Step 1 — Install MySQL (Windows)

```powershell
winget install Oracle.MySQL --accept-source-agreements --accept-package-agreements
winget install Oracle.MySQLWorkbench --accept-source-agreements --accept-package-agreements
```

Then initialize MySQL as a Windows service (run PowerShell **as Administrator**):

```powershell
cd "C:\Program Files\MySQL\MySQL Server 8.4\bin"
.\mysqld.exe --initialize-insecure
.\mysqld.exe --install
Start-Service MySQL
```

### Step 2 — Create the database

Open MySQL Workbench or run:

```sql
CREATE DATABASE aristosolve;
```

Or from command line:
```bash
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -e "CREATE DATABASE aristosolve;"
```

### Step 3 — Configure environment variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` — replace the values:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=your_mysql_root_password
DB_NAME=aristosolve
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
PORT=3000
```

### Step 4 — Create tables (run migrations)

```bash
cd backend
node -e "
require('dotenv').config();
const { sequelize } = require('./models/index');
sequelize.sync({ force: false }).then(() => {
  console.log('All tables created successfully');
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
"
```

Expected output: `All tables created successfully`

### Step 5 — Seed the database

```bash
node -e "
require('dotenv').config();
const { sequelize } = require('./models/index');
const userSeeder    = require('./seeders/01-users');
const problemSeeder = require('./seeders/02-problems');
const adminSeeder   = require('./seeders/03-admins');
const qi = sequelize.getQueryInterface();
userSeeder.up(qi)
  .then(() => problemSeeder.up(qi))
  .then(() => adminSeeder.up(qi))
  .then(() => { console.log('Database seeded!'); process.exit(0); })
  .catch(e => { console.error(e.message); process.exit(1); });
"
```

Expected output: `Database seeded!`

This creates 5 users and 5 coding problems in MySQL.

---

## Environment Variables

File: `backend/.env`  
Template: `backend/.env.example`

| Variable | Description | Example |
|---|---|---|
| `DB_HOST` | MySQL server address | `127.0.0.1` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASS` | MySQL root password (set during install) | `mypassword` |
| `DB_NAME` | Database name (must exist) | `aristosolve` |
| `ANTHROPIC_API_KEY` | API key from console.anthropic.com | `sk-ant-api03-...` |
| `PORT` | Backend port | `3000` |

> **Important:** Never commit `backend/.env` — it contains secrets. It is listed in `.gitignore`.

---

## ORM Setup

AristoSolve uses **Sequelize** to map JavaScript classes to MySQL tables.

### Models (8 tables)

| Model | Table | Purpose |
|---|---|---|
| `User` | `users` | All roles: admin, company, candidate |
| `Admin` | `admins` | Admin profile extension (one-to-one with User) — holds `isSuperAdmin` |
| `Problem` | `problems` | Coding problems with starter code + test cases |
| `Conversation` | `conversations` | A candidate's session on a specific problem |
| `Message` | `messages` | Individual chat messages in a conversation |
| `Progress` | `progress` | **Junction table** — links users ↔ problems, holds status + deadline |
| `Evaluation` | `evaluations` | Claude AI scores per submitted conversation |
| `Settings` | `settings` | Per-user theme/display preferences |

### ORM Relationships

```
User (1) ──────────────── (many) Conversation
User (1) ──────────────── (many) Progress
User (1) ──────────────── (1)    Admin           ← one-to-one extension
User (1) ──────────────── (1)    Settings
Conversation (1) ────────────── (many) Message
User (many) ◄──── Progress ────► Problem (many)  ← many-to-many via junction
```

The `Progress` table is the **junction table** satisfying A4's many-to-many requirement. It also stores company assignment data (deadline, status).

### Admin model note

Assignment 4 requires an "Admin" model. In AristoSolve, `Admin` is a real Sequelize model mapping to the `admins` table. It holds a one-to-one reference to `User` with an `isSuperAdmin` flag. Access control is still driven by `userRole = 'admin'` on the `User` table.

---

## Running the App

### Terminal 1 — Backend (port 3000)

```bash
cd backend
npm start
```

Expected: `Server running on http://localhost:3000`

### Terminal 2 — Frontend (port 5173)

```bash
cd frontend
npm start
```

Expected: browser opens automatically at `http://localhost:5173`

> **Note on port:** The assignment specifies port 3000 for the frontend, but the backend already uses 3000. We run the frontend on 5173 to avoid the collision.

### Login credentials (seeded users)

| Role | Email | Password |
|---|---|---|
| Admin | alice@example.com | admin123 |
| Company | bob@example.com | company123 |
| Candidate | carol@example.com | candidate123 |
| Candidate | dave@example.com | candidate123 |
| Candidate | eva@example.com | candidate123 |

---

## API Endpoints

All routes are prefixed with `/api`. Use `x-user-role` and `x-user-id` headers to authenticate.

**Example:**
```bash
curl http://localhost:3000/api/problems \
  -H "x-user-role: admin" \
  -H "x-user-id: 1"
```

Full Postman collection: `docs/AristoSolve.postman_collection.json`

### Auth
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | `{ email, password }` → returns user object |
| POST | `/api/auth/logout` | Public | Clears session |

### Users
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/users` | admin, company | List all users |
| GET | `/api/users/me` | own | Get current user by `x-user-id` |
| POST | `/api/users` | Public | Register new user |
| PUT | `/api/users/:id` | admin, own | Update user (empty password = no change) |
| DELETE | `/api/users/:id` | admin | Delete user (blocks last admin) |

### Problems
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/problems` | all | List problems (filtered by role) |
| GET | `/api/problems/:id` | all | Problem detail |
| POST | `/api/problems` | admin, company | Create problem |
| PUT | `/api/problems/:id` | admin, company (own) | Update problem |
| DELETE | `/api/problems/:id` | admin, company (own) | Delete problem |

### Conversations & Messages
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/conversations?problemId=X` | all | Get user's conversation for a problem |
| POST | `/api/conversations` | all | Start a conversation |
| PUT | `/api/conversations/:id` | all | End conversation → **triggers AI evaluation** |
| POST | `/api/conversations/:id/messages` | all | Save a chat message |

### Progress, Evaluations, Settings
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/progress` | all | Progress records (filtered by role) |
| POST | `/api/progress` | all | Create/assign progress record |
| PUT | `/api/progress/:id` | all | Update progress status |
| GET | `/api/evaluations` | admin, company | AI evaluation results |
| GET | `/api/settings` | own | Get user settings |
| PUT | `/api/settings` | own | Update settings |

### Response format (all endpoints)
```json
{ "success": true,  "data": { ... }, "error": null }
{ "success": false, "data": null,    "error": { "code": "ERROR_CODE", "message": "..." } }
```

---

## WebSocket Feature

AristoSolve uses **Socket.IO** for real-time AristoBot chat and 2-tab sync.

Each conversation gets its own **Socket.IO room** (keyed by `conversationId`). All clients in the same room receive the same events simultaneously.

### Custom Events (5 — A4 requires minimum 3)

| Event | Direction | Payload | When |
|---|---|---|---|
| `join-conversation` | client → server | `{ conversationId }` | Candidate opens a problem |
| `send-message` | client → server | `{ conversationId, content, language }` | Candidate sends a message |
| `typing` | server → client | `{ conversationId }` | Claude API call in progress — shows `...` indicator |
| `receive-message` | server → client | `{ conversationId, message }` | AristoBot reply ready — broadcast to all in room |
| `conversation-ended` | client → server | `{ conversationId }` | Candidate clicks Submit |

### 2-Tab Demo (A4 requirement)

1. Open **Tab 1** → log in as Carol → open any problem
2. Open **Tab 2** in the same browser → same URL → conversation history loads
3. Send a message in Tab 1
4. **Both tabs** receive the typing indicator and AristoBot's reply simultaneously — no refresh needed

This proves Socket.IO real-time communication between two browser clients.

---

## AI Feature

AristoSolve integrates **Anthropic Claude Haiku** (`claude-haiku-4-5-20251001`) for two AI-powered features.

### Feature 1 — AristoBot: Real-time Socratic Mentor

Every candidate message triggers a Claude API call on the backend (via Socket.IO). AristoBot:

- **Guides thinking** with Socratic questions — never reveals the direct solution
- **Answers syntax questions** directly: "how do I write a for loop in Python?" gets a direct code example
- **Is language-aware** — adapts examples to Python, JavaScript, or Java based on the candidate's selection
- **Falls back to canned replies** if the Anthropic API is unavailable (no credits, network error)
- **Renders code** with syntax highlighting, copy button, and language label in the chat

**System prompt summary:**
```
You are AristoBot. Guide thinking without giving the answer.
Ask Socratic questions. For syntax questions, answer directly.
Keep replies under 4 sentences. Always use the candidate's language.
```

**API key location:** `backend/.env` only. Never sent to the frontend. Never committed to git.

### Feature 2 — AI Nativeness Evaluation

When a candidate clicks Submit, the backend:
1. Reads the entire conversation + submitted code
2. Calls Claude Haiku with the company's custom `evalPrompt`
3. Returns a structured JSON score
4. Saves the evaluation to MySQL
5. Company sees it in their dashboard

**Evaluation dimensions (0–100 each):**

| Dimension | What Claude scores |
|---|---|
| Prompting skill | Did they ask clear, focused questions? |
| Critical thinking | Did they push back or reason independently? |
| Adaptability | Did they recover from wrong paths? |
| Code correctness | Is the submitted code correct and efficient? |

**Overall score:** 50% AI nativeness + 50% code quality

**Company sees:** Score badge, 4 dimension progress bars, overall feedback, thinking analysis, and code analysis in a modal on their dashboard.

---

## Known Limitations

| Limitation | Notes |
|---|---|
| Header-based auth | `x-user-role` and `x-user-id` headers simulate JWT sessions. Not secure for production. Real JWT + bcrypt is planned post-submission. |
| No code execution | The `<textarea>` does not run code. Piston API (Judge0) integration is planned post-submission. |
| No Monaco editor | Plain `<textarea>` with Tab-key handler (inserts 4 spaces). Monaco editor is planned post-submission. |
| No dedicated progress page | Assigned problems are visible in the candidate dashboard "Assigned to me" section. A full `/progress` statistics page is planned post-submission. |
| Anthropic API credits required | AristoBot falls back to canned Socratic replies when API balance is empty. Add credits at `console.anthropic.com`. |
| Frontend port 5173, not 3000 | Assignment specifies 3000 but backend already uses it. Frontend runs on 5173 to avoid collision. |
| Evaluation after page refresh | The AI evaluation is created immediately on submit but the company dashboard needs a manual refresh to show it. WebSocket push for live evaluation is planned. |

---

## Troubleshooting

**`ECONNREFUSED` on port 3000** — Backend is not running. Run `cd backend && npm start`.

**`Cannot reach the server`** on frontend — Backend died. Restart it.

**`Access denied for user root`** — Wrong MySQL password in `backend/.env`. Check `DB_PASS`.

**`AristoBot not responding`** — Either the backend is down, or Anthropic API balance is empty. Check `console.anthropic.com` → Plans & Billing.

**`Validation error` on settings save** — Known MySQL issue with `upsert`. Fixed in controller — make sure you have the latest code.

**Login fails after editing a user** — Fixed: `PUT /api/users/:id` no longer overwrites password with empty string.

---

## Submission Artifacts

| Artifact | Location |
|---|---|
| Screenshots (19 files) | `screenshots/` at project root |
| Demo video (57 seconds) | `demo-video/AristoSolve-Demo.webm` |
| Postman collection | `docs/AristoSolve.postman_collection.json` |
| Environment template | `backend/.env.example` |
| E2E test suite | `frontend/tests/` — 26 Playwright tests |

### Running E2E Tests

Requires both servers running on ports 3000 and 5173.

```bash
cd frontend
npx playwright test                    # run all 26 tests (headless)
npx playwright test --headed           # watch browser execute tests
npx playwright test tests/01-auth.spec.js   # run one file
npx playwright test --config=playwright.demo.config.js tests/demo-video.spec.js  # record demo video
```
