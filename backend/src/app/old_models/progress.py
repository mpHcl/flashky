from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User
    from .flashcard import Flashcard


class Progress(SQLModel, table=True):
    __tablename__ = "progress"
    id: Optional[int] = Field(default=None, primary_key=True)
    last_review_date: Optional[datetime] = None
    next_review_date: Optional[datetime] = None
    interval: Optional[int] = None  # in minutes
    efactor: float = Field(default=1)  # ease factor
    repetition: int = Field(default=0)
    correct_answers: int = Field(default=0)
    incorrect_answers: int = Field(default=0)
    user_id: int = Field(foreign_key="users.id")
    flashcard_id: int = Field(foreign_key="flashcards.id")

    user: "User" = Relationship(back_populates="progress")
    flashcard: "Flashcard" = Relationship(back_populates="progress_entries")
