from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from sqlmodel import Session


from app.database import get_session
from app.models import Comment, Deck, Flashcard, Report, User
from app.tools.auth.authenticate import authenticate


router = APIRouter(prefix="/reports", tags=["reports"])


class ReportPostDTO(BaseModel):
    type: str
    description: str
    item_id: int


class ReportGetDTO(BaseModel):
    id: int
    type: str
    description: str
    creation_date: datetime
    resolution_date: Optional[datetime]
    verdict: Optional[str]

    deck_id: Optional[int]
    flashcard_id: Optional[int]
    comment_id: Optional[int]
    reported_user_id: Optional[int]
    reporter_id: int
    moderator_id: Optional[int]


class ReportGetAllDTO(BaseModel):
    total_number: int
    reports: list[ReportGetDTO]


class ReportUpdateDTO(BaseModel):
    verdict: str


@router.post("/", response_model=ReportGetDTO)
def create_report(
    report_data: ReportPostDTO,
    user_id: int = Depends(authenticate()),
    db: Session = Depends(get_session),
):
    match report_data.type:
        case "deck":
            report = create_deck_report(report_data, user_id, db)
        case "flashcard":
            report = create_flashcard_report(report_data, user_id, db)
        case "comment":
            report = create_comment_report(report_data, user_id, db)
        case "user":
            report = create_user_report(report_data, user_id, db)
        case _:
            raise HTTPException(status_code=400, detail="Incorrect report type")

    db.add(report)
    db.commit()
    db.refresh(report)

    return report


def create_deck_report(report_data: ReportPostDTO, user_id: int, db: Session):
    deck = db.query(Deck).filter(Deck.id == report_data.item_id).first()
    if deck is None:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    report = Report(
        type="deck",
        description=report_data.description,
        deck_id=report_data.item_id,
        reporter_id=user_id,
        reported_user_id=deck.owner_id,
        creation_date=datetime.utcnow(),
    )

    return report


def create_flashcard_report(report_data: ReportPostDTO, user_id: int, db: Session):
    flashcard = db.query(Flashcard).filter(Flashcard.id == report_data.item_id).first()
    if flashcard is None:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    report = Report(
        type="flashcard",
        description=report_data.description,
        flashcard_id=report_data.item_id,
        reporter_id=user_id,
        reported_user_id=flashcard.owner_id,
        creation_date=datetime.utcnow(),
    )

    return report


def create_comment_report(report_data: ReportPostDTO, user_id: int, db: Session):
    comment = db.query(Comment).filter(Comment.id == report_data.item_id).first()
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")

    report = Report(
        type="comment",
        description=report_data.description,
        comment_id=report_data.item_id,
        reporter_id=user_id,
        reported_user_id=comment.author_id,
        creation_date=datetime.utcnow(),
    )

    return report


def create_user_report(report_data: ReportPostDTO, user_id: int, db: Session):
    if db.query(User).filter(User.id == report_data.item_id).first() is None:
        raise HTTPException(status_code=404, detail="User not found")

    report = Report(
        type="user",
        description=report_data.description,
        reported_user_id=report_data.item_id,
        reporter_id=user_id,
        creation_date=datetime.utcnow(),
    )

    return report


@router.get("/", response_model=ReportGetAllDTO)
def get_reports(
    # auth
    _: int = Depends(authenticate(["MODERATOR"])),
    # query params
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort: Optional[str] = Query("desc", pattern="^(asc|desc)$"),
    verdict: Optional[str] = Query(None),
    # db
    db: Session = Depends(get_session),
):
    reports = db.query(Report)

    if verdict == "pending":
        reports = reports.filter(Report.verdict.is_(None))
    elif verdict and verdict != "all":
        reports = reports.filter(Report.verdict.ilike(verdict))

    if sort == "desc":
        reports = reports.order_by(Report.creation_date.desc())
    else:
        reports = reports.order_by(Report.creation_date.asc())

    total_number = reports.count()

    offset = (page - 1) * page_size
    reports = reports.offset(offset).limit(page_size).all()

    return {"total_number": total_number, "reports": reports}


@router.get("/{report_id}", response_model=ReportGetDTO)
def get_report(
    report_id: int,
    _: int = Depends(authenticate(["MODERATOR"])),
    db: Session = Depends(get_session),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")

    return report


@router.put("/{report_id}", response_model=ReportGetDTO)
def update_report(
    report_id: int,
    report_data: ReportUpdateDTO,
    user_id: int = Depends(authenticate(["MODERATOR"])),
    db: Session = Depends(get_session),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")

    report.verdict = report_data.verdict
    report.resolution_date = datetime.utcnow()
    report.moderator_id = user_id

    db.commit()
    db.refresh(report)
    return report


@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    _: int = Depends(authenticate(["IDK_SUPERMOD?"])),
    db: Session = Depends(get_session),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully"}
