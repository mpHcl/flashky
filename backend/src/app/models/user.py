from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional, TYPE_CHECKING
from datetime import datetime
from sqlalchemy.orm import Mapped
from .relations import UserRole, SavedDeck

if TYPE_CHECKING:
    from .role import Role
    from .deck import Deck, Comment
    from .report import Report
    from .progress import Progress
    from .flashcard import Flashcard

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    email: str = Field(unique=True, index=True)
    password: str
    verified: bool = Field(default=False)
    active: bool = Field(default=True)
    creation_date: datetime = Field(default_factory=datetime.utcnow)
    last_login_date: Optional[datetime] = None
    description: Optional[str] = None
    avatar: Optional[str] = None
    settings: Optional[str] = None

    roles: Mapped[List["Role"]] = Relationship(back_populates="users", link_model=UserRole)
    decks: Mapped[List["Deck"]] = Relationship(back_populates="owner")
    flashcards: Mapped[List["Flashcard"]] = Relationship(back_populates="owner")
    comments: Mapped[List["Comment"]] = Relationship(back_populates="author")
    reports_reported: Mapped[List["Report"]] = Relationship(
        back_populates="reported_user",
        sa_relationship_kwargs={"foreign_keys": "[Report.reported_user_id]"}
    )
    reports_created: Mapped[List["Report"]] = Relationship(
        back_populates="reporter",
        sa_relationship_kwargs={"foreign_keys": "[Report.reporter_id]"}
    )
    reports_moderated: Mapped[List["Report"]] = Relationship(
        back_populates="moderator",
        sa_relationship_kwargs={"foreign_keys": "[Report.moderator_id]"}
    )
    progress: Mapped[List["Progress"]] = Relationship(back_populates="user")
    saved_decks: Mapped[List["Deck"]] = Relationship(back_populates="saved_by_users", link_model=SavedDeck)

User.update_forward_refs()