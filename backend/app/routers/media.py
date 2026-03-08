import os
import re
import mimetypes
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse, FileResponse

from app.config import settings
from app.dependencies import get_current_user
from app.services.filesystem import is_path_safe, is_private

router = APIRouter(prefix="/api", tags=["media"])


@router.get("/view/{file_path:path}")
def view_file(file_path: str, request: Request, user: dict = Depends(get_current_user)):
    full_path = os.path.join(settings.MEDIA_BASE_DIR, file_path)

    if not is_path_safe(full_path):
        raise HTTPException(status_code=403, detail="Forbidden")
    if not user["authenticated"] and is_private(full_path):
        raise HTTPException(status_code=404, detail="Not found")
    if not os.path.exists(full_path) or not os.path.isfile(full_path):
        raise HTTPException(status_code=404, detail="File not found")

    file_size = os.path.getsize(full_path)
    mime_type, _ = mimetypes.guess_type(full_path)
    if not mime_type:
        mime_type = "application/octet-stream"

    range_header = request.headers.get("range")
    if range_header:
        match = re.search(r"bytes=(\d+)-(\d*)", range_header)
        if match:
            byte_start = int(match.group(1))
            byte_end = int(match.group(2)) if match.group(2) else file_size - 1

            if byte_start > file_size or byte_end >= file_size or byte_start > byte_end:
                raise HTTPException(status_code=416, detail="Range not satisfiable")

            content_length = byte_end - byte_start + 1

            def stream_range():
                with open(full_path, "rb") as f:
                    f.seek(byte_start)
                    remaining = content_length
                    while remaining > 0:
                        chunk = min(1024 * 1024, remaining)
                        data = f.read(chunk)
                        if not data:
                            break
                        remaining -= len(data)
                        yield data

            return StreamingResponse(
                stream_range(),
                status_code=206,
                media_type=mime_type,
                headers={
                    "Content-Range": f"bytes {byte_start}-{byte_end}/{file_size}",
                    "Accept-Ranges": "bytes",
                    "Content-Length": str(content_length),
                },
            )

    # Full file response
    def stream_full():
        with open(full_path, "rb") as f:
            while True:
                data = f.read(1024 * 1024)
                if not data:
                    break
                yield data

    return StreamingResponse(
        stream_full(),
        media_type=mime_type,
        headers={
            "Accept-Ranges": "bytes",
            "Content-Length": str(file_size),
        },
    )


@router.get("/download/{file_path:path}")
def download_file(file_path: str, user: dict = Depends(get_current_user)):
    full_path = os.path.join(settings.MEDIA_BASE_DIR, file_path)

    if not is_path_safe(full_path):
        raise HTTPException(status_code=403, detail="Forbidden")
    if not user["authenticated"] and is_private(full_path):
        raise HTTPException(status_code=404, detail="Not found")
    if not os.path.exists(full_path) or not os.path.isfile(full_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        full_path,
        filename=os.path.basename(full_path),
        media_type="application/octet-stream",
    )
