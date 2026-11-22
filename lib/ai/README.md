# DayZero AI Engine (Member 1)

Uses **SerpApi** only (Beyond 9TO5 Track 1). No OpenAI.

## Provider

- Generation: SerpApi `engine=google_gemini`
- Live context: `google`, `google_news`, `google_jobs`
- Key: `SERPAPI_API_KEY`
- Fallback: deterministic mock with `source: "mock"`

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/candidate` | Normalize candidate profile |
| POST | `/api/interview/start` | Session + 5 questions (+ SerpApi enrichment) |
| POST | `/api/interview/answer` | Evaluate + adaptive follow-up |
| POST | `/api/interview/finish` | Evidence-based report |
| POST | `/api/onboarding` | Personalized 30/60/90 plan |
| POST | `/api/hr-assistant` | Policy/onboarding Q&A |

## Env

```bash
SERPAPI_API_KEY=your_key_here
LLM_PROVIDER=serpapi_gemini
```

## Integration

### Member 2
Pass `ResearchData` into `/api/interview/start`. M1 also best-effort enriches with SerpApi Search/News/Jobs when the key is present.

### Member 3
1. `POST /api/interview/start`
2. Render `data.currentQuestion`
3. `POST /api/interview/answer` with `{ sessionId, answer }`
4. `POST /api/interview/finish` then `/api/onboarding`
