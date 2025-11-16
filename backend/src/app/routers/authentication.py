from typing import Optional

from datetime import datetime
from fastapi import HTTPException, Depends, APIRouter
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, or_

from ..models import User
from app.database import get_session
from app.tools.auth.hash import hash_password, verify_password
from app.tools.auth.jwt_handler import generate_token, invalidate_token
from app.tools.auth.validation import check_password
from app.tools.auth.authenticate import authenticate

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
        
    password_errors = check_password(user_data["password"])
    if len(password_errors) > 0:
        raise HTTPException(status_code=400, detail={"errors": password_errors})

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
            status_code=409, detail="User with this username or mail already exists."
        )

    new_user = User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"token": generate_token(f"{new_user.id}")}


@router.post("/login")
def login(user: UserLoginDTO, db: Session = Depends(get_session)):
    user_entry = (
        db.query(User)
        .filter(or_(User.username == user.login, User.email == user.login))
        .first()
    )

    if not user_entry:
        raise HTTPException(status_code=404, detail="User not found")

    verify_password(user_entry.password, user.password)

    return {"token": generate_token(f"{user_entry.id}")}


@router.post("/logout")
def logout(token: str = Depends(invalidate_token)):
    return {"message": f"token {token} invalidated"}


@router.get("/check_token")
def check_token(user_id = Depends(authenticate())):
    return {"message": f"Valid token for user: {user_id}"}