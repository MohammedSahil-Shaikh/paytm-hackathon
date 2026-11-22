# Contributing to Day Zero

Team workflow for a 3-member hackathon monorepo.

## Branch model

| Branch | Purpose |
|--------|---------|
| `main` | Stable, demo-ready |
| `develop` | Integration branch |
| `feature/frontend-*` | Frontend work |
| `feature/backend-*` | Backend work |
| `feature/ai-*` | AI service work |

## Rules

1. Never work directly on `main`.
2. Never push directly to `main`.
3. Start every feature branch from an updated `develop`.
4. Merge features into `develop` using Pull Requests.
5. Test integrated code on `develop`.
6. Only merge stable, tested code from `develop` to `main`.

## Creating a feature branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/frontend-dashboard-polish
```

Examples:

- `feature/frontend-service-status`
- `feature/backend-health-endpoint`
- `feature/ai-provider-stub`

## Commit messages

Use concise, imperative messages:

```text
Add dashboard service status panel
Fix backend CORS for local frontend
Prepare AI provider abstraction
```

Prefer:

- `Add` for new capabilities
- `Update` for enhancements
- `Fix` for bug fixes
- `Docs` for documentation-only changes

## Pull requests

1. Push your feature branch.
2. Open a PR into `develop`.
3. Include:
   - What changed
   - How to test
   - Screenshots for UI changes
4. Request review from at least one teammate when possible.
5. Resolve review comments before merge.

## Ownership boundaries

| Area | Primary ownership |
|------|-------------------|
| `frontend/` | Frontend developer |
| `backend/` | Backend developer |
| `ai-service/` | AI developer |
| `shared/contracts/` | Shared — all three must agree |
| `docs/` | Shared |

Cross-cutting changes (contracts, docker-compose, root README) require team discussion before merge.

## Integration process

1. Rebase or merge latest `develop` into your feature branch.
2. Run your service locally.
3. Verify health endpoints / dashboard routes relevant to your change.
4. Open PR → `develop`.
5. After merge, teammates pull `develop` before starting new work.
6. Promote `develop` → `main` only for stable demo checkpoints.

## Conflict resolution

1. Communicate early on overlapping files.
2. Prefer small, focused PRs.
3. For contract conflicts, pause and agree on the shared schema first.
4. Resolve merge conflicts locally, retest, then push.

## Testing before merging

Minimum checklist:

- [ ] Affected service starts without errors
- [ ] Health endpoints succeed when expected
- [ ] Dashboard still loads if backend/AI are offline
- [ ] No secrets committed (`.env` files stay local)
- [ ] README / docs updated when commands or ports change

## API contracts

Do not change `shared/contracts/` unilaterally. All three developers must agree before modifying request/response contracts.
