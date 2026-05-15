# AristoSolve

> AI-guided problem-solving platform that trains *how* you think, not just what you answer.

Inspired by NeetCode — but instead of writing code directly, candidates interact with an AI mentor that guides them toward the solution through questions and hints, never giving the answer directly. Named after Aristotle (*aristos* = excellence).

This is **Assignment 2**: a backend REST API skeleton built with Node.js + Express and in-memory mock data.

---

## Table of Contents

1. [Setup](#setup)
2. [Configuration](#configuration)
3. [Authentication](#authentication)
4. [Response Format](#response-format)
5. [Assumptions](#assumptions)
6. [Testing](#testing)
7. [API Reference](#api-reference)
   - [Users](#users)
   - [Problems](#problems)
   - [Conversations](#conversations)
   - [Messages](#messages)
   - [Evaluations](#evaluations)
   - [Progress](#progress)

---

## Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repo
git clone https://github.com/RoyiAizenstain/AristoSolve.git
cd AristoSolve

# Install dependencies
npm install
```

### Run the Server

```bash
# Production mode
npm start

# Development mode (auto-reload on file changes)
npm run dev
```

You should see: `Server running on http://localhost:3000`

---

## Configuration

| Setting | Value |
|---|---|
| **Port** | `3000` |
| **Base URL** | `http://localhost:3000` |
| **API Base Path** | `/` (resources mounted directly at root) |
| **Content-Type** | `application/json` for all POST/PUT bodies |

There is no root `/` route — requests start at resource paths like `/users`, `/problems`, etc.

---

## Authentication

Authentication is **simulated** via request headers (no real login for this assignment).

| Header | Required When | Example Value |
|---|---|---|
| `x-user-role` | All protected endpoints | `admin`, `company`, or `candidate` |
| `x-user-id` | All "own access" endpoints | `3` (numeric user ID) |

### Roles

| Role | Permissions |
|---|---|
| `admin` | Full CRUD on every resource |
| `company` | Create/update problems; view evaluations for problems they created |
| `candidate` | Read problems; manage own conversations, messages, progress, evaluations |

### "Own" Access

Some endpoints allow access if either:
- The requester is `admin`, **OR**
- The requester's `x-user-id` matches the resource's `userId`

If neither is true, the response is `403 FORBIDDEN`.

---

## Response Format

Every response follows the same envelope:

### Success Response

```json
{
  "success": true,
  "data": { /* resource or array */ },
  "error": null
}
```

### Error Response

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable explanation",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP Status | When |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Missing required fields, invalid enum values, non-numeric IDs |
| `FORBIDDEN` | 403 | Role not allowed or "own" check failed |
| `NOT_FOUND` | 404 | Resource ID does not exist |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Assumptions

- **IDs are numeric and auto-incremented.** Each resource starts at `id: 1` and increments by 1 on every successful create. IDs are never reused after deletion.
- **Data is in-memory.** All data is stored in JavaScript arrays and **resets every time the server restarts**. No database persistence.
- **Mock data is seeded on startup.** 3–5 sample records exist for each resource so the API is usable immediately.
- **Passwords are stored in plain text.** This is acceptable for Assignment 2; hashing comes later.
- **Timestamps** (`createDate`, `createdAt`, `updateDate`, `lastAttemptAt`) are auto-set on create/update — clients should not send them.
- **`companyId` on evaluations is auto-derived** from `problem.createdBy` — clients should not send it.
- **`sequenceNumber` on messages is auto-assigned** based on existing messages in the conversation — clients should not send it.
- **No CORS configuration** — requests must originate from `localhost` or use a tool like Postman.

---

## Testing

### Option 1: Postman (Recommended)

1. Open Postman → click **Import**
2. Select `docs/AristoSolve.postman_collection.json`
3. The full **AristoSolve** collection appears in your sidebar with every endpoint pre-configured (correct headers + example bodies).
4. Start the server (`npm run dev`), then click any request → **Send**.

> Using Postman Web? You'll need the **Postman Desktop Agent** installed to reach `localhost`.

### Option 2: curl

```bash
# List all users (admin)
curl -X GET http://localhost:3000/users \
  -H "x-user-role: admin"

# Get all problems (public)
curl -X GET http://localhost:3000/problems

# Create a candidate
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Doe","email":"jane@example.com","password":"secret","userRole":"candidate"}'
```

---

# API Reference

## Users

### GET /users
List all users.

| | |
|---|---|
| **Access** | `admin` |
| **Headers** | `x-user-role: admin` |

**Success (200):**
```json
{
  "success": true,
  "data": [
    { "userId": 1, "firstName": "Alice", "lastName": "Admin", "email": "alice@example.com", "password": "admin123", "userRole": "admin", "level": "advanced", "createDate": "2024-01-01T00:00:00Z", "updateDate": "2024-01-01T00:00:00Z" }
  ],
  "error": null
}
```

---

### GET /users/:id
Get a single user.

| | |
|---|---|
| **Access** | `admin`, or the user themselves |
| **Headers** | `x-user-role: admin` + `x-user-id: 1` (or matching role/ID) |

**Success (200):**
```json
{ "success": true, "data": { "userId": 1, "firstName": "Alice", ... }, "error": null }
```

**Error (403):**
```json
{ "success": false, "data": null, "error": { "code": "FORBIDDEN", "message": "Access denied", "details": {} } }
```

---

### POST /users
Create a new user (public registration).

| | |
|---|---|
| **Access** | Public — no headers required |
| **Headers** | `Content-Type: application/json` |

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "userRole": "candidate",
  "level": "beginner"
}
```

**Required:** `firstName`, `lastName`, `email`, `password`, `userRole`
**Optional:** `level` (defaults to `beginner`)
**Enum — `userRole`:** `admin | company | candidate`
**Enum — `level`:** `beginner | intermediate | advanced`

**Success (201):**
```json
{
  "success": true,
  "data": { "userId": 6, "firstName": "Jane", "lastName": "Doe", "email": "jane@example.com", "password": "secret123", "userRole": "candidate", "level": "beginner", "createDate": "2024-05-15T12:00:00.000Z", "updateDate": "2024-05-15T12:00:00.000Z" },
  "error": null
}
```

**Error (400):**
```json
{ "success": false, "data": null, "error": { "code": "VALIDATION_ERROR", "message": "firstName, lastName, email, password, and userRole are required", "details": {} } }
```

---

### PUT /users/:id
Update a user.

| | |
|---|---|
| **Access** | `admin`, or the user themselves |
| **Headers** | `Content-Type: application/json`, `x-user-role`, `x-user-id` |

**Request Body** (any subset of user fields):
```json
{ "level": "intermediate" }
```

**Success (200):** Returns the updated user.

---

### DELETE /users/:id
Delete a user.

| | |
|---|---|
| **Access** | `admin` only |
| **Headers** | `x-user-role: admin` |

**Success (200):**
```json
{ "success": true, "data": { "message": "User 5 deleted" }, "error": null }
```

---

## Problems

### GET /problems
List all problems with optional filtering.

| | |
|---|---|
| **Access** | Public |
| **Headers** | None |
| **Query Params** | `difficulty`, `topic`, `type` (all optional) |

**Examples:**
```
GET /problems
GET /problems?difficulty=easy
GET /problems?topic=arrays
GET /problems?difficulty=medium&type=algorithm
```

**Success (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "title": "Two Sum", "difficulty": "easy", "topic": "arrays", "type": "algorithm", "description": "...", "constraints": "...", "examples": [...], "evalPrompt": "...", "isPublic": false, "createdBy": 2, "createdAt": "2024-01-10T00:00:00Z" }
  ],
  "error": null
}
```

---

### GET /problems/:id
Get one problem.

| | |
|---|---|
| **Access** | Public |

**Success (200):** Returns the problem object.
**Error (404):** Returned if the ID does not exist.

---

### POST /problems
Create a new problem.

| | |
|---|---|
| **Access** | `admin` or `company` |
| **Headers** | `Content-Type: application/json`, `x-user-role: company` |

**Request Body:**
```json
{
  "title": "Contains Duplicate",
  "difficulty": "easy",
  "topic": "arrays",
  "type": "algorithm",
  "description": "Given an integer array nums, return true if any value appears at least twice.",
  "constraints": "1 <= nums.length <= 10^5",
  "examples": [{ "input": "nums = [1,2,3,1]", "output": "true" }],
  "evalPrompt": "Reward hash set solution.",
  "isPublic": false,
  "createdBy": 2
}
```

**Required:** `title`, `difficulty`, `topic`, `type`, `description`, `createdBy`
**Enum — `difficulty`:** `easy | medium | hard`
**Enum — `type`:** `algorithm | system-design | debugging`

**Success (201):** Returns the created problem with auto-assigned `id` and `createdAt`.

---

### PUT /problems/:id

| | |
|---|---|
| **Access** | `admin` or `company` |
| **Headers** | `Content-Type: application/json`, `x-user-role` |

**Request Body** (any subset of problem fields).

---

### DELETE /problems/:id

| | |
|---|---|
| **Access** | `admin` only |

---

## Conversations

### GET /conversations
List all conversations.

| | |
|---|---|
| **Access** | `admin` |
| **Headers** | `x-user-role: admin` |

---

### GET /conversations/:id
Get a conversation **with its messages embedded**.

| | |
|---|---|
| **Access** | `admin`, or the conversation's owner |
| **Headers** | `x-user-role`, `x-user-id` |

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 3,
    "problemId": 1,
    "language": "javascript",
    "startedAt": "2024-02-01T10:00:00Z",
    "endedAt": "2024-02-01T10:45:00Z",
    "messages": [
      { "id": 1, "conversationId": 1, "sequenceNumber": 1, "role": "user", "content": "I think I should use a nested loop.", "createdAt": "2024-02-01T10:05:00Z" }
    ]
  },
  "error": null
}
```

---

### POST /conversations
Start a new conversation. A candidate may only create a conversation for themselves.

| | |
|---|---|
| **Access** | `candidate` |
| **Headers** | `Content-Type: application/json`, `x-user-role: candidate`, `x-user-id` |

**Request Body:**
```json
{
  "userId": 3,
  "problemId": 2,
  "language": "python"
}
```

**Required:** `userId`, `problemId`, `language`
**Enum — `language`:** `python | java | javascript`
**Constraint:** `userId` **must equal** `x-user-id` (otherwise 403).

**Success (201):**
```json
{ "success": true, "data": { "id": 6, "userId": 3, "problemId": 2, "language": "python", "startedAt": "...", "endedAt": null }, "error": null }
```

---

### PUT /conversations/:id
Update a conversation (e.g. set `endedAt`).

| | |
|---|---|
| **Access** | `admin` |
| **Headers** | `Content-Type: application/json`, `x-user-role: admin` |

---

### DELETE /conversations/:id

| | |
|---|---|
| **Access** | `admin` |

---

## Messages

Messages are **nested** under conversations.

### GET /conversations/:id/messages

| | |
|---|---|
| **Access** | `admin`, or the conversation's owner |
| **Headers** | `x-user-role`, `x-user-id` |

**Success (200):** Returns an array of messages for that conversation.

---

### POST /conversations/:id/messages
Send a new message.

| | |
|---|---|
| **Access** | `candidate` who owns the conversation |
| **Headers** | `Content-Type: application/json`, `x-user-role: candidate`, `x-user-id` |

**Request Body:**
```json
{
  "role": "user",
  "content": "I think I can use a hash map."
}
```

**Required:** `role`, `content`
**Enum — `role`:** `user | assistant`
**Auto-assigned:** `id`, `conversationId`, `sequenceNumber`, `createdAt`

---

### PUT /conversations/:id/messages/:msgId

| | |
|---|---|
| **Access** | `admin` |

---

### DELETE /conversations/:id/messages/:msgId

| | |
|---|---|
| **Access** | `admin` |

---

## Evaluations

### GET /evaluations
List evaluations.

| | |
|---|---|
| **Access** | `admin` (all), `company` (only those for problems they created) |
| **Headers** | `x-user-role`, `x-user-id` (for company filtering) |

**Success (200):** Returns array of evaluations. For company users, only evaluations where `companyId` matches `x-user-id`.

---

### GET /evaluations/:id

| | |
|---|---|
| **Access** | `admin` (any), `company` (only own), `candidate` (only own) |
| **Headers** | `x-user-role`, `x-user-id` |

---

### POST /evaluations
Create an evaluation.

| | |
|---|---|
| **Access** | `admin` only |
| **Headers** | `Content-Type: application/json`, `x-user-role: admin` |

**Request Body:**
```json
{
  "userId": 3,
  "problemId": 2,
  "conversationId": 2,
  "score": 88,
  "feedback": "Great use of sorted-key grouping.",
  "thinkingAnalysis": "Candidate independently identified the optimal approach."
}
```

**Required:** All fields above
**Constraint — `score`:** number between 0 and 100
**Auto-assigned:** `id`, `companyId` (from `problem.createdBy`), `createdAt`

---

### PUT /evaluations/:id

| | |
|---|---|
| **Access** | `admin` |

---

### DELETE /evaluations/:id

| | |
|---|---|
| **Access** | `admin` |

---

## Progress

### GET /progress
List all progress records.

| | |
|---|---|
| **Access** | `admin` |
| **Headers** | `x-user-role: admin` |

---

### GET /progress/:id

| | |
|---|---|
| **Access** | `admin`, or the user themselves |
| **Headers** | `x-user-role`, `x-user-id` |

---

### POST /progress
Create a progress record. Candidate may only create for themselves.

| | |
|---|---|
| **Access** | `candidate` |
| **Headers** | `Content-Type: application/json`, `x-user-role: candidate`, `x-user-id` |

**Request Body:**
```json
{
  "userId": 3,
  "problemId": 4,
  "status": "in_progress"
}
```

**Required:** `userId`, `problemId`, `status`
**Enum — `status`:** `in_progress | completed`
**Constraint:** `userId` **must equal** `x-user-id` (otherwise 403).
**Auto-assigned:** `id`, `attempts: 1`, `lastAttemptAt`, `deadline: null`

---

### PUT /progress/:id

| | |
|---|---|
| **Access** | `admin`, or the user themselves |
| **Headers** | `Content-Type: application/json`, `x-user-role`, `x-user-id` |

**Request Body** (any subset):
```json
{ "status": "completed" }
```

---

### DELETE /progress/:id

| | |
|---|---|
| **Access** | `admin` |

---

## Project Structure

```
AristoSolve/
├── server.js               ← App entry point, middleware + route mounting
├── routes/                 ← Express Router definitions (no logic)
├── controllers/            ← Request/response logic + validation
├── models/                 ← In-memory data arrays + CRUD helpers
├── middleware/
│   ├── auth.js             ← Role-based access: auth(['admin', 'company'])
│   └── logger.js           ← Logs method, URL, status, response time
└── docs/
    └── AristoSolve.postman_collection.json
```

---

## Seed Data (Mock Users for Quick Testing)

| User ID | Name | Role | Use for testing |
|---|---|---|---|
| 1 | Alice Admin | `admin` | Test admin-only endpoints |
| 2 | Bob Builder | `company` | Test company endpoints (created problems 1, 2, 5) |
| 3 | Carol Chen | `candidate` | Test candidate endpoints + own access |
| 4 | Dave Dev | `candidate` | Another candidate |
| 5 | Eva Evans | `candidate` | Another candidate |

---

## Out of Scope (Assignment 2)

- Real authentication (JWT, sessions, password hashing)
- MySQL or any persistent database
- Actual AI chat integration
- File uploads
- WebSocket / real-time messaging
- CORS configuration
