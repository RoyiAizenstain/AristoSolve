# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Run server (node server.js)
npm run dev      # Run with nodemon (auto-restart on file changes)
```

No test runner is configured. Test endpoints manually using the Postman collection at [docs/AristoSolve.postman_collection.json](docs/AristoSolve.postman_collection.json), or with curl passing `-H "x-user-role: admin"`.

---

## What This Is

AristoSolve is a backend API for an AI-guided problem-solving platform (think NeetCode, but the AI guides thinking via chat rather than the user writing code directly). This is Assignment 2: in-memory mock data only, no database. The same API contract will connect to MySQL in a later assignment.

- Runtime: Node.js + Express
- Port: 3000
- Base URL: `http://localhost:3000`

---

## Architecture

The codebase follows a strict three-layer separation:

- **routes/** — Express Router only. No logic. Wires HTTP methods + paths to controller functions, and applies `auth()` middleware where needed.
- **controllers/** — All request/response logic. Reads `req`, calls model helpers, returns the standard response envelope.
- **models/** — In-memory arrays + CRUD helper functions. No Express objects here.

**server.js** wires middleware globally (`logger`, `express.json()`) and mounts all routers.

### Auth middleware pattern

`auth.js` exports a factory: `auth(['admin', 'company'])` returns an Express middleware that reads `x-user-role` from the request header and returns 403 if the role isn't in the allowed list. Apply it per-route in routes files.

"Own" access (e.g. a candidate reading their own record) must be checked inside the controller by comparing the resource's `userId` to a user identifier from the header — there is no real session, so use a convention like `x-user-id`.

### Model layer pattern

Each model file exports:
- The in-memory array (e.g. `users`)
- A `nextId` counter or equivalent auto-increment logic
- Helper functions: `findAll`, `findById`, `create`, `update`, `remove`

IDs are numeric, auto-incremented. Data resets on server restart.

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
| company   | Create/update problems; view evaluations of their candidates |
| candidate | Read problems; own conversations, progress, evaluations |

Auth is simulated via the `x-user-role` request header.

---

## Data Models

### users
```json
{ "userId": 1, "firstName": "", "lastName": "", "email": "", "password": "", "userRole": "admin|company|candidate", "level": "beginner|intermediate|advanced", "createDate": "", "updateDate": "" }
```

### problems
```json
{ "id": 1, "title": "", "difficulty": "easy|medium|hard", "topic": "arrays|trees|graphs|dp|strings|...", "type": "algorithm|system-design|debugging", "description": "", "constraints": "", "examples": [], "evalPrompt": "", "isPublic": true, "createdBy": 1, "createdAt": "" }
```
`isPublic: true` = open self-learning problem. `isPublic: false` = private company recruitment test.
`GET /problems` supports query params: `?difficulty=easy&topic=arrays&type=algorithm`

### conversations
```json
{ "id": 1, "userId": 1, "problemId": 1, "language": "python|java|javascript", "startedAt": "", "endedAt": null }
```
`GET /conversations/:id` returns the conversation **with its messages** embedded.

### messages
```json
{ "id": 1, "conversationId": 1, "sequenceNumber": 1, "role": "user|assistant", "content": "", "createdAt": "" }
```
`sequenceNumber` is auto-assigned per conversation on create.

### evaluations
```json
{ "id": 1, "userId": 1, "problemId": 1, "conversationId": 1, "companyId": 2, "score": 85, "feedback": "", "thinkingAnalysis": "", "createdAt": "" }
```
`companyId` is derived from `problem.createdBy` on create — not passed by the client.

### progress
```json
{ "id": 1, "userId": 1, "problemId": 1, "status": "in_progress|completed", "attempts": 2, "lastAttemptAt": "", "deadline": null }
```
`deadline` is optional. Set by company when assigning a test; `null` for self-learning.

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

---

## Mock Data

Each model needs 3–5 seed records. Mock users must cover all three roles.

---

## API Endpoints

### Users
| Method | Path       | Access     |
|--------|------------|------------|
| GET    | /users     | admin      |
| GET    | /users/:id | admin, own |
| POST   | /users     | public     |
| PUT    | /users/:id | admin, own |
| DELETE | /users/:id | admin      |

### Problems
| Method | Path          | Access         |
|--------|---------------|----------------|
| GET    | /problems     | all            |
| GET    | /problems/:id | all            |
| POST   | /problems     | admin, company |
| PUT    | /problems/:id | admin, company |
| DELETE | /problems/:id | admin          |

### Conversations
| Method | Path               | Access     |
|--------|--------------------|------------|
| GET    | /conversations     | admin      |
| GET    | /conversations/:id | admin, own |
| POST   | /conversations     | candidate  |
| PUT    | /conversations/:id | admin      |
| DELETE | /conversations/:id | admin      |

### Messages (nested under conversations)
| Method | Path                                | Access     |
|--------|-------------------------------------|------------|
| GET    | /conversations/:id/messages         | admin, own |
| POST   | /conversations/:id/messages         | candidate  |
| PUT    | /conversations/:id/messages/:msgId  | admin      |
| DELETE | /conversations/:id/messages/:msgId  | admin      |

### Evaluations
| Method | Path             | Access              |
|--------|------------------|---------------------|
| GET    | /evaluations     | admin, company      |
| GET    | /evaluations/:id | admin, company, own |
| POST   | /evaluations     | admin               |
| PUT    | /evaluations/:id | admin               |
| DELETE | /evaluations/:id | admin               |

### Progress
| Method | Path          | Access     |
|--------|---------------|------------|
| GET    | /progress     | admin      |
| GET    | /progress/:id | admin, own |
| POST   | /progress     | candidate  |
| PUT    | /progress/:id | admin, own |
| DELETE | /progress/:id | admin      |

---

## Out of Scope (this assignment)

Real AI chat, MySQL, JWT/password auth, file uploads, WebSockets.
