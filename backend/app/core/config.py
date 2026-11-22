"""Application settings loaded from environment variables."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Backend runtime configuration."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = "development"
    app_name: str = "Day Zero Backend"
    api_prefix: str = "/api/v1"
    frontend_url: str = "http://localhost:3000"
    database_url: str = "postgresql+asyncpg://dayzero:dayzero@localhost:5432/dayzero"
    ai_service_url: str = "http://localhost:8001"

    @property
    def is_development(self) -> bool:
        return self.app_env.lower() in {"development", "dev", "local"}


@lru_cache
def get_settings() -> Settings:
    """Return a cached settings instance."""
    return Settings()
