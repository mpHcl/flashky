from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.orm import Mapped

from typing import Optional, List
from datetime import datetime


######################################################
# -------------- Link Tables (Many-to-Many) ----------#
######################################################
class UserRole(SQLModel, table=True):
    """
    Association model linking users and roles.
    This class represents the join/association table that implements a many-to-many
    relationship between User and Role entities. Each instance links one user to
    one role. The combination of user_id and role_id forms a composite primary key,
    ensuring that each user-role pairing is unique.

    Attributes:
        user_id (int): Foreign key referencing users.id. Part of the composite primary key.
        role_id (int): Foreign key referencing roles.id. Part of the composite primary key.
    """
    __tablename__ = "users_roles"

    user_id: int = Field(foreign_key="users.id", primary_key=True)
    role_id: int = Field(foreign_key="roles.id", primary_key=True)


class RolePermission(SQLModel, table=True):
    """
    Association model linking roles and permissions.
    Represents the many-to-many join table between Role and Permission entities.
    Each record associates one role with one permission. The composite primary key
    (role_id, permission_id) enforces uniqueness for each role-permission pairing.

    Attributes:
        role_id (int): Foreign key referencing roles.id. Part of the composite primary key.
        permission_id (int): Foreign key referencing permissions.id. Part of the composite primary key.
    """
    __tablename__ = "roles_permissions"

    role_id: int = Field(foreign_key="roles.id", primary_key=True)
    permission_id: int = Field(foreign_key="permissions.id", primary_key=True)


class DeckFlashcard(SQLModel, table=True):
    """
    Association model linking decks and flashcards.
    Represents the many-to-many join table between Deck and Flashcard entities.
    Each record associates one deck with one flashcard. The composite primary key
    (deck_id, flashcard_id) enforces uniqueness for each deck-flashcard pairing.

    Attributes:
        deck_id (int): Foreign key referencing decks.id. Part of the composite primary key.
        flashcard_id (int): Foreign key referencing flashcards.id. Part of the composite primary key.
    """
    __tablename__ = "decks_flashcards"

    deck_id: int = Field(foreign_key="decks.id", primary_key=True)
    flashcard_id: int = Field(foreign_key="flashcards.id", primary_key=True)


class DeckTag(SQLModel, table=True):
    """
    Association model linking decks and tags.
    Represents the many-to-many join table between Deck and Tag entities.
    Each record associates one deck with one tag. The composite primary key
    (deck_id, tag_id) enforces uniqueness for each deck-tag pairing.

    Attributes:
        deck_id (int): Foreign key referencing decks.id. Part of the composite primary key.
        tag_id (int): Foreign key referencing tags.id. Part of the composite primary key.
    """
    __tablename__ = "decks_tags"

    deck_id: int = Field(foreign_key="decks.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)


class FlashcardTag(SQLModel, table=True):
    """
    Association model linking flashcards and tags.
    Represents the many-to-many join table between Flashcard and Tag entities.
    Each record associates one flashcard with one tag. The composite primary key
    (flashcard_id, tag_id) enforces uniqueness for each flashcard-tag pairing.

    Attributes:
        flashcard_id (int): Foreign key referencing flashcards.id. Part of the composite primary key.
        tag_id (int): Foreign key referencing tags.id. Part of the composite primary key.
    """
    __tablename__ = "flashcards_tags"

    flashcard_id: int = Field(foreign_key="flashcards.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)


class FlashcardSideMedia(SQLModel, table=True):
    """
    Association model linking flashcards and media.
    Represents a many-to-many relationship between flashcard sides and media
    resources. Each row associates one flashcard side with one media item.
    The composite primary key (flashcard_side_id, media_id) forms a composite
    primary key, enforces uniqueness for each flashcard-media pairing.

    Attributes:
        flashcard_side_id (int): Foreign key to flashcard_sides.id. Part of the composite primary key.
        media_id (int): Foreign key to media.id. Part of the composite primary key.
    """
    __tablename__ = "flashcard_sides_media"

    flashcard_side_id: int = Field(foreign_key="flashcard_sides.id", primary_key=True)
    media_id: int = Field(foreign_key="media.id", primary_key=True)


class SavedDeck(SQLModel, table=True):
    """
    Representation of a saved deck association.
    This model records the fact that a user has saved a particular deck and stores
    when the save occurred. It is mapped to the "saved_decks" table in the
    database and functions as an association/join table between users and decks,
    while also carrying additional metadata about the save event.

    Attributes:
        id (Optional[int]): Primary key for the saved record. Auto-generated.
        save_date (datetime): UTC timestamp when the deck was saved. Defaults to the
            current UTC time at creation.
        user_id (int): Foreign key referencing the user's `users.id` that saved the deck.
        deck_id (int): Foreign key referencing the saved deck's `decks.id`.

    Notes:
        - Use this model to query which users have saved a given deck or which decks
          a user has saved, and to track when those saves occurred.
    """
    __tablename__ = "saved_decks"
    id: Optional[int] = Field(default=None, primary_key=True)
    save_date: datetime = Field(default_factory=datetime.utcnow)

    user_id: int = Field(foreign_key="users.id")
    deck_id: int = Field(foreign_key="decks.id")


######################################################
# -------------- User Management Tables --------------#
######################################################
class User(SQLModel, table=True):
    """
    Representation of an application user.
    This model stores user account information and links the user to related
    objects (roles, decks, flashcards, comments, reports, progress, saved decks).

    Attributes:
        id (Optional[int]): Primary key, auto-generated.
        username (str): Unique username, indexed.
        email (str): Unique email address, indexed.
        password (str): Password hash (store hashed passwords only).
        verified (bool): Whether the user's email is verified.
        active (bool): Whether the account is active (soft-deactivate accounts).
        creation_date (datetime): UTC timestamp when the account was created.
        last_login_date (Optional[datetime]): UTC timestamp of last login.
        description (Optional[str]): Optional user biography or profile text.
        avatar (Optional[str]): Optional path/URL to user's avatar image.
        settings (Optional[str]): Optional serialized settings (e.g., JSON string).

    Relationships:
        roles (List[Role]): Many-to-many relationship through UserRole.
        decks (List[Deck]): Decks owned by the user.
        flashcards (List[Flashcard]): Flashcards owned by the user.
        comments (List[Comment]): Comments authored by the user.
        reports_reported (List[Report]): Reports where this user is the subject.
        reports_created (List[Report]): Reports created by this user.
        reports_moderated (List[Report]): Reports moderated/handled by this user.
        progress (List[Progress]): Per-user progress entries for flashcards.
        saved_decks (List[Deck]): Decks saved by the user (via SavedDeck).
    """
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
    """
    Represent a system role that groups permissions and can be assigned to users.
    This SQLModel-backed class maps to the "roles" table and is intended to model
    authorization roles (e.g. "admin", "editor", "viewer") which:
    - have a unique name (indexed for fast lookup),
    - are stored with an integer primary key id,
    - are associated with zero or more users via a many-to-many relationship
        through the UserRole link model,
    - are associated with zero or more permissions via a many-to-many relationship
        through the RolePermission link model.

    Attributes
        id (Optional[int]): Primary key. Auto-generated when persisted.
        name (str): Unique, indexed textual identifier for the role.

    Relations:
        users (List[User]): Users assigned to this role. Back-populates to User.roles.
        permissions (List[Permission]): Permissions granted to this role.
    """
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
    """
    Permission model representing a distinct action or capability that can be granted to roles.
    This SQLModel-backed class maps to the "permissions" table and stores a set of named
    permissions used for authorization checks. Each Permission is uniquely identified by
    an integer primary key and a unique, indexed name. Permissions can be associated with
    multiple Role instances through a many-to-many relationship using the RolePermission
    link model.

    Attributes:
        id (Optional[int]): Auto-incrementing primary key for the permission record.
        name (str): Unique, indexed identifier for the permission (e.g., "read_articles",
            "edit_users"). Used in permission checks and should be stable and human-readable.
        description (Optional[str]): Optional human-readable description explaining the
            purpose of the permission.

    Relations:
        roles (List[Role]): Collection of Role objects that include this permission. This
            relationship is configured via a many-to-many link model (RolePermission) and
            is the inverse side of Role.permissions (back_populates="permissions").
    """
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
    """
    Represents one side of a flashcard (e.g., front or back).
    This model stores the textual/content portion of a flashcard side and
    links to any media (images/audio/video) associated with that side via
    the FlashcardSideMedia association table.

    Attributes:
        id (Optional[int]): Primary key, auto-generated.
        content (Optional[str]): Textual content of the flashcard side.

    Relationships:
        media (List[Media]): Media items attached to this flashcard side
            (many-to-many via FlashcardSideMedia).
    """
    __tablename__ = "flashcard_sides"

    id: Optional[int] = Field(default=None, primary_key=True)
    content: Optional[str] = None

    # Relationships
    media: Mapped[List["Media"]] = Relationship(
        back_populates="flashcard_sides", link_model=FlashcardSideMedia
    )


class Media(SQLModel, table=True):
    """
    Represents a media resource (image, audio, video) that can be attached to flashcard sides.
    Maps to the "media" table and stores metadata about uploaded media files.

    Attributes:
        id (Optional[int]): Primary key, auto-generated.
        alt (Optional[str]): Optional alt text / description for accessibility.
        path (str): Filesystem path or URL to the media resource.
        type (str): Media type (e.g., "image", "audio", "video").
        autoplay (bool): Whether the media should autoplay (where applicable).
        upload_date (datetime): UTC timestamp when the media was uploaded.

    Relationships:
        flashcard_sides (List[FlashcardSide]): Flashcard sides that reference this media
            (many-to-many via FlashcardSideMedia).
    """
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
    """
    Represents a flashcard stored in the database.
    This SQLModel table maps to the "flashcards" table and models a single
    flashcard entity owned by a user. Each Flashcard references two sides
    (front and back) (both are FlashcardSide records), can belong to multiple
    decks and tags via association/link tables, and tracks progress records.

    Attributes:
        id (Optional[int]): Primary key for the flashcard (auto-generated).
        name (str): Human-readable name/title for the flashcard.
        creation_date (datetime): Timestamp when the flashcard was created (defaults to UTC now).
        owner_id (int): References users.id, denotes the owning User.
        front_side_id (int): References flashcard_sides.id, the front side content.
        back_side_id (int): References flashcard_sides.id, the back side content.

    Relationships:
        owner (Mapped[User]): Back-populates the User.flashcards relationship.
        front_side (Mapped[FlashcardSide]): Relationship to the front FlashcardSide.
            Uses an explicit foreign_keys argument because front_side_id and back_side_id
            both reference the same related table.
        back_side (Mapped[FlashcardSide]): Relationship to the back FlashcardSide.
            Also specifies foreign_keys to disambiguate the two relationships.
        decks (Mapped[List[Deck]]): Many-to-many relationship to Deck via DeckFlashcard link model.
        tags (Mapped[List[Tag]]): Many-to-many relationship to Tag via FlashcardTag link model.
        progress (Mapped[List[Progress]]): One-to-many relationship to Progress records for this flashcard.

    Notes:
        - front_side_id and back_side_id are required (non-optional) integer foreign keys and
          should reference distinct FlashcardSide rows representing each side's content.
        - The explicit sa_relationship_kwargs foreign_keys strings are necessary to disambiguate
          relationships when multiple columns reference the same target table.
    """
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
        sa_relationship_kwargs={"foreign_keys": "[Flashcard.front_side_id]", "cascade": "delete"}
    )
    back_side: Mapped["FlashcardSide"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Flashcard.back_side_id]", "cascade": "delete"}
    )

    decks: Mapped[List["Deck"]] = Relationship(
        back_populates="flashcards", link_model=DeckFlashcard
    )
    tags: Mapped[List["Tag"]] = Relationship(
        back_populates="flashcards", link_model=FlashcardTag
    )
    progress: Mapped[List["Progress"]] = Relationship(back_populates="flashcard")


class Tag(SQLModel, table=True):
    """
    Represents a tag used to categorize decks and flashcards.
    Maps to the "tags" table and stores a unique name and a type
    (e.g., "community" or "predefined"). Tags are attached to Deck and
    Flashcard records via many-to-many association/link tables.

    Attributes:
        id (Optional[int]): Primary key, auto-generated.
        name (str): Unique tag name, indexed for fast lookup.
        type (str): Tag classification; defaults to "community".

    Relationships:
        decks (List[Deck]): Decks associated with this tag (many-to-many via DeckTag).
        flashcards (List[Flashcard]): Flashcards associated with this tag (many-to-many via FlashcardTag).
    """
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
    """
    Represents a collection of flashcards owned by a user.
    Maps to the "decks" table and stores metadata about a deck. Decks can be
    public or private, may contain media, and are associated with flashcards,
    tags, comments, and users who saved them.

    Attributes:
        id (Optional[int]): Primary key, auto-generated.
        name (str): Human-readable deck title.
        description (Optional[str]): Optional description or summary.
        public (bool): Whether the deck is visible to other users.
        has_media (bool): Whether the deck contains media attachments.
        creation_date (datetime): UTC timestamp when the deck was created.
        last_edit_date (datetime): UTC timestamp when the deck was last edited.
        owner_id (int): Foreign key referencing users.id (deck owner).

    Relationships:
        owner (User): Owner of the deck (back_populates="decks").
        flashcards (List[Flashcard]): Flashcards in this deck (many-to-many via DeckFlashcard).
        tags (List[Tag]): Tags assigned to this deck (many-to-many via DeckTag).
        saved_by_users (List[User]): Users who saved this deck (via SavedDeck).
        comments (List[Comment]): Comments left on this deck.
    """
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
    """
    Tracks a user's spaced-repetition progress for a single flashcard.
    This model maps to the "progress" table and stores scheduling and performance
    metadata required for spaced repetition algorithms (e.g., SM-2 variants).

    Attributes:
        id (Optional[int]): Primary key, auto-generated.
        last_review_date (Optional[datetime]): UTC timestamp of the most recent review.
        next_review_date (Optional[datetime]): UTC timestamp when the card should next be reviewed.
        interval (Optional[int]): Current review interval in minutes.
        efactor (float): Ease factor used to compute future intervals (defaults to 1).
        repetition (int): Number of consecutive successful repetitions.
        correct_answers (int): Total correct answers recorded for this card.
        incorrect_answers (int): Total incorrect answers recorded for this card.
        user_id (int): Foreign key referencing users.id (owner of this progress entry).
        flashcard_id (int): Foreign key referencing flashcards.id (the flashcard tracked).

    Relationships:
        user (Mapped[User]): Back-populates User.progress (the owning user).
        flashcard (Mapped[Flashcard]): Back-populates Flashcard.progress (the tracked flashcard).

    Notes:
        - interval is stored in minutes to keep resolution consistent across the app.
        - efactor should typically be >= 1; adjust according to your scheduling logic.
        - Use last_review_date/next_review_date (UTC) when computing due items.
    """
    __tablename__ = "progress"

    id: Optional[int] = Field(default=None, primary_key=True)
    last_review_date: Optional[datetime] = None
    next_review_date: Optional[datetime] = None
    interval: Optional[int] = None  # in minutes
    efactor: float = Field(default=2.5)  # ease factor
    repetition: int = Field(default=0)
    correct_answers: int = Field(default=0)
    incorrect_answers: int = Field(default=0)
    user_id: int = Field(foreign_key="users.id")
    flashcard_id: int = Field(foreign_key="flashcards.id")

    # Relationships
    user: Mapped["User"] = Relationship(back_populates="progress")
    flashcard: Mapped["Flashcard"] = Relationship(back_populates="progress")


class Comment(SQLModel, table=True):
    """
    Represents a comment left on a Deck (and optionally as a reply to another comment).
    This model maps to the "comments" table and stores content, creation timestamp,
    and references to the deck and author. Comments may form a hierarchical thread
    by referencing an optional parent comment.

    Attributes:
        id (Optional[int]): Primary key, auto-generated.
        content (str): The text content of the comment.
        creation_date (datetime): UTC timestamp when the comment was created.
        deck_id (int): Foreign key referencing decks.id for the deck this comment belongs to.
        author_id (int): Foreign key referencing users.id for the comment author.
        parent_id (Optional[int]): Foreign key referencing comments.id for parent comment (if this is a reply).

    Relationships:
        deck (Deck): The deck this comment is associated with (back_populates="comments").
        author (User): The user who authored the comment (back_populates="comments").
        parent (Optional[Comment]): The parent comment if this comment is a reply.
        children (List[Comment]): Replies to this comment (back_populates="parent").
    """
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
        back_populates="children",
        sa_relationship_kwargs={"remote_side": "[Comment.id]"},
    )
    children: Mapped[List["Comment"]] = Relationship(back_populates="parent")


class Report(SQLModel, table=True):
    """
    Represents a user-submitted report concerning potential policy violations on the platform.
    Reports can target various entities such as decks, flashcards, comments, or users. 
    Each report includes a description of the issue, the date it was created, and its 
    resolution status once reviewed by a moderator.
    This model maps to the "reports" table and provides the relational links between the
    reported entity, the user who submitted the report, the user being reported (if any),
    and the moderator who reviewed the case.

    Attributes:
        id (Optional[int]): Primary key, auto-generated.
        type (str): Type of the reported entity (e.g., "deck", "flashcard", "comment", "user").
        description (str): Explanation or justification provided by the reporter.
        creation_date (datetime): UTC timestamp when the report was created.
        resolution_date (Optional[datetime]): UTC timestamp when the report was resolved, if applicable.
        verdict (Optional[str]): The outcome of the moderation process ("violation" or "no-violation").

        deck_id (Optional[int]): Foreign key referencing decks.id, if the report concerns a deck.
        flashcard_id (Optional[int]): Foreign key referencing flashcards.id, if the report concerns a flashcard.
        comment_id (Optional[int]): Foreign key referencing comments.id, if the report concerns a comment.
        reported_user_id (Optional[int]): Foreign key referencing users.id, if the report concerns a user.
        reporter_id (int): Foreign key referencing users.id for the user who filed the report.
        moderator_id (Optional[int]): Foreign key referencing users.id for the moderator who handled the report.

    Relationships:
        reported_user (Optional[User]): The user who was reported (back_populates="reports_reported").
        reporter (User): The user who created the report (back_populates="reports_created").
        moderator (Optional[User]): The moderator who reviewed and resolved the report (back_populates="reports_moderated").
    """
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


####################################################
# ------------------ Other Tables ------------------#
####################################################
class ExpireTokens(SQLModel, table=True):
    """
    Represents a stored token with an explicit expiration timestamp.
    This model maps to the "expired_tokens" table and is intended to record tokens
    that should no longer be accepted (for example, revoked access or refresh tokens).
    Use this table to check whether a given token value has been marked as expired.

    Attributes:
        id (Optional[int]): Primary key, auto-generated.
        token_value (str): The token string/value to mark as expired.
        expiration_date (datetime): UTC timestamp when the token becomes/was invalid.
    """
    __tablename__ = "expired_tokens"

    id: Optional[int] = Field(default=None, primary_key=True)
    token_value: str = Field(index=True)
    expiration_date: datetime
