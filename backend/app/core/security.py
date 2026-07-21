from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def hash_password(value: str) -> str: return pwd_context.hash(value)
def verify_password(value: str, hashed: str) -> bool: return pwd_context.verify(value, hashed)
def create_access_token(subject: str) -> str:
    expiry = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode({"sub": subject, "exp": expiry}, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
