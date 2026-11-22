# Development Guide

Exact commands for running Day Zero services independently on a local machine.

## Prerequisites

- Node.js 20+
- npm 10+
- Python 3.11 or 3.12 (recommended; create a virtual environment per service)
- PostgreSQL 16+ (optional for foundation health checks)
- Docker Desktop (optional)

## Clone and enter the monorepo

```bash
cd day-zero
```

## Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

- URL: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard

## Backend

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.\.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Health: http://localhost:8000/api/v1/health
- Docs: http://localhost:8000/docs

## AI service

```bash
cd ai-service
python -m venv .venv

# Windows PowerShell
.\.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

- Health: http://localhost:8001/health
- Docs: http://localhost:8001/docs

## Recommended local ports

| Service    | Port |
|------------|------|
| Frontend   | 3000 |
| Backend    | 8000 |
| AI service | 8001 |
| PostgreSQL | 5432 |

## Environment files

Copy each `.env.example` before running:

| Service    | Example file              | Local file     |
|------------|---------------------------|----------------|
| Frontend   | `frontend/.env.example`   | `.env.local`   |
| Backend    | `backend/.env.example`    | `.env`         |
| AI service | `ai-service/.env.example` | `.env`         |

Never commit real `.env` files.

## Docker Compose (optional)

From `day-zero/`:

```bash
docker compose up --build
```

Stop:

```bash
docker compose down
```

Postgres-only (if running backend/frontend locally):

```bash
docker compose up postgres
```

## Health-check validation

With services running:

```bash
# Backend
curl http://localhost:8000/api/v1/health

# AI service
curl http://localhost:8001/health
```

Expected responses:

```json
{"success": true, "service": "backend", "status": "healthy"}
```

```json
{"success": true, "service": "ai-service", "status": "healthy"}
```

The dashboard service status panel should show Connected when those endpoints succeed, and Disconnected when they fail, without breaking the UI.

## Notes

- Backend starts without PostgreSQL for the foundation stage.
- AI service has no LLM calls yet.
- Interview product features are intentionally unimplemented placeholders.
