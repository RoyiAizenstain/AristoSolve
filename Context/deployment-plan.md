# AristoSolve — Deployment & Presentation Plan

> Course: Full Stack Web Development | Final Project

---

## Part 1 — Current Deployment Status

| Component | Status | Details |
|---|---|---|
| React frontend | ✅ Live | Served by Express from `frontend/build/` |
| Node.js + Express backend | ✅ Live | Render Web Service |
| MySQL database | ✅ Live | AWS RDS eu-north-1 |
| ORM (Sequelize) | ✅ Connected | 8 models, migrations, seeders |
| WebSocket (Socket.IO) | ✅ Working | 5 events, 2-tab sync verified |
| AI feature (Claude Haiku) | ✅ Working | AristoBot + evaluation |
| Authentication | ✅ Working | Register/Login with validation |
| All components integrated | ✅ Verified | E2E test passes in 27s on Render |

**Public URL:** https://aristosolve.onrender.com
**Backend URL:** https://aristosolve.onrender.com (same — monolithic)
**RDS endpoint:** aristo.cjkq8eiikl4n.eu-north-1.rds.amazonaws.com
**DB name:** aristosolve | **DB user:** admin

---

## Part 2 — Submission Form (Do This NOW)

Fill the **שיבוץ להצגת פרויקט** form with:

| Field | Value |
|---|---|
| Public website URL | `https://aristosolve.onrender.com` |
| Backend URL | `https://aristosolve.onrender.com` |
| AWS RDS endpoint | `aristo.cjkq8eiikl4n.eu-north-1.rds.amazonaws.com` |
| Database username | `admin` |
| Database password | (from `backend/.env` — the value after `DB_PASS=`) |

> **Warning from the PDF:** "Failure to provide valid credentials may compromise the evaluation of your project."

---

## Part 3 — Testing From External Network (Do Before Presentation Day)

The PDF requires: *"Teams are responsible for testing this configuration before presentation day."*

The presentation is on a **different computer, different network** — not your laptop.

### What to test

Go to a **different network** (coffee shop, university, phone hotspot) and verify:

**Test 1 — Render app:**
1. Open https://aristosolve.onrender.com in a browser
2. Login with `carol@example.com` / `candidate123`
3. Open a problem → send a message to AristoBot
4. Confirm AristoBot replies
5. ✅ If it works — Render is externally accessible

**Test 2 — MySQL Workbench from external network:**
1. Open MySQL Workbench 8.0
2. Click **+** → New Connection:
   - Hostname: `aristo.cjkq8eiikl4n.eu-north-1.rds.amazonaws.com`
   - Port: `3306`
   - Username: `admin`
   - Password: (your RDS password)
3. Click **Test Connection**
4. ✅ If it says "Successfully made the MySQL connection" — RDS is externally accessible

> If Test 2 fails: go to AWS Console → RDS → Security Group → Inbound Rules → confirm port 3306 is open to `0.0.0.0/0`

---

## Part 4 — Day Before Presentation

### Step 1 — Re-seed the database (clean start)

Run this from your terminal:
```powershell
cd backend
npm run seed
```
This resets the DB to clean seed data — removes leftover records from test runs.

### Step 2 — Save MySQL Workbench connection

In MySQL Workbench on **your own laptop**:
1. Click **+** → New Connection
2. Fill in:
   - Connection Name: `AristoSolve RDS`
   - Hostname: `aristo.cjkq8eiikl4n.eu-north-1.rds.amazonaws.com`
   - Port: `3306`
   - Username: `admin`
   - Password: click **Store in Vault** → enter password
   - Default Schema: `aristosolve`
3. Click **Test Connection** → OK → **Close**

> You cannot pre-save this on the teacher's computer. You will type it in live. **Write the password on your phone** so you can read it.

### Step 3 — Verify E2E test still passes

```powershell
$env:BASE_URL="https://aristosolve.onrender.com"
cd frontend
npx playwright test tests/evaluation-scenario.spec.js --headed
```
Must show: `1 passed` — if it fails, do not present until fixed.

### Step 4 — Write credentials on your phone

Save these somewhere accessible during the presentation (phone notes, email to yourself):
```
RDS host:  aristo.cjkq8eiikl4n.eu-north-1.rds.amazonaws.com
DB user:   admin
DB pass:   [your password from backend/.env]
App URL:   https://aristosolve.onrender.com
```

---

## Part 5 — Presentation Day

### 5 minutes before your slot

1. **Wake up Render** — open https://aristosolve.onrender.com in a browser tab. Wait for it to load fully. (Free tier sleeps after 15 min of inactivity — a cold start takes 30–60 seconds and will ruin timing if it happens during demo.)
2. **Open MySQL Workbench** — have it ready on the teacher's computer
3. **Open a second browser tab** — you will need it for the WebSocket demo

---

## Part 6 — The Full 4:45 Minute Script

### [0:00–0:20] Pitch (20 seconds) — one team member speaks

> "AristoSolve is an AI-guided coding interview platform. Instead of testing if someone can write an algorithm from memory, we test if they can *think alongside AI*. Candidates solve problems while chatting with AristoBot — our AI mentor. The entire conversation is saved and Claude evaluates it, scoring their AI nativeness: prompting skill, critical thinking, and adaptability. Companies define what 'AI native' means for their team via a custom evaluation prompt."

While the speaker talks, **the other member opens https://aristosolve.onrender.com** in the browser.

---

### [0:20–3:20] Live Demo (3 minutes) — both members

**Role: Register as a fresh COMPANY user.**

---

#### Step 1 — Create new user + show invalid input (0:20–0:40)

1. Go to `/register`
2. Click **"Create account"** with all fields empty
3. Point at the screen: *"Here you can see the validation errors — required fields are highlighted"*
4. Fill in:
   - First name: Demo | Last name: Company
   - Email: `demo@mycompany.com`
   - Password: `demo1234`
   - Role: **Company**
5. Click **"Create account"** → redirects to dashboard

**Grader sees:** Invalid input handling ✅ + CREATE user in DB ✅

---

#### Step 2 — Log in + show wrong password (0:40–1:00)

1. Click **Logout**
2. On login page, enter correct email but wrong password → click **"Log in"**
3. Point: *"Wrong password shows an error banner"*
4. Enter correct password → click **"Log in"** → dashboard loads

**Grader sees:** Wrong password handling ✅ + successful login ✅

---

#### Step 3 — Navigate to main page (1:00–1:05)

- Point at the Company Dashboard: *"This is our main page — it shows My Problems and Candidate Evaluations"*

**Grader sees:** Main application page ✅

---

#### Step 4 — Primary feature: CREATE + UPDATE + DELETE (1:05–1:50)

**CREATE:**
1. Click **"+ Add Problem"**
2. Fill: Title = `Demo Problem` | Description = `A test problem`
3. Click **"Create Problem"** → redirects to dashboard → problem appears in "My Problems" table
4. Say: *"This triggered a CREATE call to the database"*

**UPDATE:**
1. Click **"Edit"** on the problem
2. Change the title to `Demo Problem EDITED`
3. Click **Save** → redirects back → updated title shows
4. Say: *"This triggered an UPDATE call to the database"*

**Open the problem (bridge to AI demo):**
1. Click on the problem title in the table → ProblemDetail opens
2. Say: *"Now I'll open this problem to show the AI feature"*

**Grader sees:** CREATE ✅ + UPDATE ✅ (DELETE comes later after returning to dashboard)

---

#### Step 5 — AI feature + empty input handling (1:50–2:20)

1. In AristoBot chat panel, click **Send** without typing anything
2. Point: *"The send button is disabled — you can't send empty messages"*
3. Type: `"I think we should use a hash map to solve this in O(n) time"`
4. Click Send → typing indicator appears → AristoBot reply appears
5. Say: *"This is AristoBot — our real-time AI mentor powered by Claude Haiku. It asks Socratic questions without giving the answer directly"*

**Grader sees:** Empty input handling ✅ + AI feature working ✅

---

#### Step 6 — WebSocket: live update in 2 tabs (2:20–2:45)

1. **Open a second browser tab** on the same problem URL
2. Go back to tab 1
3. Type a message and send
4. Show both tabs side by side: *"Both tabs receive the message simultaneously — this is Socket.IO WebSocket in action. Real-time sync between two clients on the same conversation"*

**Grader sees:** WebSocket live update ✅

---

#### Step 7–9 — Settings + navbar + DELETE (2:45–3:15)

1. Click **"← Problems"** to exit ProblemDetail → back to dashboard

**DELETE:**
2. Click **"Delete"** on "Demo Problem EDITED" → confirm → row disappears
3. Say: *"This triggered a DELETE call to the database"*

**Grader sees:** DELETE ✅

**Settings:**
4. Click **Settings** in the navbar → Settings page loads

**Grader sees:** Settings page ✅ + navbar navigation ✅

**Modify setting:**
5. Change Display Name to `Demo Company`
6. Click **"Save changes"** → green toast appears

**Grader sees:** Modified setting ✅

**Navbar:**
7. Click **Dashboard** in the navbar

**Grader sees:** Navbar navigation ✅

---

#### Step 10 — Log out (3:15–3:20)

1. Click **Logout** → redirects to `/login`

**Grader sees:** Logout ✅

---

### [3:20–4:00] MySQL Workbench Demo (40 seconds)

**On the teacher's computer, open MySQL Workbench 8.0 CE:**

1. Click the **+** icon next to "MySQL Connections"
2. Fill in:
   ```
   Connection Name:  AristoSolve RDS
   Hostname:         aristo.cjkq8eiikl4n.eu-north-1.rds.amazonaws.com
   Port:             3306
   Username:         admin
   ```
3. Click **"Store in Vault"** → type password → OK
4. Click **"Test Connection"** → should say "Successfully made the MySQL connection"
5. Click **OK** → **Close** → double-click the connection to open it

**Run these queries:**
```sql
USE aristosolve;

-- Show the new user registered during the demo
SELECT userId, firstName, lastName, email, userRole, createDate
FROM users
ORDER BY createDate DESC
LIMIT 5;

-- Show AristoBot messages from the chat
SELECT id, role, LEFT(content, 80) AS content, createdAt
FROM messages
ORDER BY createdAt DESC
LIMIT 5;
```

**Say:** *"Here you can see the new user we just registered, and the AristoBot messages from our conversation — all persisted in the AWS RDS database."*

**Grader sees:** DB updated correctly ✅ + RDS accessible from external computer ✅

---

### [4:00–4:45] Q&A (45 seconds)

Likely questions and answers:

**"What is ORM and how do you use it?"**
> Sequelize ORM. We have 8 models (User, Problem, Conversation, Message, etc.) each mapping to a MySQL table. Controllers use async Sequelize queries — findAll, findByPk, create, update, destroy — instead of raw SQL.

**"What WebSocket events do you have?"**
> Five: `join-conversation`, `send-message`, `typing`, `receive-message`, `conversation-ended`. Each conversation is a Socket.IO room — all clients in the room get broadcast messages.

**"What AI model do you use?"**
> Anthropic Claude Haiku (`claude-haiku-4-5-20251001`). AristoBot uses it to generate Socratic mentor responses. The evaluation also uses Claude to score the candidate's AI nativeness across 4 dimensions.

**"How does the evaluation work?"**
> When the candidate clicks Submit, the full conversation is sent to Claude with a scoring prompt. Claude returns a JSON with an overall score (0–100) and 4 dimension scores: prompting skill, critical thinking, adaptability, and code correctness. The company sees this in their dashboard.

---

## Part 7 — Official Evaluation Readiness Checklist

From the PDF — verify all before presenting:

| Item | Status |
|---|---|
| Website loads correctly from Render URL | ✅ |
| User registration works | ✅ |
| Login works | ✅ |
| Main functionality works | ✅ |
| AI feature works | ✅ |
| WebSocket feature works | ✅ |
| Settings page works | ✅ |
| Database updates correctly | ✅ |
| Application accessible from external computer | ✅ (Render is public) |
| Database accessible from MySQL Workbench 8.0 CE on external computer | ⏳ Test before presentation |
| Team members know how to create a new Workbench connection | ⏳ Practice once |
| All actions timed to match presentation requirements | ✅ (E2E test: 27s) |

---

## Part 8 — Credentials Cheat Sheet (Save on Your Phone)

```
App URL:      https://aristosolve.onrender.com
Backend URL:  https://aristosolve.onrender.com

RDS host:  aristo.cjkq8eiikl4n.eu-north-1.rds.amazonaws.com
DB port:   3306
DB name:   aristosolve
DB user:   admin
DB pass:   [from backend/.env — DB_PASS value]

Demo login (seed): alice@example.com / admin123 (admin)
                   bob@example.com / company123 (company)
                   carol@example.com / candidate123 (candidate)
```

---

## Part 9 — If Something Goes Wrong

| Problem | Solution |
|---|---|
| Render app takes too long to load | You didn't wake it up — wait, don't panic. Should load within 60s |
| Wrong password for RDS in Workbench | Check your phone notes for `DB_PASS` |
| AristoBot doesn't reply | Anthropic API may be slow — wait 10s. Fallback replies exist |
| Page looks broken | Hard refresh (Ctrl+Shift+R) |
| Can't find Settings link | ProblemDetail has no navbar — click "← Problems" first, then Settings |
| 2nd tab doesn't sync | Make sure both tabs are on the exact same `/problems/:id` URL |
