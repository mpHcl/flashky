from typing import Optional
import uuid
import os

from datetime import datetime
from fastapi import HTTPException, Depends, APIRouter, File, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlmodel import Session

from ..models import Media, FlashcardSide, User, FlashcardSideMedia
from app.database import get_session
from app.tools.auth.authenticate import authenticate

router = APIRouter(prefix="/media", tags=["media"])
files_dir = "./files/"

class MediaUpdateDTO(BaseModel):
    alt: Optional[str] = None
    autoplay: Optional[bool] = None

@router.post("/{side_id}")
def uploadMedia(side_id: int, file: UploadFile, db: Session = Depends(get_session)):
    flashcard_side = db.query(FlashcardSide).filter(FlashcardSide.id == side_id).first()
    if not flashcard_side:
        raise HTTPException(status_code=404, detail="Flashcard side not found")
    type = file.content_type.split("/")[0]
    if type not in ["audio", "image", "video"]:
        raise HTTPException(status_code=415, detail="Unsupported media type")
    name_split = file.filename.split(".")
    filepath = str(uuid.uuid4()) + "." + name_split[len(name_split) - 1]
    f = file.file.read()
    with open(files_dir + filepath, "wb") as new_file:
        new_file.write(f)
    media = Media(path=filepath, type=type, autoplay=False, flashcard_sides=[flashcard_side])
    db.add(media)
    db.commit()
    db.refresh(media)
    return media

@router.get("/side/{side_id}")
def getMediaInfoBySideId(side_id: int, db: Session = Depends(get_session)):
    flashcard_side = db.query(FlashcardSide).filter(FlashcardSide.id == side_id).first()
    if not flashcard_side:
        raise HTTPException(status_code=404, detail="Flashcard side not found")
    return flashcard_side.media


@router.get("/{id}")
def getOneMediaInfo(id: int, db: Session = Depends(get_session)):
    media = db.query(Media).filter(Media.id == id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    return media

@router.get("/file/{id}")
def getOneMediaFile(id: int, db: Session = Depends(get_session)):
    media = db.query(Media).filter(Media.id == id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    if not os.path.exists(files_dir + media.path):
        raise HTTPException(status_code=404, detail="Filepath " + media.path + " does not exist")
    return FileResponse(files_dir + media.path)

@router.put("/{id}")
def updateMediaInfo(id: int, mediaDTO: MediaUpdateDTO, db: Session = Depends(get_session)):
    media = db.query(Media).filter(Media.id == id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    if media.type != "image" and mediaDTO.autoplay is not None:
        media.autoplay = mediaDTO.autoplay
    if mediaDTO.alt:
        media.alt = mediaDTO.alt
    db.commit()
    db.refresh(media)
    return media

@router.delete("/{id}")
def deleteMedia(id: int, db: Session = Depends(get_session)):
    media = db.query(Media).filter(Media.id == id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    if not os.path.exists(files_dir + media.path):
        raise HTTPException(status_code=404, detail="Filepath " + media.path + " does not exist")
    else:
        os.remove(files_dir + media.path)
    db.delete(media)
    db.commit()
    return "Media deleted successfully"