from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile
from pydantic import BaseModel
from typing import Optional
from uuid import uuid4

from sqlmodel import Session

from ..models import User
from app.database import get_session
from app.tools.auth.authenticate import authenticate


router = APIRouter(prefix="/users", tags=["users"])
files_dir = "./files/"

class UserDTO(BaseModel):
    id: int
    username: str
    email: str
    description: Optional[str] = None
    creation_date: datetime
    active: bool
    verified: bool
    
    model_config = {
        "from_attributes": True
    }
    
class UserUpdateDTO(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    description: Optional[str] = None

@router.get("/", response_model=list[UserDTO])
def get_all_users(q: Optional[str] = Query(None, min_length=1), db: Session = Depends(get_session)) -> list[User]:
    if q:
        users = db.query(User).filter(User.username.contains(q)).all()
    else:
        users = db.query(User).all()
    return users

@router.get("/me", response_model=UserDTO)
def get_current_user(user_id: int = Depends(authenticate()), db: Session = Depends(get_session)) -> User:
    return get_user(user_id, db)

@router.get("/{user_id}", response_model=UserDTO)
def get_user(user_id: int, db: Session = Depends(get_session)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user

@router.delete("/me", response_model=UserDTO)
def deactivate_current_user(user_id: int = Depends(authenticate()), db: Session = Depends(get_session)):
    return deactivate_user(user_id, db)

@router.delete("/{user_id}", response_model=UserDTO)
def deactivate_user(user_id: int, current_user_id: int = Depends(authenticate()), db: Session = Depends(get_session)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.active = False
    db.commit()
    
    return user

@router.put("/me", response_model=UserDTO)
def update_current_user(updated_user: UserUpdateDTO, user_id: int = Depends(authenticate()), db: Session = Depends(get_session)):
    return update_user(user_id, updated_user)
    
@router.put("/{user_id}", response_model=UserDTO)
def update_user(user_id: int, updated_user: UserUpdateDTO, current_user_id: int = Depends(authenticate()), db: Session = Depends(get_session)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    if updated_user.username is not None:
        user.username = updated_user.username
        
    if updated_user.email is not None:
        user.email = updated_user.email
    
    if updated_user.description is not None:
        user.description = updated_user.description
        
    db.commit()
    db.refresh(user)
    return user

@router.post("/upload_avatar")
def upload_avatar(file: UploadFile, user_id=Depends(authenticate()), db: Session = Depends(get_session)):
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    
    type = file.content_type.split("/")[0]
    if type not in ["image"]:
        raise HTTPException(status_code=415, detail="Unsupported media type, avatar must be an image")
    
    name_split = file.filename.split(".")
    filepath = str(uuid4()) + "." + name_split[len(name_split) - 1]
    f = file.file.read()
    with open(files_dir + filepath, "wb") as new_file:
        new_file.write(f)
        
    user = db.query(User).filter(User.id == int(user_id)).first()
    user.avatar_path = filepath
    db.commit()
    db.refresh(user)
    
    return {"avatar_path": filepath}