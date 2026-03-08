from datetime import datetime, timezone

from sqlalchemy import Column, Integer, Text, Real, Table, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.database import Base

bookmark_tags = Table(
    "bookmark_tags",
    Base.metadata,
    Column("bookmark_id", Integer, ForeignKey("bookmarks.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(Text, nullable=False)
    video_path = Column(Text, nullable=False, index=True)
    video_date = Column(Text, nullable=True)
    position_seconds = Column(Real, nullable=False, default=0)
    created_at = Column(Text, nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())
    updated_at = Column(Text, nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())

    tags = relationship("Tag", secondary=bookmark_tags, back_populates="bookmarks", lazy="joined")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False, unique=True)

    bookmarks = relationship("Bookmark", secondary=bookmark_tags, back_populates="tags")


Index("idx_tags_name", Tag.name)
