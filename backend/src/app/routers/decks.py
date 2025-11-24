from typing import Optional

from datetime import datetime
from fastapi import HTTPException, Depends, APIRouter
from pydantic import BaseModel
from sqlmodel import Session

from ..models import Deck, Flashcard
from app.database import get_session
from app.tools.auth.authenticate import authenticate

router = APIRouter(tags=["decks"])


class DeckDTO(BaseModel):
    name: str
    description: Optional[str] = None
    public: Optional[bool] = False
    flashcards_ids: Optional[list[int]] = None
    tags: Optional[list[str]] = None


class DeckUpdateDTO(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    public: Optional[bool] = None
    flashcards_to_add: Optional[list[int]] = None
    flashcards_to_remove: Optional[list[int]] = None
    tags: Optional[list[str]] = None


from pydantic import BaseModel

class FlashcardSchema(BaseModel):
    id: int
    name: str
    creation_date: datetime

    class Config:
        from_attributes = True
        

class DeckSchema(BaseModel):
    id: int
    name: str
    description: str | None
    public: bool
    has_media: bool
    flashcards: list[FlashcardSchema]

    class Config:
        from_attributes = True


@router.post("/decks")
def createDeck(
    deck_data: DeckDTO,
    user_id: int = Depends(authenticate()),
    db: Session = Depends(get_session),
):
    user_id = int(user_id)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")

    # TODO: CHECK IF WORKS AFTER IMPLEMENTATION OF FLASHCARDS
    flashcards = getFlashcardsByIds(deck_data.flashcards_ids, db)

    has_media = False
    for flashcard in flashcards:
        media = flashcard.front_side.media or flashcard.back_side.media
        if media:
            has_media = True
            break

    # TODO: HANDLE TAGS (NOT IMPLEMENTED YET)
    if deck_data.tags:
        pass

    deck = Deck(
        name=deck_data.name,
        description=deck_data.description,
        owner_id=user_id,
        public=deck_data.public,
        has_media=has_media,
        flashcards=flashcards,
        creation_date=datetime.now(),
        last_edit_date=datetime.now(),
    )

    print(len(deck.flashcards))
    db.add(deck)
    db.commit()
    db.refresh(deck)
    return deck


@router.get("/decks", response_model=list[DeckSchema])
def getDecks(
    user_id: int = Depends(authenticate()), db: Session = Depends(get_session)
):
    user_id = int(user_id)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")

    decks = db.query(Deck).all()
    return decks


@router.get("/decks/{deck_id}")
def getDeck(
    deck_id: int,
    user_id: int = Depends(authenticate()),
    db: Session = Depends(get_session),
):
    user_id = int(user_id)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")

    deck = db.query(Deck).filter(Deck.id == deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    return deck


@router.delete("/decks/{deck_id}")
def deleteDeck(
    deck_id: int,
    user_id: int = Depends(authenticate()),
    db: Session = Depends(get_session),
):
    user_id = int(user_id)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")

    deck = db.query(Deck).filter(Deck.id == deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    # TODO: NOT SURE
    if deck.owner_id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this deck"
        )

    db.delete(deck)
    db.commit()
    return {"message": "Deck deleted successfully"}


@router.put("/decks/{deck_id}")
def updateDeck(
    deck_id: int,
    deck_data: DeckUpdateDTO,
    user_id: int = Depends(authenticate()),
    db: Session = Depends(get_session),
):
    user_id = int(user_id)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")

    deck = db.query(Deck).filter(Deck.id == deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    if deck.owner_id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this deck"
        )

    flashcards_to_add = getFlashcardsByIds(deck_data.flashcards_to_add, db)
    flashcards_to_remove = getFlashcardsByIds(deck_data.flashcards_to_remove, db)

    deck.flashcards.extend(flashcards_to_add)
    deck.flashcards = [fc for fc in deck.flashcards if fc not in flashcards_to_remove]

    deck.name = deck_data.name
    deck.description = deck_data.description
    deck.public = deck_data.public
    deck.last_edit_date = datetime.now()

    db.commit()
    db.refresh(deck)
    return deck


def getFlashcardsByIds(flashcards_ids: Optional[list[int]], db: Session):
    flashcards = []
    if flashcards_ids:
        flashcards = db.query(Flashcard).filter(Flashcard.id.in_(flashcards_ids)).all()
        if len(flashcards) != len(flashcards_ids):
            raise HTTPException(
                status_code=404, detail="One or more flashcards not found"
            )
    return flashcards
