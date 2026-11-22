"""Day Zero AI service FastAPI entry point."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_router
from app.core.config import get_settings
from app.core.logging import configure_logging

settings = get_settings()
configure_logging(settings)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.ai_service_name,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.on_event("startup")
async def on_startup() -> None:
    logger.info("%s starting in %s mode", settings.ai_service_name, settings.app_env)
    logger.info("LLM provider configured as: %s", settings.llm_provider)


@app.get("/")
async def root() -> dict[str, str]:
    """Root metadata endpoint."""
    return {
        "service": "ai-service",
        "message": "Day Zero AI service is running",
        "docs": "/docs",
        "health": "/health",
    }
