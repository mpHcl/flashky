from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.orm import Mapped
from typing import Optional
from datetime import datetime


######################################################
#-------------- Link Tables (Many-to-Many) ----------#
######################################################
class UserRole(SQLModel, table=True):
    __tablename__ = "users_roles"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    role_id: int = Field(foreign_key="roles.id")


class RolePermission(SQLModel, table=True):
    __tablename__ = "roles_permissions"
    id: Optional[int] = Field(default=None, primary_key=True)
    role_id: int = Field(foreign_key="roles.id")
    permission_id: int = Field(foreign_key="permissions.id")


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


class FlashcardSideMedia(SQLModel, table=True):
    __tablename__ = "flashcard_sides_media"
    id: Optional[int] = Field(default=None, primary_key=True)
    flashcard_side_id: int = Field(foreign_key="flashcard_sides.id")
    media_id: int = Field(foreign_key="media.id")


######################################################
#-------------- User Management Tables --------------#
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
    roles: Mapped[list["Role"]] = Relationship(back_populates="users", link_model=UserRole)
    decks: Mapped[list["Deck"]] = Relationship(back_populates="owner")
    flashcards: Mapped[list["Flashcard"]] = Relationship(back_populates="owner")
    comments: Mapped[list["Comment"]] = Relationship(back_populates="author")
    reports_reported: Mapped[list["Report"]] = Relationship(back_populates="reported_user", sa_relationship_kwargs={"foreign_keys": "[Report.reported_user_id]"})
    reports_created: Mapped[list["Report"]] = Relationship(back_populates="reporter", sa_relationship_kwargs={"foreign_keys": "[Report.reporter_id]"})
    reports_moderated: Mapped[list["Report"]] = Relationship(back_populates="moderator", sa_relationship_kwargs={"foreign_keys": "[Report.moderator_id]"})
    flashcard_progress: Mapped[list["FlashcardProgress"]] = Relationship(back_populates="user")
    saved_decks: Mapped[list["SavedDeck"]] = Relationship(back_populates="user")


class Role(SQLModel, table=True):
    __tablename__ = "roles"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)

    # Relationships
    users: Mapped[list["User"]] = Relationship(back_populates="roles", link_model=UserRole)
    permissions: Mapped[list["Permission"]] = Relationship(back_populates="roles", link_model=RolePermission)


class Permission(SQLModel, table=True):
    __tablename__ = "permissions"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    description: Optional[str] = None

    roles: Mapped[list["Role"]] = Relationship(back_populates="permissions", link_model=RolePermission)


###########################################################
#-------------- Flashcard Management Tables --------------#
###########################################################

class FlashcardSide(SQLModel, table=True):
    __tablename__ = "flashcard_sides"
    id: Optional[int] = Field(default=None, primary_key=True)
    content: Optional[str] = None

    media: Mapped[list["Media"]] = Relationship(back_populates="flashcard_sides", link_model=FlashcardSideMedia)


class Media(SQLModel, table=True):
    __tablename__ = "media"
    id: Optional[int] = Field(default=None, primary_key=True)
    alt: Optional[str] = None
    path: str
    type: str  # image/audio/video
    autoplay: bool = Field(default=False)
    upload_date: datetime = Field(default_factory=datetime.utcnow)

    flashcard_sides: Mapped[list["FlashcardSide"]] = Relationship(back_populates="media", link_model=FlashcardSideMedia)


class Flashcard(SQLModel, table=True):
    __tablename__ = "flashcards"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    creation_date: datetime = Field(default_factory=datetime.utcnow)

    owner_id: int = Field(foreign_key="users.id")
    front_side_id: int = Field(foreign_key="flashcard_sides.id")
    back_side_id: int = Field(foreign_key="flashcard_sides.id")

    owner: Mapped["User"] = Relationship(back_populates="flashcards")
    front_side: Mapped["FlashcardSide"] = Relationship(sa_relationship_kwargs={"foreign_keys": "[Flashcard.front_side_id]"})
    back_side: Mapped["FlashcardSide"] = Relationship(sa_relationship_kwargs={"foreign_keys": "[Flashcard.back_side_id]"})

    decks: Mapped[list["Deck"]] = Relationship(back_populates="flashcards", link_model=DeckFlashcard)
    tags: Mapped[list["Tag"]] = Relationship(back_populates="flashcards", link_model=FlashcardTag)
    progress_entries: Mapped[list["FlashcardProgress"]] = Relationship(back_populates="flashcard")


class Tag(SQLModel, table=True):
    __tablename__ = "tags"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    type: str = Field(default="community")  # community/predefined

    decks: Mapped[list["Deck"]] = Relationship(back_populates="tags", link_model=DeckTag)
    flashcards: Mapped[list["Flashcard"]] = Relationship(back_populates="tags", link_model=FlashcardTag)


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
    owner: Mapped["User"] = Relationship(back_populates="decks")

    flashcards: Mapped[list["Flashcard"]] = Relationship(back_populates="decks", link_model=DeckFlashcard)
    tags: Mapped[list["Tag"]] = Relationship(back_populates="decks", link_model=DeckTag)
    saves: Mapped[list["SavedDeck"]] = Relationship(back_populates="deck")
    comments: Mapped[list["Comment"]] = Relationship(back_populates="deck")


class FlashcardProgress(SQLModel, table=True):
    __tablename__ = "flashcards_progress"
    id: Optional[int] = Field(default=None, primary_key=True)
    last_review_date: Optional[datetime] = None
    next_review_date: Optional[datetime] = None
    interval: Optional[int] = None  # in minutes
    efactor: float = Field(default=1)  # ease factor
    repetition: int = Field(default=0)
    correct_answers: int = Field(default=0)
    incorrect_answers: int = Field(default=0)

    # ORM relationships
    user_id: int = Field(foreign_key="users.id")
    flashcard_id: int = Field(foreign_key="flashcards.id")
    user: Mapped["User"] = Relationship(back_populates="flashcard_progress")
    flashcard: Mapped["Flashcard"] = Relationship(back_populates="progress_entries")


class SavedDeck(SQLModel, table=True):
    __tablename__ = "saved_decks"
    id: Optional[int] = Field(default=None, primary_key=True)
    save_date: datetime = Field(default_factory=datetime.utcnow)

    user_id: int = Field(foreign_key="users.id")
    deck_id: int = Field(foreign_key="decks.id")

    user: Mapped["User"] = Relationship(back_populates="saved_decks")
    deck: Mapped["Deck"] = Relationship(back_populates="saves")


####################################################
#------------------ Other Tables ------------------#
####################################################

class Comment(SQLModel, table=True):
    __tablename__ = "comments"
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    creation_date: datetime = Field(default_factory=datetime.utcnow)

    deck_id: int = Field(foreign_key="decks.id")
    author_id: int = Field(foreign_key="users.id")
    parent_id: Optional[int] = Field(foreign_key="comments.id", default=None)

    deck: Mapped["Deck"] = Relationship(back_populates="comments")
    author: Mapped["User"] = Relationship(back_populates="comments")
    parent: Mapped[Optional["Comment"]] = Relationship(sa_relationship_kwargs={"remote_side": "[Comment.id]"})


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

    reported_user: Mapped[Optional["User"]] = Relationship(back_populates="reports_reported", sa_relationship_kwargs={"foreign_keys": "[Report.reported_user_id]"})
    reporter: Mapped["User"] = Relationship(back_populates="reports_created", sa_relationship_kwargs={"foreign_keys": "[Report.reporter_id]"})
    moderator: Mapped[Optional["User"]] = Relationship(back_populates="reports_moderated", sa_relationship_kwargs={"foreign_keys": "[Report.moderator_id]"})