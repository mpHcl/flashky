from typing import Optional

from datetime import datetime
from fastapi import HTTPException, Depends, APIRouter
from pydantic import BaseModel
from sqlmodel import Session

from ..models import Flashcard, FlashcardSide, User
from app.database import get_session
from app.tools.auth.authenticate import authenticate

router = APIRouter(prefix="/flashcards", tags=["flashcards"])

class FlashcardSideCreateDTO(BaseModel):
    content: Optional[str] = None

class FlashcardCreateDTO(BaseModel):
    name: str


@router.post("/")
def createFlashcard(flashcardDTO: FlashcardCreateDTO, sideFront: FlashcardSideCreateDTO, sideBack: FlashcardSideCreateDTO, user_id=Depends(authenticate()), db: Session = Depends(get_session)):
    user_id = int(user_id)
    flashcardFront = FlashcardSide(content=sideFront.content)
    flashcardBack = FlashcardSide(content=sideBack.content)
    db.add(flashcardFront)
    db.add(flashcardBack)
    db.commit()
    db.refresh(flashcardFront)
    db.refresh(flashcardBack)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    flashcard = Flashcard(name=flashcardDTO.name, owner_id=user_id, owner=user, front_side_id=flashcardFront.id, front_side=flashcardFront, back_side_id=flashcardBack.id, back_side=flashcardBack)
    db.add(flashcard)
    db.commit()
    db.refresh(flashcard)
    # nie wypisało contentu stron, ale dodane poprawnie
    return {"flashcard": flashcard, "front": flashcardFront, "back": flashcardBack}


@router.get("/")
def getFlashcards(db: Session = Depends(get_session)):
    flashcards = db.query(Flashcard).all()
    sides = db.query(FlashcardSide).all()
    return {"flashcards": flashcards, "sides": sides}

