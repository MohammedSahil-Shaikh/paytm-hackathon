"""AI service route modules."""

from fastapi import APIRouter

from app.api.routes import health, interview

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(interview.router)
