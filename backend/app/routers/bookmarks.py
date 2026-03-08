from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Bookmark, Tag, bookmark_tags

router = APIRouter(prefix="/api", tags=["bookmarks"])


class BookmarkCreate(BaseModel):
    description: str
    video_path: str
    video_date: str | None = None
    position_seconds: float = 0
    tags: list[str] = []


class BookmarkUpdate(BaseModel):
    description: str | None = None
    tags: list[str] | None = None


def _get_or_create_tags(db: Session, tag_names: list[str]) -> list[Tag]:
    """Get existing tags or create new ones."""
    tags = []
    for name in tag_names:
        name = name.strip()
        if not name:
            continue
        tag = db.query(Tag).filter(Tag.name == name).first()
        if not tag:
            tag = Tag(name=name)
            db.add(tag)
            db.flush()
        tags.append(tag)
    return tags


def _cleanup_orphan_tags(db: Session):
    """Remove tags that have no bookmarks."""
    orphans = (
        db.query(Tag)
        .outerjoin(bookmark_tags)
        .filter(bookmark_tags.c.tag_id.is_(None))
        .all()
    )
    for tag in orphans:
        db.delete(tag)


def _serialize_bookmark(b: Bookmark) -> dict:
    return {
        "id": b.id,
        "description": b.description,
        "video_path": b.video_path,
        "video_date": b.video_date,
        "position_seconds": b.position_seconds,
        "tags": [{"id": t.id, "name": t.name} for t in b.tags],
        "created_at": b.created_at,
        "updated_at": b.updated_at,
    }


@router.get("/bookmarks")
def list_bookmarks(
    tag: str | None = Query(None),
    video_path: str | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Bookmark)
    if tag:
        query = query.filter(Bookmark.tags.any(Tag.name == tag))
    if video_path:
        query = query.filter(Bookmark.video_path == video_path)
    bookmarks = query.order_by(Bookmark.created_at.desc()).all()
    return [_serialize_bookmark(b) for b in bookmarks]


@router.post("/bookmarks")
def create_bookmark(req: BookmarkCreate, db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc).isoformat()
    bookmark = Bookmark(
        description=req.description,
        video_path=req.video_path,
        video_date=req.video_date,
        position_seconds=req.position_seconds,
        created_at=now,
        updated_at=now,
    )
    bookmark.tags = _get_or_create_tags(db, req.tags)
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    return _serialize_bookmark(bookmark)


@router.get("/bookmarks/{bookmark_id}")
def get_bookmark(bookmark_id: int, db: Session = Depends(get_db)):
    bookmark = db.query(Bookmark).filter(Bookmark.id == bookmark_id).first()
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return _serialize_bookmark(bookmark)


@router.put("/bookmarks/{bookmark_id}")
def update_bookmark(bookmark_id: int, req: BookmarkUpdate, db: Session = Depends(get_db)):
    bookmark = db.query(Bookmark).filter(Bookmark.id == bookmark_id).first()
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    if req.description is not None:
        bookmark.description = req.description
    if req.tags is not None:
        bookmark.tags = _get_or_create_tags(db, req.tags)
    bookmark.updated_at = datetime.now(timezone.utc).isoformat()

    db.commit()
    _cleanup_orphan_tags(db)
    db.commit()
    db.refresh(bookmark)
    return _serialize_bookmark(bookmark)


@router.delete("/bookmarks/{bookmark_id}")
def delete_bookmark(bookmark_id: int, db: Session = Depends(get_db)):
    bookmark = db.query(Bookmark).filter(Bookmark.id == bookmark_id).first()
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    db.delete(bookmark)
    db.commit()
    _cleanup_orphan_tags(db)
    db.commit()
    return {"status": "success"}


@router.get("/tags")
def list_tags(q: str | None = Query(None), db: Session = Depends(get_db)):
    query = db.query(Tag)
    if q:
        query = query.filter(Tag.name.ilike(f"{q}%"))
    tags = query.order_by(Tag.name).all()
    return [{"id": t.id, "name": t.name} for t in tags]
