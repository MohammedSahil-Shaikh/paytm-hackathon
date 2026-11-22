"""Health check routes."""

from fastapi import APIRouter

from app.schemas.health import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Return AI service health. No LLM calls are performed."""
    return HealthResponse(success=True, service="ai-service", status="healthy")
