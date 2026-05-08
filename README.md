# AristoSolve

> AI-guided problem-solving platform that trains *how* you think, not just what you answer.

Inspired by NeetCode — but instead of writing code directly, you interact with an AI mentor that guides you toward the solution through questions and hints, never giving the answer away. Named after Aristotle (*aristos* = excellence).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Data | In-memory (mock) |
| Auth | Role header simulation (`x-user-role`) |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start with auto-reload
npm run dev

# Start without auto-reload
npm start
```

Server runs on **http://localhost:3000**

---

## Roles

| Role | What they can do |
|---|---|
| `admin` | Full CRUD on all resources |
| `company` | Create/update problems, view candidate evaluations |
| `candidate` | Read problems, manage own conversations, progress, and evaluations |

Pass your role on every request via the `x-user-role` header.  
For "own resource" endpoints, also pass `x-user-id` with your user ID.

---

## API Overview

| Resource | Base Path | Highlights |
|---|---|---|
| Users | `/users` | Public registration, role-based read/update |
| Problems | `/problems` | Filter by `?difficulty`, `?topic`, `?type` |
| Conversations | `/conversations` | GET by ID returns messages embedded |
| Messages | `/conversations/:id/messages` | Nested under conversations |
| Evaluations | `/evaluations` | Score + thinking quality analysis |
| Progress | `/progress` | Track attempts per problem |

All responses follow this envelope:

```json
// Success
{ "success": true, "data": {}, "error": null }

// Error
{ "success": false, "data": null, "error": { "code": "NOT_FOUND", "message": "...", "details": {} } }
```

---

## Testing with Postman

Import `docs/AristoSolve.postman_collection.json` into Postman — all endpoints come pre-configured with the correct headers and example request bodies.

---

## Project Structure

```
AristoSolve/
├── server.js          ← App entry point, middleware + route mounting
├── routes/            ← Express Router definitions (no logic)
├── controllers/       ← Request/response logic
├── models/            ← In-memory data arrays + CRUD helpers
├── middleware/
│   ├── auth.js        ← Role-based access: auth(['admin', 'company'])
│   └── logger.js      ← Logs method, URL, status, response time
└── docs/
    └── AristoSolve.postman_collection.json
```

---

## Assignment Scope

This is **Assignment 2** — backend API skeleton with mock data only.  
No database, no real authentication, no AI integration (yet).  
The same API contract will connect to MySQL in a later assignment.
