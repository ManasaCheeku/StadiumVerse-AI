import os
from enum import Enum
from functools import lru_cache

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Detect deployment environment
IS_VERCEL = bool(os.getenv("VERCEL"))

# Use /tmp on Vercel because the deployment filesystem is read-only
DEFAULT_DB = (
    "sqlite:////tmp/stadiumverse.db"
    if IS_VERCEL
    else "sqlite:///./stadiumverse.db"
)


class Environment(str, Enum):
    development = "development"
    testing = "testing"
    staging = "staging"
    production = "production"


class Settings(BaseSettings):
    """
    StadiumVerse AI application configuration.

    Values are loaded from:
    1. Environment variables
    2. .env file (optional)
    3. Default values
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ------------------------------------------------------------------
    # Application
    # ------------------------------------------------------------------

    app_name: str = Field(
        default="StadiumVerse AI",
        description="Application name",
    )

    environment: Environment = Field(
        default=Environment.development,
        description="Application environment",
    )

    debug: bool = Field(
        default=False,
        description="Enable debug mode",
    )

    # ------------------------------------------------------------------
    # Database
    # ------------------------------------------------------------------

    database_url: str = Field(
        default=DEFAULT_DB,
        description="Database connection string",
    )

    # ------------------------------------------------------------------
    # Authentication
    # ------------------------------------------------------------------

    jwt_secret: str = Field(
        default="dev-only-change-me",
        description="JWT signing secret",
    )

    jwt_issuer: str = Field(
        default="stadiumverse-ai",
        description="JWT issuer",
    )

    access_token_minutes: int = Field(
        default=60,
        ge=5,
        le=1440,
        description="JWT expiry time (minutes)",
    )

    # ------------------------------------------------------------------
    # API
    # ------------------------------------------------------------------

    rate_limit_per_minute: int = Field(
        default=120,
        ge=10,
        le=1000,
        description="Maximum requests per minute",
    )

    allowed_origins: list[str] = Field(
        default=["http://localhost:5173"],
        description="Allowed CORS origins",
    )

    # ------------------------------------------------------------------
    # Validators
    # ------------------------------------------------------------------

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, value: str) -> str:
        supported = (
            "sqlite://",
            "postgresql://",
            "postgresql+psycopg://",
            "mysql://",
        )

        if not value.startswith(supported):
            raise ValueError("Unsupported database URL")

        return value

    @model_validator(mode="after")
    def validate_production_settings(self):
        """
        Prevent insecure production deployments.
        """

        if (
            self.environment == Environment.production
            and self.jwt_secret == "dev-only-change-me"
        ):
            raise ValueError(
                "JWT_SECRET must be configured in production."
            )

        return self


@lru_cache
def get_settings() -> Settings:
    """
    Return cached application settings.

    In tests:
        get_settings.cache_clear()
    """
    return Settings()


settings = get_settings()