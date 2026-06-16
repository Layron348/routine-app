from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user
from app.telegram_auth import validate_telegram_init_data
from sqlalchemy import func


router = APIRouter()


class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: str | None
    name: str


class UserResponse(BaseModel):
    id: int
    email: str | None
    name: str

    class Config:
        orm_mode = True


class TelegramAuthRequest(BaseModel):
    init_data: str


@router.post("/telegram", response_model=Token)
def telegram_auth(body: TelegramAuthRequest, db: Session = Depends(get_db)):
    telegram_user = validate_telegram_init_data(body.init_data)
    if not telegram_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Telegram init data",
        )

    telegram_id = telegram_user["telegram_id"]
    user = db.query(User).filter(User.telegram_id == telegram_id).first()

    if not user:
        email = f"tg_{telegram_id}@routine.local"
        user = User(
            telegram_id=telegram_id,
            email=email,
            name=telegram_user["name"],
            password_hash=None,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        name=user.name,
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user
