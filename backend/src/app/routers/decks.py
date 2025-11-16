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

@router.post("/decks")
def createDeck(deck: DeckDTO, user_id: int = Depends(authenticate()), db: Session = Depends(get_session)):
    user_id = int(user_id)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")

    flashcards = []
    if deck.flashcards_ids:
        flashcards = db.query(Flashcard).filter(Flashcard.id.in_(deck.flashcards_ids)).all()
        if len(flashcards) != len(deck.flashcards_ids):
            raise HTTPException(status_code=404, detail="One or more flashcards not found")

    # TODO: CHECK IF WORKS AFTER IMPLEMENTATION OF FLASHCARDS
    has_media = False
    for flashcard in flashcards:
        media = flashcard.front_side.media or flashcard.back_side.media
        if media:
            has_media = True
            break
        
    # TODO: HANDLE TAGS (NOT IMPLEMENTED YET)
    if deck.tags:
        pass

    deck = Deck(
        name=deck.name,
        description=deck.description,
        owner_id=user_id,
        public=deck.public,
        has_media=has_media,
        flashcards=flashcards,
        creation_date=datetime.now(),
        last_edit_date=datetime.now()
    )
    
    db.add(deck)    
    db.commit()
    db.refresh(deck)
    return deck

@router.get("/decks")
def getDecks(user_id: int = Depends(authenticate()), db: Session = Depends(get_session)):
    user_id = int(user_id)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    
    decks = db.query(Deck).all()
    return decks
    

@router.get("/decks/{deck_id}")
def getDeck(deck_id: int, user_id: int = Depends(authenticate()), db: Session = Depends(get_session)):
    user_id = int(user_id)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    
    deck = db.query(Deck).filter(Deck.id == deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    return deck