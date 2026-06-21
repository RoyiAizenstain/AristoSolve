# AristoSolve

> **Evaluate whether a candidate is AI native.**

Traditional technical interviews test whether someone can write an algorithm from memory. AristoSolve tests something different — can this person *think alongside AI*? Do they know what questions to ask? Can they push back when the AI is wrong? Do they use AI as a thinking tool or as an answer machine?

**How it works:** Candidates solve coding problems while chatting with AristoBot, an AI mentor powered by Claude Haiku. The entire conversation is saved. On submit, Claude evaluates the conversation using the company's custom evaluation prompt — scoring AI interaction quality (prompting skill, critical thinking, adaptability) alongside code correctness.

**What makes it different from LeetCode:** The conversation IS the evaluation artifact. Companies define what "AI native" means for their context. The score reflects how a candidate thinks, not just what they output.

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

## Installation

### Prerequisites
- Node.js 18+
- MySQL 8.4

### 1. Clone the repository
```bash
git clone https://github.com/RoyiAizenstain/AristoSolve.git
cd AristoSolve
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

---

## Database Setup

### 1. Create the database
Open MySQL Workbench or run:
```sql
CREATE DATABASE aristosolve;
```

### 2. Configure environment variables
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env` with your values (see [Environment Variables](#environment-variables)).

### 3. Run migrations (creates all tables)
```bash
cd backend
node -e "
require('dotenv').config();
const { sequelize } = require('./models/index');
sequelize.sync({ force: false }).then(() => {
  console.log('All tables created');
  process.exit(0);
});
"
```

### 4. Seed the database (5 users + 5 problems + admin record)
```bash
node -e "
require('dotenv').config();
const { sequelize } = require('./models/index');
const userSeeder    = require('./seeders/01-users');
const problemSeeder = require('./seeders/02-problems');
const adminSeeder   = require('./seeders/03-admins');
const qi = sequelize.getQueryInterface();
userSeeder.up(qi).then(() => problemSeeder.up(qi)).then(() => adminSeeder.up(qi)).then(() => {
  console.log('Database seeded');
  process.exit(0);
});
"
```

---

## Environment Variables

Create `backend/.env` from the template:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description | Example |
|---|---|---|
| `DB_HOST` | MySQL host | `127.0.0.1` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASS` | MySQL password | `your_password` |
| `DB_NAME` | Database name | `aristosolve` |
| `ANTHROPIC_API_KEY` | Anthropic API key — get from console.anthropic.com | `sk-ant-...` |
| `PORT` | Backend port | `3000` |

> Never commit `.env` — it is listed in `.gitignore`.

---

## ORM Setup

AristoSolve uses **Sequelize** to map JavaScript models to MySQL tables.

### Models

| Model | Table | Purpose |
|---|---|---|
| `User` | `users` | All roles: admin, company, candidate |
| `Admin` | `admins` | Admin profile extension — one-to-one with User; tracks `isSuperAdmin` flag |
| `Problem` | `problems` | Coding problems with starter code and test cases |
| `Conversation` | `conversations` | A candidate's session on a problem |
| `Message` | `messages` | Individual chat messages within a conversation |
| `Progress` | `progress` | Tracks candidate progress + company assignments (junction table) |
| `Evaluation` | `evaluations` | Claude AI evaluation results per conversation |
| `Settings` | `settings` | Per-user display preferences |

### ORM Relationships

**One-to-one:**
- `User` → `Admin` (admin profile extension)

**One-to-many:**
- `User` → `Conversations`
- `User` → `Progress`
- `Conversation` → `Messages`

**Many-to-many:**
- `User` ↔ `Problem` via `Progress` (junction table)

---

## Running the App

### Start the backend (port 3000)
```bash
cd backend
npm start
```

### Start the frontend (port 5173)
```bash
cd frontend
npm start
```

Open **http://localhost:5173** in your browser.

### Seed login credentials

| Role | Email | Password |
|---|---|---|
| Admin | alice@example.com | admin123 |
| Company | bob@example.com | company123 |
| Candidate | carol@example.com | candidate123 |
| Candidate | dave@example.com | candidate123 |
| Candidate | eva@example.com | candidate123 |

---

## API Endpoints

All routes are prefixed with `/api`. Test with the Postman collection at `docs/AristoSolve.postman_collection.json`.

### Auth
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login with email + password |
| POST | `/api/auth/logout` | Public | Clear session |

### Users
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/users` | admin, company | List all users |
| GET | `/api/users/me` | own | Get current user |
| POST | `/api/users` | Public | Register new user |
| PUT | `/api/users/:id` | admin, own | Update user |
| DELETE | `/api/users/:id` | admin | Delete user |

### Problems
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/problems` | all (role-filtered) | List problems |
| GET | `/api/problems/:id` | all | Get problem detail |
| POST | `/api/problems` | admin, company | Create problem |
| PUT | `/api/problems/:id` | admin, company (own) | Update problem |
| DELETE | `/api/problems/:id` | admin, company (own) | Delete problem |

### Conversations & Messages
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/conversations?problemId=X` | candidate, company | Get conversation for a problem |
| POST | `/api/conversations` | all | Start a new conversation |
| PUT | `/api/conversations/:id` | all | End conversation — triggers AI evaluation |
| POST | `/api/conversations/:id/messages` | all | Save a message |

### Progress, Evaluations, Settings
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/progress` | all | Get progress records (filtered by role) |
| POST | `/api/progress` | all | Create or assign progress record |
| PUT | `/api/progress/:id` | all | Update progress status |
| GET | `/api/evaluations` | admin, company | Get evaluations |
| GET | `/api/settings` | own | Get user settings |
| PUT | `/api/settings` | own | Update user settings |

### Response Format
```json
{ "success": true,  "data": {},   "error": null }
{ "success": false, "data": null, "error": { "code": "ERROR_CODE", "message": "..." } }
```

---

## WebSocket Feature

AristoSolve uses **Socket.IO** for real-time AristoBot chat.

Each conversation gets its own **Socket.IO room** (`conversationId`). All clients in the same room receive messages in real-time.

### Custom Events (5 total — A4 requires minimum 3)

| Event | Direction | Payload | When |
|---|---|---|---|
| `join-conversation` | client → server | `{ conversationId }` | Candidate opens a problem |
| `send-message` | client → server | `{ conversationId, content, language }` | Candidate sends a message |
| `typing` | server → client | `{ conversationId }` | Claude API call in progress |
| `receive-message` | server → client | `{ conversationId, message }` | Reply ready — broadcast to entire room |
| `conversation-ended` | client → server | `{ conversationId }` | Candidate clicks Submit |

### 2-Tab Demo
1. Open **Tab 1** → log in as Carol → open any problem and start chatting
2. Open **Tab 2** (same browser, same URL) → same conversation loads automatically
3. Send a message in Tab 1 → both tabs see the message and AristoBot's reply simultaneously
4. Typing indicator (`...`) appears in both tabs while Claude processes

---

## AI Feature

AristoSolve integrates **Anthropic Claude Haiku** for two AI-powered features:

### 1. AristoBot — Real-time Socratic Mentor

Every candidate message triggers a Claude API call via Socket.IO. AristoBot:
- Guides thinking with Socratic questions — never reveals the solution
- Answers basic language syntax questions directly (loops, data structures, built-in methods)
- Is language-aware — adapts to Python, JavaScript, or Java as the candidate switches
- Falls back to canned mentor replies if the API is unavailable
- Renders code responses with syntax highlighting in the chat

**API key:** Lives in `backend/.env` only. Never sent to the frontend.

### 2. AI Nativeness Evaluation

When a candidate submits, the backend automatically calls Claude to evaluate the full conversation + submitted code.

**Evaluation dimensions (0–100 each):**

| Dimension | What it measures |
|---|---|
| Prompting skill | Did they ask clear, focused questions? |
| Critical thinking | Did they push back or reason independently? |
| Adaptability | Did they recover from wrong paths? |
| Code correctness | Is the submitted code correct and efficient? |

**Overall score:** 50% AI nativeness + 50% code quality

**Uses company `evalPrompt`:** Each company defines what "AI native" means for their context via a custom evaluation prompt on their problems.

**Company sees:** Score, overall feedback, thinking analysis, code analysis, and 4 dimension progress bars in a full evaluation report modal on their dashboard.

---

## Known Limitations

| Limitation | Notes |
|---|---|
| Header-based auth | `x-user-role` and `x-user-id` headers simulate sessions. Not secure for production — JWT planned post-submission. |
| No code execution | The textarea editor does not run code. Piston API integration planned post-submission. |
| No Monaco editor | Plain `<textarea>` used for code. Monaco editor planned post-submission. |
| No dedicated progress page | Assigned problems and their status are visible in the candidate dashboard ("Assigned to me" section). A full `/progress` route with history, statistics, and heatmap is planned post-submission. |
| Anthropic API credits required | AristoBot falls back to canned replies when API balance is empty. Add credits at `console.anthropic.com`. |
| Frontend port 5173, not 3000 | Assignment specifies port 3000 for frontend but backend already uses 3000. Frontend runs on 5173 to avoid collision. |
| No real-time evaluation display | Evaluation appears on company dashboard after page refresh. WebSocket push for live evaluation not yet implemented. |
