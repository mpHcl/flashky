from typing import Optional, List

from datetime import datetime
from fastapi import HTTPException, Depends, APIRouter
from pydantic import BaseModel
from sqlmodel import Session, or_

from ..models import Flashcard, FlashcardSide, User, Media
from app.database import get_session
from app.tools.auth.authenticate import authenticate

router = APIRouter(prefix="/flashcards", tags=["flashcards"])


class FlashcardSideCreateDTO(BaseModel):
    content: Optional[str] = None

class FlashcardSideGetDTO(BaseModel):
    id: int
    content: str
    media_id: List[int] = []

class FlashcardCreateDTO(BaseModel):
    name: str
    front: FlashcardSideCreateDTO
    back: FlashcardSideCreateDTO

class FlashcardEditDTO(BaseModel):
    name: Optional[str] = None
    front: Optional[FlashcardSideCreateDTO] = None
    back: Optional[FlashcardSideCreateDTO] = None

class FlashcardGetDTO(BaseModel):
    id: int
    name: str
    creation_date: datetime
    owner_id: int
    front_side: FlashcardSideGetDTO
    back_side: FlashcardSideGetDTO


class FlashcardAddMediaDTO(BaseModel):
    media_id: int
    side: str


@router.post("/", response_model=FlashcardGetDTO)
def createFlashcard(flashcardDTO: FlashcardCreateDTO, user_id=Depends(authenticate()), db: Session = Depends(get_session)):
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = int(user_id)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    flashcardFront = FlashcardSide(content=flashcardDTO.front.content)
    flashcardBack = FlashcardSide(content=flashcardDTO.back.content)
    flashcard = Flashcard(name=flashcardDTO.name, owner_id=user_id, owner=user, front_side=flashcardFront, back_side=flashcardBack)
    db.add(flashcardFront)
    db.add(flashcardBack)
    db.add(flashcard)
    db.commit()
    db.refresh(flashcard)
    db.refresh(flashcardFront)
    db.refresh(flashcardBack)
    dto = FlashcardGetDTO(id=flashcard.id, name=flashcard.name, creation_date=flashcard.creation_date, owner_id=flashcard.owner_id, front_side=flashcardFront, back_side=flashcardBack)
    # nie wypisało contentu stron, ale dodane poprawnie
    return dto


@router.post("/{id}/media")
def addMediaToFlashcardSide(id: int, flashcardAddMediaDTO: FlashcardAddMediaDTO, user_id=Depends(authenticate()), db: Session = Depends(get_session)):
    if flashcardAddMediaDTO.side not in ["front", "back"]:
        raise HTTPException(status_code=400, detail="Side is not 'front' or 'back'")
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = int(user_id)

    flashcard = db.query(Flashcard).filter(Flashcard.id == id).first()
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    if flashcard.owner_id != user_id:
        raise HTTPException(status_code=403, detail="You are not the owner of this flashcard")
    
    media = db.query(Media).filter(Media.id == flashcardAddMediaDTO.media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    flashcard_media = db.query(Flashcard).filter(or_(Flashcard.front_side_id == media.flashcard_sides[0].id, Flashcard.back_side_id == media.flashcard_sides[0].id)).first()
    if (flashcard_media.owner_id != user_id):
        raise HTTPException(status_code=403, detail="You are not the owner of this media's flashcards")
    
    if flashcardAddMediaDTO.side == "front":
        media.flashcard_sides.append(flashcard.front_side)
    else:
        media.flashcard_sides.append(flashcard.back_side)
    db.commit()
    return "Media added successfully"
    



@router.get("/", response_model=list[FlashcardGetDTO])
def getFlashcards(db: Session = Depends(get_session)):
    flashcards = db.query(Flashcard).all()
    dtos = list[FlashcardGetDTO]()
    for flashcard in flashcards:
        dto = FlashcardGetDTO(id=flashcard.id, name=flashcard.name, creation_date=flashcard.creation_date, owner_id=flashcard.owner_id, front_side=flashcard.front_side, back_side=flashcard.back_side)
        dtos.append(dto)
    return dtos

@router.get("/myflashcards", response_model=list[FlashcardGetDTO])
def getMyFlashcards(user_id=Depends(authenticate()), db: Session = Depends(get_session)):
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = int(user_id)
    flashcards = db.query(Flashcard).filter(Flashcard.owner_id == user_id).all()
    dtos = list[FlashcardGetDTO]()
    for flashcard in flashcards:
        dto = FlashcardGetDTO(id=flashcard.id, name=flashcard.name, creation_date=flashcard.creation_date, owner_id=flashcard.owner_id, front_side=flashcard.front_side, back_side=flashcard.back_side)
        dtos.append(dto)
    return dtos

@router.get("/{id}", response_model=FlashcardGetDTO)
def getFlashcardById(id: int, db: Session = Depends(get_session)):
    flashcard = db.query(Flashcard).filter(Flashcard.id == id).first()
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    front = FlashcardSideGetDTO(id=flashcard.front_side.id, content=flashcard.front_side.content)
    for media in flashcard.front_side.media:
        front.media_id.append(media.id)
    back = FlashcardSideGetDTO(id=flashcard.back_side.id, content=flashcard.back_side.content)
    for media in flashcard.back_side.media:
        back.media_id.append(media.id)
    dto = FlashcardGetDTO(id=flashcard.id, name=flashcard.name, creation_date=flashcard.creation_date, owner_id=flashcard.owner_id, front_side=front, back_side=back)
    return dto

@router.put("/{id}", response_model=FlashcardGetDTO)
def updateFlashcard(id: int, flashcardDTO: FlashcardEditDTO, user_id=Depends(authenticate()), db: Session = Depends(get_session)):
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = int(user_id)
    flashcard = db.query(Flashcard).filter(Flashcard.id == id).first()
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    if flashcard.owner_id != user_id:
        raise HTTPException(status_code=403, detail="You are not the owner of this flashcard")
    front = flashcard.front_side
    back = flashcard.back_side
    
    if flashcardDTO.name is not None:
        flashcard.name = flashcardDTO.name
    if flashcardDTO.front is not None and flashcardDTO.front.content is not None:
        front.content = flashcardDTO.front.content
    if flashcardDTO.back is not None and flashcardDTO.back.content is not None:
        back.content = flashcardDTO.back.content

    db.commit()
    db.refresh(flashcard)
    dto = FlashcardGetDTO(id=flashcard.id, name=flashcard.name, creation_date=flashcard.creation_date, owner_id=flashcard.owner_id, front_side=flashcard.front_side, back_side=flashcard.back_side)
    return dto


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
