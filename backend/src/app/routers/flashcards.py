from typing import Optional, List

from datetime import datetime
from fastapi import HTTPException, Depends, APIRouter, Query
from pydantic import BaseModel, field_serializer
from sqlmodel import Session, func, or_

from ..models import Flashcard, FlashcardSide, Tag, User, Media
from app.database import get_session
from app.tools.auth.authenticate import authenticate

router = APIRouter(prefix="/flashcards", tags=["flashcards"])


class FlashcardSideCreateDTO(BaseModel):
    content: Optional[str] = None


class FlashcardSideGetDTO(BaseModel):
    id: int
    content: Optional[str] = None
    media: Optional[list[int]] = None


class FlashcardCreateDTO(BaseModel):
    name: str
    front: FlashcardSideCreateDTO
    back: FlashcardSideCreateDTO
    tags: Optional[list[str]] = None


class FlashcardEditDTO(BaseModel):
    name: Optional[str] = None
    front: Optional[FlashcardSideCreateDTO] = None
    back: Optional[FlashcardSideCreateDTO] = None
    tags_to_add: Optional[list[str]] = None
    tags_to_remove: Optional[list[str]] = None


class FlashcardGetDTO(BaseModel):
    id: int
    name: str
    creation_date: datetime
    owner_id: int
    front_side: FlashcardSideGetDTO
    back_side: FlashcardSideGetDTO
    tags: Optional[list[str]] = None


class FlashcardGetAllDTO(BaseModel):
    total_number: int
    flashcards: list[FlashcardGetDTO]

    class Config:
        from_attributes = True


class FlashcardAddMediaDTO(BaseModel):
    media_id: int
    side: str


@router.post("/", response_model=FlashcardGetDTO)
def create_flashcard(
    flashcardDTO: FlashcardCreateDTO,
    user_id=Depends(authenticate()),
    db: Session = Depends(get_session),
):
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = int(user_id)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    flashcardFront = FlashcardSide(content=flashcardDTO.front.content)
    flashcardBack = FlashcardSide(content=flashcardDTO.back.content)
    flashcard = Flashcard(
        name=flashcardDTO.name,
        owner_id=user_id,
        owner=user,
        front_side=flashcardFront,
        back_side=flashcardBack,
    )
    db.add(flashcardFront)
    db.add(flashcardBack)
    db.add(flashcard)

    existing_tags = db.query(Tag).filter(Tag.name.in_(flashcardDTO.tags)).all()
    existing_tag_as_dict = {tag.name: tag for tag in existing_tags}

    for tag_name in flashcardDTO.tags:
        tag = existing_tag_as_dict.get(tag_name)

        if not tag:
            tag = Tag(name=tag_name)
            db.add(tag)

        flashcard.tags.append(tag)

    db.commit()
    db.refresh(flashcard)

    return create_flashcard_dto(flashcard)


@router.post("/{id}/media")
def add_media_to_flashcard_side(
    id: int,
    flashcardAddMediaDTO: FlashcardAddMediaDTO,
    user_id=Depends(authenticate()),
    db: Session = Depends(get_session),
):
    if flashcardAddMediaDTO.side not in ["front", "back"]:
        raise HTTPException(status_code=400, detail="Side is not 'front' or 'back'")
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

    media = db.query(Media).filter(Media.id == flashcardAddMediaDTO.media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    flashcard_media = (
        db.query(Flashcard)
        .filter(
            or_(
                Flashcard.front_side_id == media.flashcard_sides[0].id,
                Flashcard.back_side_id == media.flashcard_sides[0].id,
            )
        )
        .first()
    )
    if flashcard_media.owner_id != user_id:
        raise HTTPException(
            status_code=403, detail="You are not the owner of this media's flashcards"
        )

    if flashcardAddMediaDTO.side == "front":
        media.flashcard_sides.append(flashcard.front_side)
    else:
        media.flashcard_sides.append(flashcard.back_side)
    db.commit()
    return "Media added successfully"


@router.get("/", response_model=FlashcardGetAllDTO)
def get_flashcards(
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

    query = db.query(Flashcard)
    # TODO? should it be
    # query = query.filter(or_(Flashcard in public deck, Flashcard.owner_id == user_id))

    if q:
        query = query.filter(Flashcard.name.ilike(f"%{q}%"))

    if owner:
        query = query.join(Flashcard.owner).filter(User.username == owner)

    if tags:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]
        if tag_list:
            query = (
                query.join(Flashcard.tags)
                .filter(func.lower(Tag.name).in_(tag_list))
                .distinct()
            )

    total_number = query.count()

    if sort == 1:
        query = query.order_by(Flashcard.created_at.desc())

    offset = (page - 1) * page_size
    flashcards = query.offset(offset).limit(page_size).all()

    return {
        "total_number": total_number,
        "flashcards": [create_flashcard_dto(flashcard) for flashcard in flashcards],
    }


@router.get("/myflashcards", response_model=FlashcardGetAllDTO)
def get_my_flashcards(
    user_id=Depends(authenticate()),
    db: Session = Depends(get_session),
    q: Optional[str] = Query(None, description="Search query"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=0, le=100),
):
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = int(user_id)

    query = db.query(Flashcard).filter(Flashcard.owner_id == user_id)
    if q:
        query = query.filter(Flashcard.name.ilike(f"%{q}%"))
    total_number = query.count()

    if page_size > 0:
        offset = (page - 1) * page_size
        flashcards = query.offset(offset).limit(page_size).all()
    else:
        flashcards = query.all()

    return {
        "total_number": total_number,
        "flashcards": [create_flashcard_dto(flashcard) for flashcard in flashcards],
    }


@router.get("/{id}", response_model=FlashcardGetDTO)
def get_flashcard_by_id(id: int, db: Session = Depends(get_session)):
    flashcard = db.query(Flashcard).filter(Flashcard.id == id).first()
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    return create_flashcard_dto(flashcard)


@router.get("/{id}/isowned", response_model=bool)
def get_is_owned_flashcard(id: int, user_id=Depends(authenticate()), db: Session = Depends(get_session)):
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = int(user_id)

    flashcard = db.query(Flashcard).filter(Flashcard.id == id).first()
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    return flashcard.owner_id == user_id


@router.put("/{id}", response_model=FlashcardGetDTO)
def update_flashcard(
    id: int,
    flashcardDTO: FlashcardEditDTO,
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
    front = flashcard.front_side
    back = flashcard.back_side

    if flashcardDTO.name is not None:
        flashcard.name = flashcardDTO.name
    if flashcardDTO.front is not None and flashcardDTO.front.content is not None:
        front.content = flashcardDTO.front.content
    if flashcardDTO.back is not None and flashcardDTO.back.content is not None:
        back.content = flashcardDTO.back.content

    existing_tags_to_add = (
        db.query(Tag).filter(Tag.name.in_(flashcardDTO.tags_to_add)).all()
    )
    existing_tag_to_add_as_dict = {tag.name: tag for tag in existing_tags_to_add}

    for tag_name in flashcardDTO.tags_to_add:
        tag = existing_tag_to_add_as_dict.get(tag_name)

        if not tag:
            tag = Tag(name=tag_name)
            db.add(tag)

        if tag not in flashcard.tags:
            flashcard.tags.append(tag)

    for tag in list(flashcard.tags):
        if tag.name in flashcardDTO.tags_to_remove:
            flashcard.tags.remove(tag)

    db.commit()
    db.refresh(flashcard)

    return create_flashcard_dto(flashcard)


@router.delete("/{id}")
def delete_flashcard(
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


def create_flashcard_dto(flashcard: Flashcard):
    return FlashcardGetDTO(
        id=flashcard.id,
        name=flashcard.name,
        creation_date=flashcard.creation_date,
        owner_id=flashcard.owner_id,
        front_side=FlashcardSideGetDTO(
            id=flashcard.front_side.id,
            content=flashcard.front_side.content,
            media=(
                [m.id for m in flashcard.front_side.media]
                if flashcard.front_side.media is not None
                else []
            ),
        ),
        back_side=FlashcardSideGetDTO(
            id=flashcard.back_side.id,
            content=flashcard.back_side.content,
            media=(
                [m.id for m in flashcard.back_side.media]
                if flashcard.back_side.media is not None
                else []
            ),
        ),
        tags=[tag.name for tag in flashcard.tags] if flashcard.tags is not None else [],
    )
