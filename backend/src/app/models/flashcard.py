from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from .relations import DeckFlashcard, FlashcardTag

if TYPE_CHECKING:
    from .user import User
    from .deck import Deck
    from .tag import Tag
    from .progress import Progress


class Flashcard(SQLModel, table=True):
    __tablename__ = "flashcards"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    creation_date: datetime = Field(default_factory=datetime.utcnow)

    owner_id: int = Field(foreign_key="users.id")
    front_side_id: int = Field(foreign_key="flashcard_sides.id")
    back_side_id: int = Field(foreign_key="flashcard_sides.id")

    owner: "User" = Relationship(back_populates="flashcards")
    front_side: "FlashcardSide" = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Flashcard.front_side_id]"}
    )
    back_side: "FlashcardSide" = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Flashcard.back_side_id]"}
    )
    decks: List["Deck"] = Relationship(
        back_populates="flashcards", link_model=DeckFlashcard
    )
    tags: List["Tag"] = Relationship(
        back_populates="flashcards", link_model=FlashcardTag
    )
    progress_entries: List["Progress"] = Relationship(back_populates="flashcard")


class FlashcardSide(SQLModel, table=True):
    __tablename__ = "flashcard_sides"
    id: Optional[int] = Field(default=None, primary_key=True)
    content: Optional[str] = None

    media: List["FlashcardSideMedia"] = Relationship(back_populates="flashcard_side")


class Media(SQLModel, table=True):
    __tablename__ = "media"
    id: Optional[int] = Field(default=None, primary_key=True)
    alt: Optional[str] = None
    path: str
    type: str  # image/audio/video
    autoplay: bool = Field(default=False)
    upload_date: datetime = Field(default_factory=datetime.utcnow)

    flashcard_sides: List["FlashcardSideMedia"] = Relationship(back_populates="media")


class FlashcardSideMedia(SQLModel, table=True):
    __tablename__ = "flashcard_sides_media"
    id: Optional[int] = Field(default=None, primary_key=True)
    flashcard_side_id: int = Field(foreign_key="flashcard_sides.id")
    media_id: int = Field(foreign_key="media.id")

    flashcard_side: "FlashcardSide" = Relationship(back_populates="media")
    media: "Media" = Relationship(back_populates="flashcard_sides")
