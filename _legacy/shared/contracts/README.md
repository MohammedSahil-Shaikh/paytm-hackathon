# Shared Contracts

This folder holds cross-service API agreements for Day Zero.

## Rules

- All three developers must agree before changing API contracts.
- Treat these documents as the source of truth for request/response shapes.
- Implement against the contracts; do not invent divergent field names in services.
- Foundation stage: contracts are templates for future work. Only health endpoints are implemented.

## Files

| File | Purpose |
|------|---------|
| `api-contracts.md` | REST contract templates for auth, interviews, AI evaluation, and reports |
