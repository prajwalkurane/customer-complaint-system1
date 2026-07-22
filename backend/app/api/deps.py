from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.core.config import settings
bearer_scheme = HTTPBearer(auto_error=False)
def current_user(credentials: HTTPAuthorizationCredentials|None=Depends(bearer_scheme), db:Session=Depends(get_db)):
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required", headers={"WWW-Authenticate": "Bearer"})
    token = credentials.credentials
    try: user_id=int(jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]).get("sub"))
    except (JWTError,TypeError,ValueError): raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")
    user=db.get(User,user_id)
    if not user: raise HTTPException(status_code=401,detail="User not found")
    return user
def require_roles(*roles):
    def guard(user:User=Depends(current_user)):
        if user.role not in roles: raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="Insufficient role permissions")
        return user
    return guard
