# DayZero

**Your journey starts before Day One.**

AI-powered candidate-to-employee platform for the **Beyond 9TO5 Buildathon**:

company research → adaptive interview → evidence-based report → hiring transition → personalized 30/60/90 onboarding.

Built around **SerpApi** (Track 1) with optional **You.com** (Track 2).

## Stack (no Docker, no OpenAI)

- Next.js App Router + TypeScript + Tailwind
- Next.js API routes (modular monolith)
- **SerpApi** for live search + Google Gemini generation
- Optional You.com for cited research (Member 2)
- Optional Supabase PostgreSQL

Old FastAPI/Docker code is archived in `_legacy/`.

## What is done (current status)

### Foundation
- [x] Next.js app at repo root
- [x] Shared TypeScript contracts in `types/`
- [x] Modular folders: `lib/ai`, `lib/research`, `lib/mock`, `lib/supabase`
- [x] Navigable page shells + landing CTA
- [x] Env templates (`.env.example`)

### Member 1 — AI Engine (done)
- [x] `POST /api/candidate` — normalize profile + light resume skill extract
- [x] `POST /api/interview/start` — 5 tailored questions + session
- [x] `POST /api/interview/answer` — evaluation + adaptive follow-up
- [x] `POST /api/interview/finish` — evidence-based report
- [x] `POST /api/onboarding` — personalized 30/60/90 plan
- [x] `POST /api/hr-assistant` — no invented policies
- [x] SerpApi Google Gemini provider (replaces OpenAI)
- [x] SerpApi live enrichment (Google Search + News + Jobs) during interview start
- [x] Labeled mock fallback when `SERPAPI_API_KEY` is missing

### Member 2 — Research (partial)
- [x] Placeholder `/api/research` + SerpApi helper stubs
- [ ] Full SerpApi + You.com normalized `ResearchData` pipeline

### Member 3 — Frontend (partial)
- [x] Shell pages + mock-driven roadmap/research panels
- [ ] Full journey UI replacing placeholders

## APIs / keys you need to add

Paste these into `.env.local`:

| Variable | Required? | Where to get it | Used for |
|----------|-----------|-----------------|----------|
| `SERPAPI_API_KEY` | **Yes** for live demo | [SerpApi API Key](https://serpapi.com/manage-api-key) | Track 1: Gemini + Search + News + Jobs |
| `YOU_COM_API_KEY` | Optional (Track 2 / M2) | [You.com docs](https://you.com/docs) | Cited live research |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project | Persistence |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Optional | Supabase project | Client access (or legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`) |
| `SUPABASE_SECRET_KEY` | Optional (server only) | Supabase project | Server writes (or legacy `SUPABASE_SERVICE_ROLE_KEY`) |

Run [`supabase/schema.sql`](supabase/schema.sql) once in the Supabase SQL Editor to create the DayZero tables.

### SerpApi engines DayZero uses

| Engine | Purpose |
|--------|---------|
| `google_gemini` | Interview questions, evaluation, report, onboarding, HR answers |
| `google` | Company overview / organic results |
| `google_news` | Recent company news |
| `google_jobs` | Role/job requirement signals |

Redeem buildathon credits (already available on your account): Mumbai coupon `BEYOND9TO5MUMBAI500`.

### Not required
- OpenAI keys (removed)
- Docker / local Postgres

## Setup

```bash
cd paytm-hackathon
copy .env.example .env.local
# edit .env.local and paste SERPAPI_API_KEY=...
npm install
npm run dev
```

Open http://localhost:3000

Without `SERPAPI_API_KEY`, AI routes still work using clearly labeled `"source": "mock"` responses.

## Ownership

| Member | Branch | Owns |
|--------|--------|------|
| M1 AI | `feature/ai-interview` | `lib/ai/`, candidate/interview/onboarding/hr API routes |
| M2 Research | `feature/research` | `lib/research/`, `app/api/research` |
| M3 Frontend | `feature/frontend` | `app/` pages (non-api), `components/` |

## AI response envelope

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

`data.source` is `"ai"` (SerpApi Gemini) or `"mock"`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |

## Legacy archive

`_legacy/` = previous FastAPI microservices + Docker Compose (reference only).
