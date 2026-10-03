from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    gee_project: str
    gee_service_account: str | None = None
    gee_private_key_file: str | None = None
    cors_origins: str = "http://localhost:5173"
    max_area_km2: float = 5000


settings = Settings()
