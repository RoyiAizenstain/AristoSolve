# User Stories — AristoSolve

Legend: ✅ done · 🔲 good-to-have (post-submission) · ❌ not started

---

## 1. User Management & Authentication

- ✅ As a new user, I want to register for the system by providing my name, email, and password so I can create a personal profile and track my progress.
- ✅ As a registered user, I want to log in to the system securely to access my conversation history and solve new assigned problems.
- ✅ As a user, I want the system to identify my role (Candidate, Company, or Admin) so I can access only the screens and actions relevant to me.
- ✅ As a user, I want to update my profile settings (display name, email, theme, notifications) so I can personalize my experience.

---

## 2. Recruitment Track (Company-Led Testing)

- ✅ As a candidate, I want to see a list of active tests assigned to me on my dashboard including problem type, difficulty, and deadline.
- ✅ As a candidate, I want to tackle diverse problem types: algorithms, System Design, or debugging existing broken code.
- ✅ As a candidate, I want to choose my preferred programming language (Python, Java, or JavaScript) so I can solve problems in the language I'm most comfortable with.
- ✅ As a candidate, I want to interact with an AI mentor (AristoBot) powered by Claude that guides my thinking without giving the answer directly, and saves my full thought process for evaluation.
- ✅ As a candidate, I want AristoBot to also help me with basic language syntax (loops, data structures, methods) in my chosen language so I can focus on the problem logic.
- 🔲 As a candidate, I want to write code in a built-in editor with syntax highlighting so I can solve problems comfortably without switching tools. *(Monaco — post-submission)*
- 🔲 As a candidate, I want to run my code against test cases and see real output so I can verify my solution before submitting. *(Piston — post-submission)*
- ✅ As a candidate, I want to receive an AI-generated evaluation of my problem-solving approach and code after submitting, so I can understand my strengths and areas to improve.
- ✅ As a candidate, I want to return to an open problem and see my previous conversation history so I can continue where I left off.
- ❌ As a candidate, I want to view a dedicated evaluation report page showing my AI nativeness score so I can track my performance over time. *(post-submission)*
- ✅ As a company representative, I want to create problems with a custom evaluation prompt so I can tailor AI scoring to what matters for my hiring process.
- ✅ As a company representative, I want to assign a specific problem to a specific candidate with a deadline so I can run structured recruitment tests.
- ✅ As a company representative, I want the AI to automatically evaluate a candidate's conversation using the evaluation prompt I defined, so I get an objective, consistent assessment without reviewing every chat manually.
- ✅ As a company representative, I want to know if a candidate is **AI native** — meaning they can think alongside AI, ask good questions, push back when the AI is wrong, and use it as a thinking tool rather than an answer machine — so I can hire for the skills that matter in 2025.
- ✅ As a company representative, I want to see a full evaluation report with a score, feedback, thinking analysis, code analysis, and a breakdown of AI interaction quality (prompting, critical thinking, adaptability, code correctness) for each candidate.

---

## 3. Self-Learning Track

- ✅ As a student, I want to access an open problem repository categorized by difficulty and topic to practice independently.
- ✅ As a student, I want to filter problems by difficulty and topic so I can find problems that match my current skill level.
- ✅ As a user, I want to interact with an AI chat (powered by Claude Haiku) that functions as a mentor, encouraging active thinking and refusing to provide the final answer directly.
- 🔲 As a user, I want to view my progress statistics and scores over time to identify areas that require further improvement. *(Progress page — post-submission)*

---

## 4. System Operations & Control

- ✅ As an administrator, I want every server request to be recorded in a logger, including the HTTP method, URL, and request time for monitoring and debugging purposes.
- ✅ As an administrator, I want to ensure that all data sent to the API undergoes mandatory field validation before being processed.
- ✅ As an administrator, I want to enforce role-based access control to ensure that only companies can view candidate scores and only candidates can perform tests.
- ✅ As an administrator, I want to create, edit, and delete users so I can manage the platform's user base.
- ✅ As an administrator, I want all data to persist after server restarts so candidates' progress and evaluations are never lost.
