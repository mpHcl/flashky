from typing import Optional

from datetime import datetime
from fastapi import HTTPException, Depends, APIRouter, Query
from pydantic import BaseModel, field_serializer
from sqlmodel import Session, func, or_

from ..models import Deck, Flashcard, Tag, User
from app.database import get_session
from app.tools.auth.authenticate import authenticate

router = APIRouter(prefix="/decks", tags=["decks"])


class DeckPostDTO(BaseModel):
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
    tags_to_add: Optional[list[str]] = None
    tags_to_remove: Optional[list[str]] = None


class FlashcardDTO(BaseModel):
    id: int
    name: str
    creation_date: datetime

    class Config:
        from_attributes = True


class DeckGetDTO(BaseModel):
    id: int
    name: str
    description: str | None
    public: bool
    has_media: bool
    flashcards: list[FlashcardDTO]
    tags: Optional[list[str]] = None

    class Config:
        from_attributes = True


class DeckGetAllDTO(BaseModel):
    total_number: int
    decks: list[DeckGetDTO]

    class Config:
        from_attributes = True


@router.post("/")
def create_deck(
    deck_data: DeckPostDTO,
    user_id: int = Depends(authenticate()),
    db: Session = Depends(get_session),
):
    user_id = int(user_id)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")

    flashcards = get_flashcards_by_ids(deck_data.flashcards_ids, db)

    has_media = any(
        flashcard.front_side.media or flashcard.back_side.media
        for flashcard in flashcards
    )

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

    db.add(deck)

    existing_tags = db.query(Tag).filter(Tag.name.in_(deck_data.tags)).all()

    existing_tag_as_dict = {tag.name: tag for tag in existing_tags}

    for tag_name in deck_data.tags:
        tag = existing_tag_as_dict.get(tag_name)

        if not tag:
            tag = Tag(name=tag_name)
            db.add(tag)

        deck.tags.append(tag)

    db.commit()
    db.refresh(deck)
    return create_deck_dto(deck)


@router.get("/", response_model=DeckGetAllDTO)
def get_decks(
    # auth
    user_id: int = Depends(authenticate()),
    # query params
    q: Optional[str] = Query(None, description="Search query"),
    owner: Optional[str] = Query(None, description="Owner username or id"),
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort: Optional[str] = Query("created_at"),
    # db
    db: Session = Depends(get_session),
):
    user_id = int(user_id)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")

    query = db.query(Deck)
    query = query.filter(or_(Deck.public, Deck.owner_id == user_id))

    if q:
        query = query.filter(Deck.name.ilike(f"%{q}%"))

    if owner:
        query = query.join(Deck.owner).filter(User.username == owner)

    if tags:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]
        if tag_list:
            query = (
                query.join(Deck.tags)
                .filter(func.lower(Tag.name).in_(tag_list))
                .distinct()
            )

    total_number = query.count()

    if sort == 1:
        query = query.order_by(Deck.created_at.desc())

    offset = (page - 1) * page_size
    decks = query.offset(offset).limit(page_size).all()

    return {
        "total_number": total_number,
        "decks": [create_deck_dto(deck) for deck in decks],
    }


@router.get("/mydecks", response_model=DeckGetAllDTO)
def get_my_decks(
    user_id=Depends(authenticate()),
    db: Session = Depends(get_session),
    q: Optional[str] = Query(None, description="Search query"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=0, le=100),
):
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = int(user_id)

    query = db.query(Deck).filter(Deck.owner_id == user_id)
    if q:
        query = query.filter(Flashcard.name.ilike(f"%{q}%"))
    total_number = query.count()

    if page_size > 0:
        offset = (page - 1) * page_size
        decks = query.offset(offset).limit(page_size).all()
    else:
        decks = query.all()

    return {
        "total_number": total_number,
        "decks": [create_deck_dto(deck) for deck in decks],
    }


@router.get("/saved", response_model=DeckGetAllDTO)
def get_saved_deck(
    user_id: int = Depends(authenticate()),
    db: Session = Depends(get_session),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=0, le=100),
):
    query = db.query(Deck).join(User.saved_decks).filter(User.id == user_id)

    total_number = query.count()

    if page_size > 0:
        offset = (page - 1) * page_size
        decks = query.offset(offset).limit(page_size).all()
    else:
        decks = query.all()

    return {
        "total_number": total_number,
        "decks": [create_deck_dto(deck) for deck in decks],
    }

@router.get("/hasflashcard/{flashcard_id}", response_model=DeckGetAllDTO)
def get_decks_containing_flashcard(
    flashcard_id: int,
    user_id: int = Depends(authenticate()),
    db: Session = Depends(get_session),
):
    user_id = int(user_id)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    
    flashcard = db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    decks = flashcard.decks
    total_number = len(decks)

    return {
        "total_number": total_number,
        "decks": [create_deck_dto(deck) for deck in decks],
    }

@router.get("/{deck_id}", response_model=DeckGetDTO)
def get_deck(
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

    return create_deck_dto(deck)


@router.delete("/{deck_id}")
def delete_deck(
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


@router.put("/{deck_id}", response_model=DeckGetDTO)
def update_deck(
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

    flashcards_to_add = get_flashcards_by_ids(deck_data.flashcards_to_add, db)
    flashcards_to_remove = get_flashcards_by_ids(deck_data.flashcards_to_remove, db)

    for flashcard_to_add in flashcards_to_add:
        if flashcard_to_add not in deck.flashcards:
            deck.flashcards.append(flashcard_to_add)

    deck.flashcards = [fc for fc in deck.flashcards if fc not in flashcards_to_remove]

    existing_tags_to_add = (
        db.query(Tag).filter(Tag.name.in_(deck_data.tags_to_add)).all()
    )
    existing_tag_to_add_as_dict = {tag.name: tag for tag in existing_tags_to_add}

    for tag_name in deck_data.tags_to_add:
        tag = existing_tag_to_add_as_dict.get(tag_name)

        if not tag:
            tag = Tag(name=tag_name)
            db.add(tag)

        if tag not in deck.tags:
            deck.tags.append(tag)

    for tag in list(deck.tags):
        if tag.name in deck_data.tags_to_remove:
            deck.tags.remove(tag)

    deck.name = deck_data.name
    deck.description = deck_data.description
    deck.public = deck_data.public
    deck.last_edit_date = datetime.now()
    db.commit()
    db.refresh(deck)
    return create_deck_dto(deck)


def get_flashcards_by_ids(flashcards_ids: Optional[list[int]], db: Session):
    flashcards = []
    if flashcards_ids:
        flashcards = db.query(Flashcard).filter(Flashcard.id.in_(flashcards_ids)).all()
        if len(flashcards) != len(flashcards_ids):
            raise HTTPException(
                status_code=404, detail="One or more flashcards not found"
            )
    return flashcards


@router.post("/{deck_id}/save")
def save_deck(
    deck_id: int,
    user_id: int = Depends(authenticate()),
    db: Session = Depends(get_session),
):
    deck = db.query(Deck).filter(Deck.id == deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    if deck.owner_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot save own decks")

    if not deck.public:
        raise HTTPException(
            status_code=403, detail="Cannot save this deck - deck is not public"
        )

    user = db.query(User).filter(User.id == user_id).first()

    if deck in user.saved_decks:
        return {"message": "Deck already saved"}

    user.saved_decks.append(deck)

    db.commit()

    return {"message": "Deck saved successfully"}


@router.delete("/{deck_id}/save")
def remove_saved_deck(
    deck_id: int,
    user_id: int = Depends(authenticate()),
    db: Session = Depends(get_session),
):
    user = db.query(User).filter(User.id == user_id).first()

    user.saved_decks = [deck for deck in user.saved_decks if deck.id != deck_id]

    db.commit()

    return {"message": "Deck removed from saved successfully"}


def create_deck_dto(deck: Deck):
    return DeckGetDTO(
        id=deck.id,
        name=deck.name,
        description=deck.description,
        public=deck.public,
        has_media=deck.has_media,
        flashcards=[
            FlashcardDTO(
                id=flashcard.id,
                name=flashcard.name,
                creation_date=flashcard.creation_date,
            )
            for flashcard in deck.flashcards
        ],
        tags=[tag.name for tag in deck.tags] if deck.tags is not None else [],
    )
