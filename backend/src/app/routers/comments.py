from __future__ import annotations

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlmodel import Session, and_

from app.database import get_session
from app.tools.auth.authenticate import authenticate
from app.models import Comment, Deck


router = APIRouter(prefix="/comments", tags=["comments"])


class CommentPostDTO(BaseModel):
    content: str
    deck_id: int
    parent_id: Optional[int]


class CommentGetDTO(BaseModel):
    id: int
    content: str
    creation_date: datetime
    deck_id: int
    author_id: int
    author_name: str
    parent_id: Optional[int]
    children_ids: Optional[list[int]] = None
    children: Optional[list[CommentGetDTO]] = None

    class Config:
        from_attributes = True


class CommentGetAllDTO(BaseModel):
    total_number: int
    comments: list[CommentGetDTO]

    class Config:
        from_attributes = True


@router.post("/", response_model=CommentGetDTO)
def create_comment(
    comment_data: CommentPostDTO,
    user_id: str = Depends(authenticate()),
    max_depth: int = Query(-1, description="How many replies in tree"),
    db: Session = Depends(get_session),
):
    user_id = int(user_id)

    parent_comment = (
        db.query(Comment).filter(Comment.id == comment_data.parent_id).first()
    )
    if comment_data.parent_id is not None and parent_comment is None:
        raise HTTPException(status_code=404, detail="Parent comment not found")

    if parent_comment and parent_comment.deck_id != comment_data.deck_id:
        raise HTTPException(
            status_code=400,
            detail="Parent comments deck_id do not match provided deck_id",
        )

    # Maybe only for public decks?
    if db.query(Deck).filter(Deck.id == comment_data.deck_id).first() is None:
        raise HTTPException(status_code=404, detail="Deck not found")

    new_comment = Comment(
        content=comment_data.content,
        creation_date=datetime.utcnow(),
        deck_id=comment_data.deck_id,
        author_id=user_id,
        parent_id=comment_data.parent_id,
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return create_comment_dto(new_comment, False, max_depth)


@router.get("/", response_model=CommentGetAllDTO)
def get_comments(
    # auth
    user_id: str = Depends(authenticate()),
    # query params
    deck_id: int = Query(None, ge=1, description="Commented deck."),
    only_root_comments: bool = Query(False, description="Return only root comments"),
    max_depth: int = Query(-1, description="How many replies in tree"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort: Optional[str] = Query("desc", pattern="^(asc|desc)$"),
    # db
    db: Session = Depends(get_session),
):
    user_id = int(user_id)

    if deck_id is None:
        raise HTTPException(status_code=404, detail="Deck not found")

    comments = db.query(Comment).filter(
        and_(Comment.deck_id == deck_id, Comment.parent_id == None)
    )

    total_number = comments.count()

    if sort == "desc":
        comments = comments.order_by(Comment.creation_date.desc())
    else:
        comments = comments.order_by(Comment.creation_date.asc())

    offset = (page - 1) * page_size
    comments = comments.offset(offset).limit(page_size).all()

    comments_dtos = [create_comment_dto(c, only_root_comments, max_depth) for c in comments]

    return {"total_number": total_number, "comments": comments_dtos}


@router.get("/mycomments", response_model=CommentGetAllDTO)
def get_my_comments(
    # auth
    user_id: str = Depends(authenticate()),
    # query params
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort: Optional[str] = Query("desc", pattern="^(asc|desc)$"),
    only_root_comments: bool = Query(False, description="Return only root comments"),
    max_depth: int = Query(-1, description="How many replies in tree"),
    # db
    db: Session = Depends(get_session),
):
    user_id = int(user_id)

    comments = db.query(Comment).filter(Comment.author_id == user_id)

    total_number = comments.count()

    if sort == "desc":
        comments = comments.order_by(Comment.creation_date.desc())
    else:
        comments = comments.order_by(Comment.creation_date.asc())

    offset = (page - 1) * page_size
    comments = comments.offset(offset).limit(page_size).all()

    comments_dtos = [create_comment_dto(c, only_root_comments, max_depth) for c in comments]

    return {"total_number": total_number, "comments": comments_dtos}


@router.get("/{comment_id}", response_model=CommentGetDTO)
def get_comment(
    comment_id: int,
    _: str = Depends(authenticate()),
    include_children: bool = Query(True, description="Return only root comments"),
    max_depth: int = Query(-1, description="How many replies in tree"),
    db: Session = Depends(get_session),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    return create_comment_dto(comment, not include_children, max_depth)


@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    user_id: str = Depends(authenticate()),
    db: Session = Depends(get_session),
):
    user_id = int(user_id)
    comment = db.query(Comment).filter(Comment.id == comment_id).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # When moderators are created add an option for mods to delete them.
    if comment.author_id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this comment"
        )

    comment.is_deleted = True
    db.commit()
    return {"message": "Comment deleted successfully"}


def create_comment_dto(
    comment: Comment,
    only_root: bool,
    max_depth: int = -1,
    current_depth: int = 0,
):
    children = None
    if not only_root and (max_depth < 0 or current_depth < max_depth):
        children = [
            create_comment_dto(child, only_root, max_depth, current_depth + 1)
            for child in comment.children
        ]

    if not comment.is_deleted:
        return CommentGetDTO(
            id=comment.id,
            content=comment.content,
            creation_date=comment.creation_date,
            deck_id=comment.deck_id,
            author_id=comment.author_id,
            author_name=comment.author.username,
            parent_id=comment.parent_id,
            children_ids=[c.id for c in comment.children],
            children=children,
        )
    else:
        return CommentGetDTO(
            id=comment.id,
            content="[deleted]",
            creation_date=comment.creation_date,
            deck_id=comment.deck_id,
            author_id=0,
            author_name="",
            parent_id=comment.parent_id,
            children_ids=[c.id for c in comment.children],
            children=children,
        )
