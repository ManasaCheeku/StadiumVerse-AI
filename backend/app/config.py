import os
from functools import lru_cache
from pydantic import BaseModel

# Use /tmp on Vercel because the deployment filesystem is read-only
DEFAULT_DB = (
    "sqlite:////tmp/stadiumverse.db"
    if os.getenv("VERCEL")
    else "sqlite:///./stadiumverse.db"
)


class Settings(BaseModel):
    app_name: str = "StadiumVerse AI"
    database_url: str = os.getenv("DATABASE_URL", DEFAULT_DB)
    jwt_secret: str = os.getenv("JWT_SECRET", "dev-only-change-me")
    jwt_issuer: str = "stadiumverse-ai"
    access_token_minutes: int = 60
    rate_limit_per_minute: int = 120


@lru_cache
def get_settings() -> Settings:
    return Settings()