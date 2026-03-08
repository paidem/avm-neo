import os
import shutil
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.dependencies import require_admin
from app.services.merge import merge_files

router = APIRouter(prefix="/api/files", tags=["files"])


class FilesRequest(BaseModel):
    files: list[str]


class RenameRequest(BaseModel):
    old_path: str
    new_name: str


def _resolve_paths(files: list[str]) -> list[str]:
    """Resolve relative paths to absolute and validate they stay in MEDIA_BASE_DIR."""
    base = os.path.realpath(settings.MEDIA_BASE_DIR)
    paths = []
    for rel in files:
        abs_path = os.path.abspath(os.path.join(settings.MEDIA_BASE_DIR, rel))
        if not abs_path.startswith(base):
            raise HTTPException(status_code=403, detail="Invalid path")
        paths.append(abs_path)
    return paths


@router.post("/merge")
def merge(req: FilesRequest, _user: dict = Depends(require_admin)):
    full_paths = _resolve_paths(req.files)
    return merge_files(full_paths)


@router.post("/delete")
def delete_files(req: FilesRequest, _user: dict = Depends(require_admin)):
    full_paths = _resolve_paths(req.files)
    for path in full_paths:
        if os.path.isfile(path):
            # Delete associated .source file
            source = path + ".source"
            if os.path.exists(source):
                os.remove(source)
            # Delete associated .SRT file
            base_name, _ = os.path.splitext(path)
            srt = base_name + ".SRT"
            if os.path.exists(srt):
                os.remove(srt)
            os.remove(path)
        elif os.path.isdir(path):
            # Clean Synology metadata
            ea = os.path.join(path, "@eaDir")
            if os.path.isdir(ea):
                shutil.rmtree(ea)
            ds = os.path.join(path, ".DS_Store")
            if os.path.exists(ds):
                os.remove(ds)
            os.rmdir(path)
    return {"status": "success", "message": "Files deleted"}


@router.post("/rename")
def rename(req: RenameRequest, _user: dict = Depends(require_admin)):
    base = os.path.realpath(settings.MEDIA_BASE_DIR)
    old_abs = os.path.abspath(os.path.join(settings.MEDIA_BASE_DIR, req.old_path))
    if not old_abs.startswith(base):
        raise HTTPException(status_code=403, detail="Invalid path")

    parent = os.path.dirname(old_abs)
    new_abs = os.path.join(parent, req.new_name)
    if not new_abs.startswith(base):
        raise HTTPException(status_code=403, detail="Invalid path")

    if not os.path.exists(old_abs):
        return {"status": "error", "message": "Source file does not exist"}
    if os.path.exists(new_abs):
        return {"status": "error", "message": "A file with that name already exists"}

    os.rename(old_abs, new_abs)
    # Rename .source file too if it exists
    old_source = old_abs + ".source"
    if os.path.exists(old_source):
        os.rename(old_source, new_abs + ".source")

    return {"status": "success", "message": "File renamed successfully"}


@router.post("/delete-source")
def delete_source(req: FilesRequest, _user: dict = Depends(require_admin)):
    full_paths = _resolve_paths(req.files)
    if not full_paths:
        return {"status": "error", "message": "No file selected"}

    main_file = full_paths[0]
    source_file = main_file + ".source"
    if not os.path.exists(source_file):
        raise HTTPException(status_code=404, detail="Source file not found")

    directory = os.path.dirname(main_file)
    deleted = []
    with open(source_file) as f:
        for filename in f.read().splitlines():
            if filename:
                fp = os.path.join(directory, filename)
                if os.path.exists(fp):
                    os.remove(fp)
                    deleted.append(filename)
    os.remove(source_file)

    return {
        "status": "success",
        "message": f"Deleted {len(deleted)} source files",
        "deleted_files": deleted,
    }
