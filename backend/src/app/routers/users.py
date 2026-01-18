from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile
from pydantic import BaseModel
from typing import Optional
from uuid import uuid4

from sqlmodel import Session


from ..models import User
from ..database import get_session
from app.tools.auth.authenticate import authenticate
from app.tools.auth.validation import check_password
from app.tools.auth.hash import hash_password, verify_password


router = APIRouter(prefix="/users", tags=["users"])
files_dir = "./files/"

class UserDTO(BaseModel):
    id: int
    username: str
    email: str
    description: Optional[str] = ""
    creation_date: datetime
    active: bool
    verified: bool
    
    model_config = {
        "from_attributes": True
    }
    
class UserGetAllDTO(BaseModel):
    total_number: int
    users: list[UserDTO]
    
class UserUpdateDTO(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    description: Optional[str] = None
    
class PasswordChangeDTO(BaseModel):
    old_password: str
    new_password: str

##############################
#    Get user endpoints
##############################

@router.get("/", response_model=UserGetAllDTO)
def get_all_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    _: int = Depends(authenticate(["MODERATOR"])),
    db: Session = Depends(get_session)) -> list[User]:
    
    users = db.query(User)
    
    total_number = users.count()
        
    offset = (page - 1) * page_size
    users = users.offset(offset).limit(page_size).all()

    return {"total_number": total_number, "users": users}

@router.get("/me", response_model=UserDTO)
def get_current_user(user_id: int = Depends(authenticate()), db: Session = Depends(get_session)) -> User:
    return get_user_logic(user_id, db)

@router.get("/{user_id}", response_model=UserDTO)
def get_user(user_id: int, _: int = Depends(authenticate(["MODERATOR"])), db: Session = Depends(get_session)):
    return get_user_logic(user_id, db)

def get_user_logic(user_id: int, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

##############################
#    Deactivate user endpoints
##############################
@router.delete("/me", response_model=UserDTO)
def deactivate_current_user(user_id: int = Depends(authenticate()), db: Session = Depends(get_session)):
    return deactivate_user_logic(user_id, db)

@router.delete("/{user_id}", response_model=UserDTO)
def deactivate_user(user_id: int, _: int = Depends(authenticate(["MODERATOR"])), db: Session = Depends(get_session)):
    return deactivate_user_logic(user_id, db)

def deactivate_user_logic(user_id: int, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.active = False
    db.commit()
    
    return user

##############################
#    Activate user endpoints
##############################

@router.put("/{user_id}/activate", response_model=UserDTO)
def activate_user(user_id: int, _: int = Depends(authenticate(["MODERATOR"])), db: Session = Depends(get_session)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.active = True
    db.commit()
    
    return user

##############################
#    Update user endpoints
##############################
@router.put("/change_password", response_model=UserDTO)
def change_password(params: PasswordChangeDTO, user_id: int = Depends(authenticate()), db: Session = Depends(get_session)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    verify_password(user.password, params.old_password)

    password_errors = check_password(params.new_password)
    if len(password_errors) > 0:
        raise HTTPException(status_code=400, detail={"errors": password_errors})

    user.password = hash_password(params.new_password)
    db.commit()
    db.refresh(user)
    return user    

@router.put("/me", response_model=UserDTO)
def update_current_user(
    updated_user: UserUpdateDTO, 
    user_id: int = Depends(authenticate()), 
    db: Session = Depends(get_session)
    ):
    return update_user_logic(user_id, updated_user, db)

@router.put("/{user_id}", response_model=UserDTO)
def update_user(
    user_id: int, updated_user: UserUpdateDTO, 
    _: int = Depends(authenticate(["MODERATOR"])), 
    db: Session = Depends(get_session)
    ):
    return update_user_logic(user_id, updated_user, db)

def update_user_logic(user_id: int, updated_user: UserUpdateDTO, db: Session):
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

##############################
#    Upload avatar endpoint
##############################

@router.post("/upload_avatar")
def upload_avatar(file: UploadFile, user_id: int = Depends(authenticate()), db: Session = Depends(get_session)):
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