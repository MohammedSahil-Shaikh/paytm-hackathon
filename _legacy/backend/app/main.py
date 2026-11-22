"""Day Zero backend FastAPI entry point."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes import api_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging

settings = get_settings()
configure_logging(settings)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(api_router, prefix=settings.api_prefix)


@app.on_event("startup")
async def on_startup() -> None:
    logger.info("%s starting in %s mode", settings.app_name, settings.app_env)
    logger.info("API prefix: %s", settings.api_prefix)
    logger.info("Frontend origin: %s", settings.frontend_url)


@app.get("/")
async def root() -> dict[str, str]:
    """Root metadata endpoint."""
    return {
        "service": "backend",
        "message": "Day Zero backend is running",
        "docs": "/docs",
        "health": f"{settings.api_prefix}/health",
    }
