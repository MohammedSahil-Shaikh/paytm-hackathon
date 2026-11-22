"""Health check routes."""

from fastapi import APIRouter

from app.schemas.health import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Return service health without depending on PostgreSQL."""
    return HealthResponse(success=True, service="backend", status="healthy")
