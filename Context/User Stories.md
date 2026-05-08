# User Stories - AI-Guided Problem Solving Platform

## 1. User Management & Authentication
* **As a new user**, I want to register for the system by providing my name, email, and password so that I can create a personal profile and track my progress.
* **As a registered user**, I want to log in to the system securely to access my conversation history and solve new assigned problems.
* **As a user**, I want the system to identify my role (Candidate, Company, or Admin) so that I can access only the screens and actions relevant to me.

## 2. Recruitment Track (Company-Led Testing)
* **As a candidate**, I want to see a list of active tests assigned to me by companies on my dashboard, including a clear deadline for each.
* **As a candidate**, I want to tackle diverse problem types: algorithms, System Design, or debugging existing broken code.
* **As a candidate**, I want to choose my preferred programming language (Python, Java, or JavaScript) so that I can solve problems in the language I'm most comfortable with.
* **As a candidate**, I want to interact with the AI to solve the test, knowing that my thought process and the questions I ask are saved for evaluation.
* **As a company representative**, I want to upload a test and define a unique "Evaluation Prompt" that instructs the AI on which professional aspects to prioritize when scoring (e.g., efficiency vs. readability).
* **As a company representative**, I want to receive a weighted score and a detailed report that assesses the candidate on both the correctness of the final solution and the quality of their AI interaction.

## 3. Self-Learning Track
* **As a student**, I want to access an open problem repository categorized by difficulty and topic to practice independently.
* **As a user**, I want to interact with an AI chat that functions as a mentor, encouraging active thinking and refusing to provide the final answer directly.
* **As a user**, I want to view my progress statistics and scores over time to identify areas that require further improvement.

## 4. System Operations & Control
* **As an administrator**, I want every server request to be recorded in a logger, including the HTTP method, URL, and request time for monitoring and debugging purposes.
* **As an administrator**, I want to ensure that all data sent to the API (such as chat messages or user creation) undergoes mandatory field validation before being processed.
* **As an administrator**, I want to enforce role-based access control to ensure that only companies can view candidate scores and only candidates can perform tests.