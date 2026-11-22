# DayZero

**Your journey starts before Day One.**

AI-powered candidate-to-employee platform: company research → adaptive interview → report → hiring transition → personalized 30/60/90 onboarding.

## Stack (no Docker)

- Next.js App Router + TypeScript + Tailwind
- Next.js API routes (modular monolith)
- Supabase PostgreSQL (cloud)
- Modular AI + research libraries under `lib/`

Docker is **not** used. Old FastAPI/Docker code is archived in `_legacy/`.

## Prerequisites

- Node.js 20+
- npm 10+
- Supabase project (optional until persistence phase)
- API keys in `.env.local` when integrating AI/research

## Setup

```bash
cd paytm-hackathon
copy .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |

## Dependencies

Node packages are defined in `package.json` / `package-lock.json` (this replaces a Python `requirements.txt` for the active app).

There is **no Python venv** for DayZero. AI runs as TypeScript modules in `lib/ai/` via Next.js API routes.

## Ownership

| Member | Branch | Owns |
|--------|--------|------|
| M1 AI | `feature/ai-interview` | `lib/ai/`, interview/report/onboarding/hr API routes |
| M2 Research | `feature/research` | `lib/research/`, `app/api/research` |
| M3 Frontend | `feature/frontend` | `app/` pages (non-api), `components/` |

Shared (coordinate before changing):

- `types/`
- API contracts
- `supabase/migrations/`
- root config / README

## First deliverables

1. **M1:** Implement real `POST /api/interview/start` using `lib/ai/interview.ts`
2. **M2:** Implement real `POST /api/research` with SerpApi/You.com + mock fallback
3. **M3:** Replace page shells with full navigable UI on `lib/mock` data

## API placeholders

- `POST /api/research`
- `POST /api/candidate`
- `POST /api/interview/start`
- `POST /api/interview/answer`
- `POST /api/interview/finish`
- `POST /api/onboarding`
- `POST /api/hr-assistant`

## Legacy archive

`_legacy/` contains the previous FastAPI microservices + Docker Compose setup for reference only. Do not run it for the hackathon demo path.
