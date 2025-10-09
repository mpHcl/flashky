from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User


class Report(SQLModel, table=True):
    __tablename__ = "reports"
    id: Optional[int] = Field(default=None, primary_key=True)
    type: str  # deck/flashcard/comment/user
    description: str
    creation_date: datetime = Field(default_factory=datetime.utcnow)
    resolution_date: Optional[datetime] = None
    verdict: Optional[str] = None  # violation/no-violation

    deck_id: Optional[int] = Field(foreign_key="decks.id", default=None)
    flashcard_id: Optional[int] = Field(foreign_key="flashcards.id", default=None)
    comment_id: Optional[int] = Field(foreign_key="comments.id", default=None)
    reported_user_id: Optional[int] = Field(foreign_key="users.id", default=None)
    reporter_id: int = Field(foreign_key="users.id")
    moderator_id: Optional[int] = Field(foreign_key="users.id", default=None)

    reported_user: Optional["User"] = Relationship(
        back_populates="reports_reported",
        sa_relationship_kwargs={"foreign_keys": "[Report.reported_user_id]"},
    )
    reporter: "User" = Relationship(
        back_populates="reports_created",
        sa_relationship_kwargs={"foreign_keys": "[Report.reporter_id]"},
    )
    moderator: Optional["User"] = Relationship(
        back_populates="reports_moderated",
        sa_relationship_kwargs={"foreign_keys": "[Report.moderator_id]"},
    )
