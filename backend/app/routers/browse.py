import os
from fastapi import APIRouter, Depends, HTTPException

from app.config import settings
from app.dependencies import get_current_user
from app.services.filesystem import (
    is_path_safe, is_private, is_filtered,
    get_file_info, get_source_info, get_file_type,
    build_breadcrumbs, get_neighboring_dirs,
)

router = APIRouter(prefix="/api/browse", tags=["browse"])


@router.get("/{subpath:path}")
@router.get("/")
def browse(subpath: str = "", user: dict = Depends(get_current_user)):
    is_auth = user["authenticated"]
    full_path = os.path.join(settings.MEDIA_BASE_DIR, subpath)

    if not is_path_safe(full_path):
        raise HTTPException(status_code=403, detail="Forbidden")

    if not is_auth and is_private(full_path):
        raise HTTPException(status_code=404, detail="Not found")

    if not os.path.isdir(full_path):
        raise HTTPException(status_code=404, detail="Directory not found")

    items = []
    try:
        for name in os.listdir(full_path):
            if is_filtered(name):
                continue

            item_path = f"{subpath}/{name}" if subpath else name
            abs_path = os.path.join(full_path, name)
            is_dir = os.path.isdir(abs_path)

            # Hide private folders for unauthenticated users
            if is_dir and not is_auth and is_private(abs_path):
                continue

            is_video, is_image, is_audio = (False, False, False) if is_dir else get_file_type(name)

            item = {
                "name": name,
                "path": item_path,
                "is_dir": is_dir,
                "is_video": is_video,
                "is_image": is_image,
                "is_audio": is_audio,
                "thumbnail": None,
                "video_metadata": {
                    "duration": None,
                    "codec": None,
                    "framerate": None,
                    "creation_time": None,
                },
                "source_files": None,
                "size": "",
                "raw_size": 0,
                "modified": "",
                "file_count": 0,
            }

            if not is_dir:
                item.update(get_file_info(abs_path))
                if is_video:
                    item["source_files"] = get_source_info(abs_path)

            items.append(item)
    except PermissionError:
        raise HTTPException(status_code=403, detail="Permission denied")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Directory not found")

    # Sort: directories first, then by name (case insensitive)
    items.sort(key=lambda x: (not x["is_dir"], x["name"].lower()))

    prev_dir, next_dir = get_neighboring_dirs(subpath, is_auth)

    return {
        "items": items,
        "breadcrumbs": build_breadcrumbs(subpath),
        "current_path": subpath,
        "prev_dir": prev_dir,
        "next_dir": next_dir,
    }
