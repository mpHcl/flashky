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
def createFlashcard(
    flashcardDTO: FlashcardCreateDTO,
    sideFront: FlashcardSideCreateDTO,
    sideBack: FlashcardSideCreateDTO,
    user_id=Depends(authenticate()),
    db: Session = Depends(get_session),
):
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = int(user_id)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    flashcardFront = FlashcardSide(content=sideFront.content)
    flashcardBack = FlashcardSide(content=sideBack.content)
    db.add(flashcardFront)
    db.add(flashcardBack)
    db.commit()
    db.refresh(flashcardFront)
    db.refresh(flashcardBack)

    flashcard = Flashcard(
        name=flashcardDTO.name,
        owner_id=user_id,
        owner=user,
        front_side_id=flashcardFront.id,
        front_side=flashcardFront,
        back_side_id=flashcardBack.id,
        back_side=flashcardBack,
    )
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


@router.get("/myflashcards")
def getMyFlashcards(
    user_id=Depends(authenticate()), db: Session = Depends(get_session)
):
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = int(user_id)
    flashcards = db.query(Flashcard).filter(Flashcard.owner_id == user_id).all()
    return flashcards


@router.get("/{id}")
def getFlashcardById(id: int, db: Session = Depends(get_session)):
    flashcard = db.query(Flashcard).filter(Flashcard.id == id).first()
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    front = (
        db.query(FlashcardSide)
        .filter(FlashcardSide.id == flashcard.front_side_id)
        .first()
    )
    back = (
        db.query(FlashcardSide)
        .filter(FlashcardSide.id == flashcard.back_side_id)
        .first()
    )
    return {"flashcard": flashcard, "front": front, "back": back}


@router.put("/{id}")
def updateFlashcard(
    id: int,
    flashcardDTO: FlashcardCreateDTO | None = None,
    sideFront: FlashcardSideCreateDTO | None = None,
    sideBack: FlashcardSideCreateDTO | None = None,
    user_id=Depends(authenticate()),
    db: Session = Depends(get_session),
):
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = int(user_id)
    flashcard = db.query(Flashcard).filter(Flashcard.id == id).first()
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    if flashcard.owner_id != user_id:
        raise HTTPException(
            status_code=403, detail="You are not the owner of this flashcard"
        )
    front = (
        db.query(FlashcardSide)
        .filter(FlashcardSide.id == flashcard.front_side_id)
        .first()
    )
    back = (
        db.query(FlashcardSide)
        .filter(FlashcardSide.id == flashcard.back_side_id)
        .first()
    )

    if flashcardDTO is not None:
        flashcard.name = flashcardDTO.name
    if sideFront is not None and sideFront.content is not None:
        front.content = sideFront.content
    if sideBack is not None and sideBack.content is not None:
        back.content = sideBack.content

    db.commit()
    db.refresh(flashcard)
    db.refresh(front)
    db.refresh(back)
    return {"flashcard": flashcard, "front": front, "back": back}


@router.delete("/{id}")
def deleteFlashcard(
    id: int, user_id=Depends(authenticate()), db: Session = Depends(get_session)
):
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = int(user_id)
    flashcard = db.query(Flashcard).filter(Flashcard.id == id).first()
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    if flashcard.owner_id != user_id:
        raise HTTPException(
            status_code=403, detail="You are not the owner of this flashcard"
        )

    db.delete(flashcard)
    db.commit()
    return "Flashcard deleted successfully"
