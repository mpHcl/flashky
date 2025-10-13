from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.orm import Mapped

from typing import Optional, List
from datetime import datetime


######################################################
# -------------- Link Tables (Many-to-Many) ----------#
######################################################
class UserRole(SQLModel, table=True):
    __tablename__ = "users_roles"
    user_id: int = Field(foreign_key="users.id", primary_key=True)
    role_id: int = Field(foreign_key="roles.id", primary_key=True)


class RolePermission(SQLModel, table=True):
    __tablename__ = "roles_permissions"
    role_id: int = Field(foreign_key="roles.id", primary_key=True)
    permission_id: int = Field(foreign_key="permissions.id", primary_key=True)


class DeckFlashcard(SQLModel, table=True):
    __tablename__ = "decks_flashcards"
    deck_id: int = Field(foreign_key="decks.id", primary_key=True)
    flashcard_id: int = Field(foreign_key="flashcards.id", primary_key=True)


class DeckTag(SQLModel, table=True):
    __tablename__ = "decks_tags"
    deck_id: int = Field(foreign_key="decks.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)


class FlashcardTag(SQLModel, table=True):
    __tablename__ = "flashcards_tags"
    flashcard_id: int = Field(foreign_key="flashcards.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)


class FlashcardSideMedia(SQLModel, table=True):
    __tablename__ = "flashcard_sides_media"
    flashcard_side_id: int = Field(foreign_key="flashcard_sides.id", primary_key=True)
    media_id: int = Field(foreign_key="media.id", primary_key=True)


class SavedDeck(SQLModel, table=True):
    __tablename__ = "saved_decks"
    id: Optional[int] = Field(default=None, primary_key=True)
    save_date: datetime = Field(default_factory=datetime.utcnow)

    user_id: int = Field(foreign_key="users.id")
    deck_id: int = Field(foreign_key="decks.id")


######################################################
# -------------- User Management Tables --------------#
######################################################
class User(SQLModel, table=True):
    __tablename__ = "users"
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

    # Relationships
    roles: Mapped[List["Role"]] = Relationship(
        back_populates="users", link_model=UserRole
    )
    decks: Mapped[List["Deck"]] = Relationship(back_populates="owner")
    flashcards: Mapped[List["Flashcard"]] = Relationship(back_populates="owner")
    comments: Mapped[List["Comment"]] = Relationship(back_populates="author")
    reports_reported: Mapped[List["Report"]] = Relationship(
        back_populates="reported_user",
        sa_relationship_kwargs={"foreign_keys": "[Report.reported_user_id]"},
    )
    reports_created: Mapped[List["Report"]] = Relationship(
        back_populates="reporter",
        sa_relationship_kwargs={"foreign_keys": "[Report.reporter_id]"},
    )
    reports_moderated: Mapped[List["Report"]] = Relationship(
        back_populates="moderator",
        sa_relationship_kwargs={"foreign_keys": "[Report.moderator_id]"},
    )
    progress: Mapped[List["Progress"]] = Relationship(back_populates="user")
    saved_decks: Mapped[List["Deck"]] = Relationship(
        back_populates="saved_by_users", link_model=SavedDeck
    )


class Role(SQLModel, table=True):
    __tablename__ = "roles"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)

    # Relationships
    users: Mapped[List["User"]] = Relationship(
        back_populates="roles", link_model=UserRole
    )
    permissions: Mapped[List["Permission"]] = Relationship(
        back_populates="roles", link_model=RolePermission
    )


class Permission(SQLModel, table=True):
    __tablename__ = "permissions"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    description: Optional[str] = None

    # Relationships
    roles: Mapped[List["Role"]] = Relationship(
        back_populates="permissions", link_model=RolePermission
    )


###########################################################
# -------------- Flashcard Management Tables --------------#
###########################################################
class FlashcardSide(SQLModel, table=True):
    __tablename__ = "flashcard_sides"
    id: Optional[int] = Field(default=None, primary_key=True)
    content: Optional[str] = None

    # Relationships
    media: Mapped[List["Media"]] = Relationship(
        back_populates="flashcard_sides", link_model=FlashcardSideMedia
    )


class Media(SQLModel, table=True):
    __tablename__ = "media"
    id: Optional[int] = Field(default=None, primary_key=True)
    alt: Optional[str] = None
    path: str
    type: str  # image/audio/video
    autoplay: bool = Field(default=False)
    upload_date: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    flashcard_sides: Mapped[List["FlashcardSide"]] = Relationship(
        back_populates="media", link_model=FlashcardSideMedia
    )


class Flashcard(SQLModel, table=True):
    __tablename__ = "flashcards"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    creation_date: datetime = Field(default_factory=datetime.utcnow)

    owner_id: int = Field(foreign_key="users.id")
    front_side_id: int = Field(foreign_key="flashcard_sides.id")
    back_side_id: int = Field(foreign_key="flashcard_sides.id")

    # Relationships
    owner: Mapped["User"] = Relationship(back_populates="flashcards")
    front_side: Mapped["FlashcardSide"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Flashcard.front_side_id]"}
    )
    back_side: Mapped["FlashcardSide"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Flashcard.back_side_id]"}
    )

    decks: Mapped[List["Deck"]] = Relationship(
        back_populates="flashcards", link_model=DeckFlashcard
    )
    tags: Mapped[List["Tag"]] = Relationship(
        back_populates="flashcards", link_model=FlashcardTag
    )
    progress: Mapped[List["Progress"]] = Relationship(back_populates="flashcard")


class Tag(SQLModel, table=True):
    __tablename__ = "tags"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    type: str = Field(default="community")  # community/predefined

    # Relationships
    decks: Mapped[List["Deck"]] = Relationship(
        back_populates="tags", link_model=DeckTag
    )
    flashcards: Mapped[List["Flashcard"]] = Relationship(
        back_populates="tags", link_model=FlashcardTag
    )


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

    # Relationships
    owner: Mapped["User"] = Relationship(back_populates="decks")
    flashcards: Mapped[List["Flashcard"]] = Relationship(
        back_populates="decks", link_model=DeckFlashcard
    )
    tags: Mapped[List["Tag"]] = Relationship(back_populates="decks", link_model=DeckTag)
    saved_by_users: Mapped[List["User"]] = Relationship(
        back_populates="saved_decks", link_model=SavedDeck
    )
    comments: Mapped[List["Comment"]] = Relationship(back_populates="deck")


class Progress(SQLModel, table=True):
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

    # Relationships
    user: Mapped["User"] = Relationship(back_populates="progress")
    flashcard: Mapped["Flashcard"] = Relationship(back_populates="progress")


####################################################
# ------------------ Other Tables ------------------#
####################################################


class Comment(SQLModel, table=True):
    __tablename__ = "comments"
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    creation_date: datetime = Field(default_factory=datetime.utcnow)

    deck_id: int = Field(foreign_key="decks.id")
    author_id: int = Field(foreign_key="users.id")
    parent_id: Optional[int] = Field(foreign_key="comments.id", default=None)

    # Relationships
    deck: Mapped["Deck"] = Relationship(back_populates="comments")
    author: Mapped["User"] = Relationship(back_populates="comments")
    parent: Mapped[Optional["Comment"]] = Relationship(
        sa_relationship_kwargs={"remote_side": "[Comment.id]"}
    )


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

    # Relationships
    reported_user: Mapped[Optional["User"]] = Relationship(
        back_populates="reports_reported",
        sa_relationship_kwargs={"foreign_keys": "[Report.reported_user_id]"},
    )
    reporter: Mapped["User"] = Relationship(
        back_populates="reports_created",
        sa_relationship_kwargs={"foreign_keys": "[Report.reporter_id]"},
    )
    moderator: Mapped[Optional["User"]] = Relationship(
        back_populates="reports_moderated",
        sa_relationship_kwargs={"foreign_keys": "[Report.moderator_id]"},
    )


class ExpireTokens(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    token_value: str
    expiration_date: datetime
