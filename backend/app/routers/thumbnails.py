import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.config import settings

router = APIRouter(prefix="/api/thumbnails", tags=["thumbnails"])


@router.get("/{prefix}/{filename}")
def get_thumbnail(prefix: str, filename: str):
    thumb_path = os.path.join(settings.THUMBNAIL_DIR, prefix, filename)
    if not os.path.exists(thumb_path):
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    return FileResponse(thumb_path, media_type="image/jpeg")
