from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from .relations import DeckTag, FlashcardTag

if TYPE_CHECKING:
    from .deck import Deck
    from .flashcard import Flashcard


class Tag(SQLModel, table=True):
    __tablename__ = "tags"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    type: str = Field(default="community")  # community/predefined

    decks: List["Deck"] = Relationship(back_populates="tags", link_model=DeckTag)
    flashcards: List["Flashcard"] = Relationship(
        back_populates="tags", link_model=FlashcardTag
    )
