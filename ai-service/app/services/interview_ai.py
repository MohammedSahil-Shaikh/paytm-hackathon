"""Future interview AI orchestration service.

Not implemented in the foundation stage. This module exists so the
team has a clear place for question generation, evaluation, and feedback.
"""

from app.providers.base import LLMProvider, get_llm_provider


class InterviewAIService:
    """Coordinates AI providers for interview workflows (future)."""

    def __init__(self, provider: LLMProvider | None = None) -> None:
        self.provider = provider or get_llm_provider()

    async def ready(self) -> bool:
        """Check whether an LLM provider is configured."""
        return await self.provider.is_ready()
