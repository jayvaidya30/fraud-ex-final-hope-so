from urllib.parse import urlparse

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "dev"
    database_url: str = "sqlite:///./fraudex.db"
    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    API_V1_STR: str = "/api/v1"

    gemini_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices("GEMINI_API_KEY", "API_KEY"),
    )

    supabase_url: str | None = None
    supabase_anon_key: str | None = None
    supabase_jwt_audience: str = "authenticated"
    supabase_jwt_issuer: str | None = None
    # Supabase may issue HS256 tokens (signed with your project's JWT secret) or RS256 tokens (signed via JWKS).
    # We support both.
    supabase_jwt_algorithms: list[str] = ["RS256", "HS256"]
    supabase_jwt_secret: str | None = None

    @property
    def sqlalchemy_database_url(self) -> str:
        url = self.database_url
        if url.startswith("postgres://"):
            url = "postgresql://" + url[len("postgres://") :]
        if url.startswith("postgresql://") and "+" not in url.split("://", 1)[0]:
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        parsed = urlparse(url)
        if parsed.hostname and ("dbpass=" in parsed.hostname or parsed.hostname.startswith("%")):
            raise ValueError(
                "DATABASE_URL hostname looks malformed. Ensure the password is URL-encoded and only in the password field, "
                "and the host is like db.<project_ref>.supabase.co."
            )
        return url

    @property
    def supabase_jwks_url(self) -> str | None:
        if not self.supabase_url:
            return None
        return self.supabase_url.rstrip("/") + "/auth/v1/.well-known/jwks.json"

    @property
    def supabase_jwt_issuer_value(self) -> str | None:
        if self.supabase_jwt_issuer:
            return self.supabase_jwt_issuer
        if not self.supabase_url:
            return None
        return self.supabase_url.rstrip("/") + "/auth/v1"


settings = Settings()

