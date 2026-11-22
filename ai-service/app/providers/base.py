"""Provider abstraction for future LLM integrations."""

from abc import ABC, abstractmethod

from app.core.config import Settings, get_settings


class LLMProvider(ABC):
    """Abstract LLM provider interface.

    Future capabilities (not implemented yet):
    - Interview question generation
    - Follow-up question generation
    - Answer evaluation
    - Interview feedback
    - Speech-to-text / text-to-speech orchestration
    """

    @abstractmethod
    async def is_ready(self) -> bool:
        """Return whether the provider is configured and ready."""


class StubLLMProvider(LLMProvider):
    """No-op provider used during the foundation stage."""

    async def is_ready(self) -> bool:
        return False


def get_llm_provider(settings: Settings | None = None) -> LLMProvider:
    """Factory for LLM providers. Only the stub is available today."""
    active = settings or get_settings()
    # Future: branch on active.llm_provider for openai/anthropic/etc.
    _ = active.llm_provider
    return StubLLMProvider()
