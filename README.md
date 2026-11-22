# DayZero

**Your journey starts before Day One.**

AI-powered candidate-to-employee platform for the **Beyond 9TO5 Buildathon**:

**Setup → Company research → Adaptive voice interview → Evidence report → Hiring transition → Personalized 30/60/90 roadmap → HR assistant**

Built around **SerpApi** (Track 1) with optional **You.com** (Track 2). Navy/gold UI.

## Stack (no Docker, no OpenAI)

- Next.js App Router + TypeScript + Tailwind
- Next.js API routes (modular monolith)
- **SerpApi** for live search + Google Gemini generation
- Optional You.com for cited research (Member 2)
- Optional Supabase PostgreSQL (`supabase/schema.sql`)

Old FastAPI/Docker code is archived in `_legacy/`.

## Product journey

| Step | Route | What happens |
|------|-------|----------------|
| 1 Setup | `/setup` | Live `POST /api/candidate` → journey `sessionStorage` |
| 2 Research | `/research` | Live `POST /api/research` (SerpApi + optional You.com) |
| 3 Interview | `/interview` | Voice + camera proctor, 60m timer, `start` / `answer` / `finish` |
| 4 Report | `/report` | Evidence report from the interview session |
| 5 Hired | `/onboarding` | Hiring transition beat |
| 6 Roadmap | `/roadmap` | Personalized 30/60/90 from interview gaps |
| 7 HR | `/assistant` | Policy-safe HR Q&A (no invented policies) |

## What is done

### Foundation
- [x] Next.js app at repo root
- [x] Shared TypeScript contracts in `types/`
- [x] Modular folders: `lib/ai`, `lib/research`, `lib/mock`, `lib/supabase`, `lib/client`
- [x] Navy/gold journey UI + landing CTA
- [x] Env templates (`.env.example`)

### Member 1 — AI Engine
- [x] Envelope APIs `{ success, data, error }` for candidate / interview / onboarding / HR
- [x] SerpApi `google_gemini` generation with labeled `"source": "mock"` fallback
- [x] Interview start enrichment via SerpApi Search + News + Jobs
- [x] Adaptive evaluation (`quality` / `score` / `nextAction`) + in-memory sessions
- [x] Evidence report + personalized onboarding + HR assistant

### Member 2 — Research
- [x] Live `/api/research` orchestration (SerpApi + You.com) with mock fallback when keys/results missing

### Member 3 — Frontend
- [x] End-to-end journey pages on one `sessionStorage` journey store
- [x] Voice-first proctored interview (English, female TTS, auto-listen)

## APIs / keys

| Variable | Required? | Used for |
|----------|-----------|----------|
| `SERPAPI_API_KEY` | **Yes** for live AI/research | Gemini + Search + News + Jobs |
| `YOU_COM_API_KEY` | Optional | Cited research (Track 2) |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Persistence |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Optional | Client access |
| `SUPABASE_SECRET_KEY` | Optional (server) | Server writes |

Run [`supabase/schema.sql`](supabase/schema.sql) once in the Supabase SQL Editor if using persistence.

### Contract note

Runtime interview answers use `quality` / `score` / `nextAction` (`lib/ai/types`). Shared `types/interview.ts` still documents an older `rating` / `followUp` shape — UI + M1 APIs follow the runtime contract.

## Setup

```bash
cd paytm_hackathon
copy .env.example .env.local
# paste SERPAPI_API_KEY=...
npm install
npm run dev
```

Open http://localhost:3000

Without `SERPAPI_API_KEY`, AI/research still run with clearly labeled mock fallbacks.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
