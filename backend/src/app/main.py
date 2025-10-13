from typing import Union, Optional
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from datetime import datetime


from sqlmodel import Session, or_

from app.auth.hash import hash_password
from app.database import init_db, get_session
from app.auth.jwt_handler import authentication, generate_token

app = FastAPI()


@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
def read_root(user_id = Depends(authentication())):
    return {"Hello": "World", "id":user_id}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


from .new_models import User

class UserRegisterDTO(BaseModel):
    username: str
    email: EmailStr
    password: str
    description: Optional[str] = None


class UserLoginDTO(BaseModel):
    login: str
    password: str


@app.post("/register")
def register(user: UserRegisterDTO, db: Session = Depends(get_session)):
    user_data = user.dict()
    user_data.update({
        "verified": False,
        "active": True,
        "creation_date": datetime.utcnow(),
        "last_login_date": None,
        "settings": None
    })
    
    user_data['password'] = hash_password(user_data['password'])
    user_entry = db.query(User).filter(
        or_(
            User.email == user_data["email"], 
            User.username == user_data["username"]
        )
    ).first()

    if user_entry: 
        raise HTTPException(status_code=400, detail="User with this username or mail already exists")
    
    new_user = User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"token": generate_token(f"{new_user.id}")}


@app.post("/login")
def login(user: UserLoginDTO, db: Session = Depends(get_session)):
    hashed_password = hash_password(user.password)
    user_entry = db.query(User).filter(
        or_(
            User.username == user.login,
            User.email == user.login
        )
    ).first()
    
    if not user_entry:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_entry.password != hashed_password:
        raise HTTPException(status_code=401, detail="Wrong password")
    
    return {"token": generate_token(f"{user_entry.id}")}


@app.post("/logout")
def logout():
    pass
