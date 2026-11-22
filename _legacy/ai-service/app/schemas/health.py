"""Health check response schema."""

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Standard health payload for the AI service."""

    success: bool = Field(default=True)
    service: str = Field(default="ai-service")
    status: str = Field(default="healthy")
