from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from .relations import DeckFlashcard, DeckTag, SavedDeck

if TYPE_CHECKING:
    from .tag import Tag
    from .user import User
    from .flashcard import Flashcard


class Deck(SQLModel, table=True):
    __tablename__ = "decks"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    public: bool = Field(default=False)
    has_media: bool = Field(default=False)
    creation_date: datetime = Field(default_factory=datetime.utcnow)
    last_edit_date: datetime = Field(default_factory=datetime.utcnow)
    owner_id: int = Field(foreign_key="users.id")
    
    owner: User = Relationship(back_populates="decks")
    flashcards: List["Flashcard"] = Relationship(
        back_populates="decks", link_model=DeckFlashcard
    )
    tags: List["Tag"] = Relationship(back_populates="decks", link_model=DeckTag)
    saved_by_users: List["User"] = Relationship(
        back_populates="saved_decks", link_model=SavedDeck
    )
    comments: List["Comment"] = Relationship(back_populates="deck")


class Comment(SQLModel, table=True):
    __tablename__ = "comments"
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    creation_date: datetime = Field(default_factory=datetime.utcnow)

    deck_id: int = Field(foreign_key="decks.id")
    author_id: int = Field(foreign_key="users.id")
    parent_id: Optional[int] = Field(foreign_key="comments.id", default=None)

    deck: "Deck" = Relationship(back_populates="comments")
    author: "User" = Relationship(back_populates="comments")
    parent: Optional["Comment"] = Relationship(
        sa_relationship_kwargs={"remote_side": "[Comment.id]"}
    )
