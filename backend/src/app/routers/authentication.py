from typing import Optional

from datetime import datetime
from fastapi import HTTPException, Depends, APIRouter
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, or_

from ..models import User
from app.database import get_session
from app.tools.auth.hash import hash_password
from app.tools.auth.jwt_handler import generate_token, invalidate_token

router = APIRouter(tags=["authentication"])


class UserRegisterDTO(BaseModel):
    username: str
    email: EmailStr
    password: str
    description: Optional[str] = None


class UserLoginDTO(BaseModel):
    login: str
    password: str


@router.post("/register")
def register(user: UserRegisterDTO, db: Session = Depends(get_session)):
    user_data = user.dict()
    user_data.update(
        {
            "verified": False,
            "active": True,
            "creation_date": datetime.utcnow(),
            "last_login_date": None,
            "settings": None,
        }
    )

    user_data["password"] = hash_password(user_data["password"])
    user_entry = (
        db.query(User)
        .filter(
            or_(
                User.email == user_data["email"], User.username == user_data["username"]
            )
        )
        .first()
    )

    if user_entry:
        raise HTTPException(
            status_code=400, detail="User with this username or mail already exists"
        )

    new_user = User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"token": generate_token(f"{new_user.id}")}


@router.post("/login")
def login(user: UserLoginDTO, db: Session = Depends(get_session)):
    hashed_password = hash_password(user.password)
    user_entry = (
        db.query(User)
        .filter(or_(User.username == user.login, User.email == user.login))
        .first()
    )

    if not user_entry:
        raise HTTPException(status_code=404, detail="User not found")

    if user_entry.password != hashed_password:
        raise HTTPException(status_code=401, detail="Wrong password")

    return {"token": generate_token(f"{user_entry.id}")}


@router.post("/logout")
def logout(token: str = Depends(invalidate_token)):
    return f"token {token} invalidated"
