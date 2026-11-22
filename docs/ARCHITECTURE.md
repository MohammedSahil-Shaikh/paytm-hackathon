# Day Zero Architecture

Day Zero is an AI-powered digital interviewer platform. This document describes the foundation architecture used by the three-service monorepo.

## High-level overview

```
┌─────────────┐     REST/JSON      ┌─────────────┐
│  Frontend   │ ─────────────────► │   Backend   │
│  Next.js    │                    │   FastAPI   │
└─────────────┘                    └──────┬──────┘
       │                                  │
       │ health check                     │ future orchestration
       ▼                                  ▼
┌─────────────┐                    ┌─────────────┐
│ AI Service  │ ◄──────────────────│ PostgreSQL  │
│  FastAPI    │   (via backend)    │             │
└─────────────┘                    └─────────────┘
```

During the foundation stage:

- Frontend owns the dashboard UI and service status checks.
- Backend owns application APIs and database configuration.
- AI service owns future LLM and interview intelligence workloads.
- PostgreSQL is prepared but not required for health endpoints.

## Frontend

**Location:** `frontend/`

**Stack:** Next.js App Router, TypeScript, Tailwind CSS, Lucide icons

**Responsibilities:**

- Authenticated-looking SaaS dashboard shell
- Navigation and placeholder pages for upcoming modules
- Centralized API helpers and environment-based service URLs
- Graceful health status display for backend and AI service

**Key modules:**

| Path | Role |
|------|------|
| `app/` | Routes and layouts |
| `components/layout/` | Sidebar, topbar, dashboard shell |
| `components/dashboard/` | Stats, interviews table, activity, quick actions, service status |
| `components/ui/` | Reusable primitives (button, badge, card, etc.) |
| `lib/` | API helpers and utilities |
| `types/` | Shared TypeScript types |

## Backend

**Location:** `backend/`

**Stack:** Python, FastAPI, Pydantic settings

**Responsibilities:**

- Versioned REST API (`/api/v1`)
- CORS and logging
- Health checks
- PostgreSQL connection configuration (optional at startup)
- Future interview, candidate, and report APIs

**Key modules:**

| Path | Role |
|------|------|
| `app/main.py` | Application entry point |
| `app/core/` | Settings, logging, CORS |
| `app/api/v1/routes/` | Versioned route handlers |
| `app/schemas/` | Request/response models |
| `app/services/` | Business logic layer |
| `app/repositories/` | Data access layer |
| `app/models/` | ORM / domain models (future) |
| `app/db/` | Database engine and session helpers |
| `app/utils/` | Shared helpers |

The backend must start and serve `/api/v1/health` even if PostgreSQL is offline.

## AI service

**Location:** `ai-service/`

**Stack:** Python, FastAPI

**Responsibilities:**

- Isolated AI microservice
- Health checks
- Provider abstraction for future LLM vendors
- Prompt templates and AI schemas
- Future: question generation, evaluation, feedback, STT/TTS

**Key modules:**

| Path | Role |
|------|------|
| `app/main.py` | Application entry point |
| `app/core/` | Settings and logging |
| `app/api/routes/` | Health and future AI routes |
| `app/providers/` | LLM provider abstraction |
| `app/prompts/` | Prompt templates |
| `app/schemas/` | AI request/response contracts |
| `app/services/` | AI orchestration logic |

No LLM integrations are implemented in the foundation stage.

## Database

**Engine:** PostgreSQL

**Connection:** `DATABASE_URL` environment variable on the backend

**Foundation rules:**

- Configure connection only
- Do not create business tables yet
- Health endpoint must not depend on a live database

## Service communication

Current (foundation):

1. Browser → Frontend (Next.js)
2. Frontend → Backend `GET /api/v1/health`
3. Frontend → AI service `GET /health`

Future:

1. Frontend → Backend for all product APIs
2. Backend → AI service for interview intelligence
3. Backend → PostgreSQL for persistence
4. Shared contracts in `shared/contracts/` govern request/response shapes

## Ownership boundaries

| Area | Owner focus |
|------|-------------|
| `frontend/` | UI, UX, client state, dashboard experience |
| `backend/` | APIs, auth, persistence, orchestration |
| `ai-service/` | LLM providers, prompts, evaluation |
| `shared/contracts/` | Cross-team API agreements |
| `docs/` | Architecture and workflow |

All three developers must agree before changing API contracts.
