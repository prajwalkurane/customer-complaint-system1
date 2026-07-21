from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str = "sqlite:///./complaints.db"
    jwt_secret_key: str = "development-only-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    groq_api_key: str = ""
    groq_model: str = "gemma2-9b-it"
    upload_dir: str = "uploads"
    cors_origins: str = "http://localhost:5173"
    @property
    def upload_path(self):
        return Path(self.upload_dir)
settings = Settings()
