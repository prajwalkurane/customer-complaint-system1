from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import RegisterIn, LoginIn, TokenOut, UserOut
from app.core.security import hash_password, verify_password, create_access_token
from app.api.deps import current_user
router=APIRouter(prefix="/auth",tags=["Authentication"])
@router.post("/register",response_model=TokenOut,status_code=201)
def register(data:RegisterIn,db:Session=Depends(get_db)):
    if db.query(User).filter_by(email=data.email.lower()).first(): raise HTTPException(409,"Email already registered")
    user=User(email=data.email.lower(),full_name=data.full_name,password_hash=hash_password(data.password)); db.add(user); db.commit(); db.refresh(user); return TokenOut(access_token=create_access_token(str(user.id)))
@router.post("/login",response_model=TokenOut)
def login(data:LoginIn,db:Session=Depends(get_db)):
    user=db.query(User).filter_by(email=data.email.lower()).first()
    if not user or not verify_password(data.password,user.password_hash): raise HTTPException(status.HTTP_401_UNAUTHORIZED,"Incorrect email or password")
    return TokenOut(access_token=create_access_token(str(user.id)))
@router.get("/me",response_model=UserOut)
def me(user:User=Depends(current_user)): return user
