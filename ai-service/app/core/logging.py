"""Logging setup for the AI service."""

import logging
import sys

from app.core.config import Settings


def configure_logging(settings: Settings) -> None:
    """Configure root logging once at startup."""
    level = logging.DEBUG if settings.is_development else logging.INFO

    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )
