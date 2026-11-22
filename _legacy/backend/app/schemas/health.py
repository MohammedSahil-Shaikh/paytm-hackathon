"""Health check response schema."""

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Standard health payload for the backend service."""

    success: bool = Field(default=True)
    service: str = Field(default="backend")
    status: str = Field(default="healthy")
