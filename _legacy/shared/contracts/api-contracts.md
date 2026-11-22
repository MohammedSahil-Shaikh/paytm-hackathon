# Day Zero API Contracts (Templates)

> **Status:** Foundation templates + AI interview-start.  
> **Implemented today:** Backend `GET /api/v1/health`, AI service `GET /health`, AI `POST /ai/interview/start`.  
> **Rule:** All three developers must agree before changing these contracts.

Base URLs (local):

- Backend: `http://localhost:8000`
- AI service: `http://localhost:8001`

Common response envelope (preferred for future APIs):

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Error envelope:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable explanation"
  }
}
```

---

## 1. Health

### Backend

`GET /api/v1/health`

```json
{
  "success": true,
  "service": "backend",
  "status": "healthy"
}
```

### AI service

`GET /health`

```json
{
  "success": true,
  "service": "ai-service",
  "status": "healthy"
}
```

---

## 2. Authentication (future)

### Login

`POST /api/v1/auth/login`

Request:

```json
{
  "email": "interviewer@company.com",
  "password": "********"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "access_token": "jwt-token",
    "token_type": "bearer",
    "user": {
      "id": "usr_123",
      "name": "Alex Interviewer",
      "email": "interviewer@company.com",
      "role": "interviewer"
    }
  },
  "error": null
}
```

### Me

`GET /api/v1/auth/me`

Headers: `Authorization: Bearer <token>`

---

## 3. Interview creation (future)

`POST /api/v1/interviews`

Request:

```json
{
  "candidate_id": "cand_001",
  "role": "Frontend Developer",
  "interview_type": "technical",
  "scheduled_at": "2026-11-25T10:00:00Z",
  "duration_minutes": 45
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "int_001",
    "status": "scheduled",
    "candidate_id": "cand_001",
    "role": "Frontend Developer",
    "interview_type": "technical",
    "scheduled_at": "2026-11-25T10:00:00Z"
  },
  "error": null
}
```

---

## 4. Interview sessions (future)

`POST /api/v1/interviews/{interview_id}/sessions/start`

Response:

```json
{
  "success": true,
  "data": {
    "session_id": "sess_001",
    "interview_id": "int_001",
    "status": "in_progress",
    "started_at": "2026-11-25T10:00:05Z"
  },
  "error": null
}
```

`POST /api/v1/interviews/{interview_id}/sessions/{session_id}/end`

---

## 5. Interview start (AI service)

AI Interview Engine entrypoint. Generates a personalized 5-question set.

`POST /ai/interview/start`

Request:

```json
{
  "candidate": {
    "name": "Jordan Lee",
    "resume_text": "Backend engineer with Python, FastAPI, PostgreSQL...",
    "skills": ["Python", "FastAPI", "PostgreSQL", "Redis"],
    "experience_years": 3,
    "education": "B.Tech Computer Science",
    "summary": "Built payment APIs and merchant tooling."
  },
  "target_company": "Paytm",
  "target_role": "Backend Engineer",
  "job_requirements": ["Python", "APIs", "SQL", "System design"],
  "company_research": null,
  "interview_type": "mixed",
  "question_count": 5
}
```

Notes:

- `company_research` is optional. If omitted, AI service uses mock research.
- `question_count` must be `5` for this milestone.

Response:

```json
{
  "success": true,
  "data": {
    "interview_id": "int_abc123",
    "target_company": "Paytm",
    "target_role": "Backend Engineer",
    "question_count": 5,
    "research_source": "mock_research",
    "company_research": {
      "company_name": "Paytm",
      "overview": "...",
      "products": ["UPI payments"],
      "culture_signals": ["High ownership"],
      "recent_focus": ["Payment reliability at scale"],
      "source": "mock_research"
    },
    "questions": [
      {
        "id": "q_001",
        "text": "Walk through how you would design...",
        "topic": "python",
        "difficulty": "mid",
        "category": "technical",
        "rationale": "Anchored on candidate skill 'Python' and role 'Backend Engineer'."
      }
    ]
  },
  "error": null
}
```

Question rules:

- Exactly 5 questions
- Must cover `technical`, `behavioral`, `problem_solving`, and `role_company`
- `difficulty` is one of `easy | mid | hard`

### Questions generate (future alias)

Backend may also orchestrate later via:

`POST /api/v1/interviews/{interview_id}/questions/generate`

AI internal alias (future):

`POST /ai/questions/generate`

---

## 6. Candidate responses (future)

`POST /api/v1/sessions/{session_id}/responses`

Request:

```json
{
  "question_id": "q_001",
  "answer_text": "I would use a token bucket...",
  "answered_at": "2026-11-25T10:08:00Z"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "response_id": "resp_001",
    "question_id": "q_001",
    "status": "received"
  },
  "error": null
}
```

---

## 7. AI evaluation (future)

Backend → AI service:

`POST /ai/evaluate`

Request:

```json
{
  "role": "Frontend Developer",
  "question": "Explain React reconciliation.",
  "answer": "React compares virtual DOM trees...",
  "rubric": ["correctness", "clarity", "depth"]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "score": 82,
    "summary": "Solid conceptual understanding with room for deeper examples.",
    "dimensions": {
      "correctness": 85,
      "clarity": 80,
      "depth": 78
    }
  },
  "error": null
}
```

---

## 8. Interview reports (future)

`GET /api/v1/interviews/{interview_id}/report`

Response:

```json
{
  "success": true,
  "data": {
    "interview_id": "int_001",
    "candidate": {
      "id": "cand_001",
      "name": "Jordan Lee"
    },
    "overall_score": 84,
    "recommendation": "advance",
    "strengths": ["System thinking", "Clear communication"],
    "improvements": ["Provide more concrete examples"],
    "generated_at": "2026-11-25T10:50:00Z"
  },
  "error": null
}
```

---

## Change control

1. Propose contract changes in a PR that updates this file first.
2. Get agreement from frontend, backend, and AI owners.
3. Then implement service code against the approved contract.
