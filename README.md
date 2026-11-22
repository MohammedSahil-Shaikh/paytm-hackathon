# Day Zero

AI-powered digital interviewer platform — hackathon foundation.

Day Zero helps interviewers manage candidates, run structured interviews, and review AI-assisted insights. This repository contains the **initial foundation**: monorepo layout, service health checks, and a polished dashboard shell. Interview product logic is intentionally unimplemented.

## Purpose

Deliver a working project skeleton for a 3-member team:

- Frontend dashboard UI (Next.js)
- Backend REST API (FastAPI)
- Isolated AI microservice (FastAPI)
- Shared API contracts and docs
- Optional Docker Compose for local orchestration

## Technology stack

| Layer | Stack |
|-------|-------|
| Frontend | Next.js App Router, TypeScript, Tailwind CSS, Lucide |
| Backend | Python, FastAPI, REST/JSON |
| AI service | Python, FastAPI (provider-ready, no LLM yet) |
| Database | PostgreSQL (connection config only) |
| Tooling | npm, Python venv, Docker Compose (optional) |

## Architecture

```
frontend (3000) ──health──► backend (8000)
       │                        │
       └──health──► ai-service (8001)
                            │
                     postgres (5432) [optional]
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for module responsibilities.

## Folder structure

```text
day-zero/
├── frontend/          # Next.js dashboard
├── backend/           # FastAPI application API
├── ai-service/        # FastAPI AI microservice
├── shared/contracts/  # Cross-team API agreements
├── docs/              # Architecture, development, contributing
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js 20+
- npm 10+
- Python 3.11+
- Git
- PostgreSQL 16+ (optional for foundation)
- Docker Desktop (optional)

## Installation & local setup

```bash
cd day-zero
```

### 1. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### 2. Backend

```bash
cd backend
python -m venv .venv
# Windows: .\.venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. AI service

```bash
cd ai-service
python -m venv .venv
# Windows: .\.venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

Full command reference: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

## Environment variables

| Service | Example file | Key variables |
|---------|--------------|---------------|
| Frontend | `frontend/.env.example` | `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_AI_SERVICE_URL` |
| Backend | `backend/.env.example` | `APP_ENV`, `DATABASE_URL`, `FRONTEND_URL`, `AI_SERVICE_URL` |
| AI service | `ai-service/.env.example` | `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL` |

Copy examples to local env files. Never commit real secrets.

## Local URLs

| Resource | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Dashboard | http://localhost:3000/dashboard |
| Backend health | http://localhost:8000/api/v1/health |
| Backend docs | http://localhost:8000/docs |
| AI health | http://localhost:8001/health |
| AI docs | http://localhost:8001/docs |

## Docker startup

```bash
cd day-zero
docker compose up --build
```

Stop:

```bash
docker compose down
```

Services: `frontend`, `backend`, `ai-service`, `postgres`.

## API docs

- Live OpenAPI: `/docs` on backend and AI service
- Shared contracts: [shared/contracts/api-contracts.md](shared/contracts/api-contracts.md)

## Team Git workflow

Branches:

- `main` — stable, demo-ready
- `develop` — integration
- `feature/frontend-*`, `feature/backend-*`, `feature/ai-*`

Rules:

1. Never work or push directly on `main`
2. Branch from updated `develop`
3. Merge features into `develop` via Pull Requests
4. Promote only tested code from `develop` → `main`

Details: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)

## Current scope

Included:

- Monorepo foundation
- Dashboard UI with mock data
- Placeholder routes
- Backend + AI health endpoints
- Docs and Docker Compose

Not included yet:

- Real interview creation/sessions
- Auth
- LLM calls
- Business database tables
