from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional


class UserRole(SQLModel, table=True):
    __tablename__ = "users_roles"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    role_id: int = Field(foreign_key="roles.id")


class SavedDeck(SQLModel, table=True):
    __tablename__ = "saved_decks"
    id: Optional[int] = Field(default=None, primary_key=True)
    save_date: datetime = Field(default_factory=datetime.utcnow)

    user_id: int = Field(foreign_key="users.id")
    deck_id: int = Field(foreign_key="decks.id")


class DeckFlashcard(SQLModel, table=True):
    __tablename__ = "decks_flashcards"
    id: Optional[int] = Field(default=None, primary_key=True)
    deck_id: int = Field(foreign_key="decks.id")
    flashcard_id: int = Field(foreign_key="flashcards.id")


class DeckTag(SQLModel, table=True):
    __tablename__ = "decks_tags"
    id: Optional[int] = Field(default=None, primary_key=True)
    deck_id: int = Field(foreign_key="decks.id")
    tag_id: int = Field(foreign_key="tags.id")


class FlashcardTag(SQLModel, table=True):
    __tablename__ = "flashcards_tags"
    id: Optional[int] = Field(default=None, primary_key=True)
    flashcard_id: int = Field(foreign_key="flashcards.id")
    tag_id: int = Field(foreign_key="tags.id")
