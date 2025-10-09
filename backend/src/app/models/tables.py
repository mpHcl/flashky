from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime, date

######################################################
#-------------- User Management Tables --------------#
######################################################

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
    
class Role(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    
class Permission(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    description: str = None
    
class UserRole(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    role_id: int = Field(foreign_key="role.id")
    
class RolePermission(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    role_id: int = Field(foreign_key="role.id")
    permission_id: int = Field(foreign_key="permission.id")
    

###########################################################
#-------------- Flashcard Management Tables --------------#
###########################################################

class Flashcard(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    front_side_id: int = Field(foreign_key="flashcardside.id")
    back_side_id: int = Field(foreign_key="flashcardside.id")
    creation_date: datetime = Field(default_factory=datetime.utcnow)
    owner_id: int = Field(foreign_key="user.id")

class FlashcardSide(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: Optional[str] = None
    
class Deck(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    public: bool = Field(default=False)
    owner_id: int = Field(foreign_key="user.id")
    has_media: bool = Field(default=False)
    creation_date: datetime = Field(default_factory=datetime.utcnow)
    last_edit_date: datetime = Field(default_factory=datetime.utcnow)

class Media(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    alt: Optional[str] = None
    path: str
    type: str  # image/audio/video
    autoplay: bool = Field(default=False)
    upload_date: datetime = Field(default_factory=datetime.utcnow)

class Tag(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    type: str = Field(default="community")  # community/predefined

class DeckFlashcard(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    deck_id: int = Field(foreign_key="deck.id")
    flashcard_id: int = Field(foreign_key="flashcard.id")

class DeckTag(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    deck_id: int = Field(foreign_key="deck.id")
    tag_id: int = Field(foreign_key="tag.id")
    
class FlashcardTag(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    flashcard_id: int = Field(foreign_key="flashcard.id")
    tag_id: int = Field(foreign_key="tag.id")
    
class FlashcardSideMedia(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    flashcard_side_id: int = Field(foreign_key="flashcardside.id")
    media_id: int = Field(foreign_key="media.id")

####################################################
#------------------ Other Tables ------------------#
####################################################

class Comment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    deck_id: int = Field(foreign_key="deck.id")
    author_id: int = Field(foreign_key="user.id")
    parent_id: Optional[int] = Field(foreign_key="comment.id", default=None)
    content: str
    creation_date: datetime = Field(default_factory=datetime.utcnow)

class Report(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: str # deck/flashcard/comment/user
    description: str
    deck_id: Optional[int] = Field(foreign_key="deck.id", default=None)
    flashcard_id: Optional[int] = Field(foreign_key="flashcard.id", default=None)
    comment_id: Optional[int] = Field(foreign_key="comment.id", default=None)
    reported_user_id: Optional[int] = Field(foreign_key="user.id", default=None)
    reporter_id: int = Field(foreign_key="user.id")
    moderator_id: Optional[int] = Field(foreign_key="user.id", default=None)
    creation_date: datetime = Field(default_factory=datetime.utcnow)
    resolution_date: Optional[datetime] = None
    verdict: Optional[str] = None # violation/no-violation
    