from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlmodel import Session, and_, or_

from app.tools.auth.authenticate import authenticate
from app.database import get_session
from app.models import Deck, DeckFlashcard, Flashcard, FlashcardSide, Progress
from app.tools.learn.learn import update_progress_after_review

router = APIRouter(prefix="/learn", tags=["learn"])


class FlashcardLearnDTO(BaseModel):
    id: int
    last_review_date: Optional[datetime] = None
    next_review_date: Optional[datetime] = None
    efactor: float
    front_side: FlashcardSide
    back_side: FlashcardSide


class ReviewDTO(BaseModel):
    quality: int


@router.get("/{deck_id}/next")
def get_next_learning_card(
    deck_id: int, user_id=Depends(authenticate()), db: Session = Depends(get_session)
):
    now = datetime.utcnow()

    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")

    stmt = (
        select(Flashcard, Progress)
        .join(DeckFlashcard)
        .join(Progress)
        .where(
            DeckFlashcard.deck_id == deck_id,
            Progress.user_id == user_id,
            Progress.next_review_date <= now,
        )
        .order_by(Progress.next_review_date.asc())
        .limit(1)
    )

    row = db.exec(stmt).first()

    if not row:
        return None

    card, progress = row

    return FlashcardLearnDTO(
        id=card.id,
        front_side=card.front_side,
        back_side=card.back_side,
        efactor=progress.efactor,
        last_review_date=progress.last_review_date,
        next_review_date=progress.next_review_date,
    )


@router.get("/{deck_id}/next-date")
def get_next_learning_card(
    deck_id: int, user_id=Depends(authenticate()), db: Session = Depends(get_session)
):
    now = datetime.utcnow()

    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")

    stmt = (
        select(Flashcard, Progress)
        .join(DeckFlashcard)
        .join(Progress)
        .where(
            DeckFlashcard.deck_id == deck_id,
            Progress.user_id == user_id,
        )
        .order_by(Progress.next_review_date.asc())
        .limit(1)
    )

    row = db.exec(stmt).first()

    if not row:
        return None

    _, progress = row

    return progress.next_review_date


@router.post("/{deck_id}/init")
def post_init_learning(
    deck_id: int, user_id=Depends(authenticate()), db: Session = Depends(get_session)
):
    now = datetime.utcnow()

    cards = db.query(Deck).filter(Deck.id == deck_id).first().flashcards

    for card in cards:
        exists = db.exec(
            select(Progress).where(
                Progress.user_id == user_id,
                Progress.flashcard_id == card.id,
            )
        ).first()

        if not exists:
            db.add(
                Progress(
                    user_id=user_id,
                    flashcard_id=card.id,
                    next_review_date=now,
                )
            )

    db.commit()

    return {"status": "ok"}


@router.post("/{flashcard_id}/review")
def update_progress(
    flashcard_id: int,
    review: ReviewDTO,
    user_id=Depends(authenticate()),
    db: Session = Depends(get_session),
):
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = int(user_id)

    progress = (
        db.query(Progress)
        .filter(
            and_(Progress.flashcard_id == flashcard_id, Progress.user_id == user_id)
        )
        .first()
    )

    if not progress:
        progress = Progress(
            user_id=user_id,
            flashcard_id=flashcard_id,
            next_review_date=datetime.utcnow(),
        )

        db.add(progress)
        db.flush()

    next_date = update_progress_after_review(progress, review.quality)

    db.commit()

    return {"status": "ok", "next_review_date_utc_": next_date}
