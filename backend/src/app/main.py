from typing import Union, Optional
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from datetime import datetime

from sqlmodel import Session

from app.database import init_db, get_session
from app.auth.jwt_handler import get_id_from_token, generate_token

app = FastAPI()


@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
def read_root(user_id = Depends(get_id_from_token)):
    return {"Hello": "World", "id":user_id}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


from app.models.user import User


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
    
    user_entry = db.query(User).filter(User.email == user_data.email or User.username == user_data.username).first()

    if user_entry: 
        raise HTTPException(status=400, detail="User with this username or mail already exists")
    
    new_user = User(user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"token": generate_token(f"{new_user.id}")}


@app.post("/login")
def login(user: UserLoginDTO, session: Session = Depends(get_session)):
    #remove token from deprecated
    pass


@app.post("/logout")
def logout():
    pass
