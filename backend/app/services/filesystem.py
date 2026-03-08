import os
import datetime

from app.config import settings

VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"}
AUDIO_EXTENSIONS = {".mp3", ".wav", ".ogg", ".aac", ".flac"}


def is_path_safe(path: str) -> bool:
    """Ensure the resolved path stays inside MEDIA_BASE_DIR."""
    real = os.path.realpath(path)
    base = os.path.realpath(settings.MEDIA_BASE_DIR)
    return real.startswith(base)


def is_private(full_path: str) -> bool:
    """Check if a path is within a private folder."""
    for pf in settings.PRIVATE_FOLDERS:
        if full_path.startswith(pf):
            return True
    return False


def is_filtered(name: str) -> bool:
    """Check if a file/folder name should be hidden."""
    if name in settings.FILTERED_FILES or name.startswith("."):
        return True
    ext = os.path.splitext(name)[1].lower()
    if ext and ext[1:] in settings.HIDDEN_EXTENSIONS:
        return True
    return False


def format_size(size: int) -> str:
    if size < 1024:
        return f"{size} bytes"
    elif size < 1024 * 1024:
        return f"{size / 1024:.1f} KB"
    elif size < 1024 * 1024 * 1024:
        return f"{size / (1024 * 1024):.1f} MB"
    else:
        return f"{size / (1024 * 1024 * 1024):.1f} GB"


def get_file_info(full_path: str) -> dict:
    stats = os.stat(full_path)
    return {
        "size": format_size(stats.st_size),
        "raw_size": stats.st_size,
        "modified": datetime.datetime.fromtimestamp(stats.st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
    }


def get_source_info(file_path: str) -> list[str] | None:
    source_path = file_path + ".source"
    if os.path.exists(source_path):
        try:
            with open(source_path) as f:
                return f.read().splitlines()
        except Exception:
            pass
    return None


def get_file_type(name: str) -> tuple[bool, bool, bool]:
    """Return (is_video, is_image, is_audio) based on extension."""
    ext = os.path.splitext(name)[1].lower()
    return ext in VIDEO_EXTENSIONS, ext in IMAGE_EXTENSIONS, ext in AUDIO_EXTENSIONS


def build_breadcrumbs(subpath: str) -> list[dict]:
    crumbs = [{"name": "Home", "path": ""}]
    parts = subpath.split("/") if subpath else []
    current = ""
    for part in parts:
        if part:
            current = f"{current}/{part}" if current else part
            crumbs.append({"name": part, "path": current})
    return crumbs


def get_neighboring_dirs(subpath: str, is_authenticated: bool) -> tuple[str | None, str | None]:
    """Find prev/next sibling directories."""
    full_path = os.path.join(settings.MEDIA_BASE_DIR, subpath)
    if full_path == settings.MEDIA_BASE_DIR:
        return None, None

    parent_dir = os.path.dirname(full_path)
    current_name = os.path.basename(full_path)

    try:
        subdirs = []
        for d in os.listdir(parent_dir):
            if not os.path.isdir(os.path.join(parent_dir, d)):
                continue
            if d in settings.FILTERED_FILES:
                continue
            full_sub = os.path.join(parent_dir, d)
            if not is_authenticated and is_private(full_sub):
                continue
            subdirs.append(d)

        subdirs.sort()
        if current_name in subdirs:
            idx = subdirs.index(current_name)
            prev_d = subdirs[idx - 1] if idx > 0 else None
            next_d = subdirs[idx + 1] if idx < len(subdirs) - 1 else None
            # Return as relative paths from the parent
            parent_subpath = os.path.relpath(parent_dir, settings.MEDIA_BASE_DIR)
            if parent_subpath == ".":
                return prev_d, next_d
            return (
                f"{parent_subpath}/{prev_d}" if prev_d else None,
                f"{parent_subpath}/{next_d}" if next_d else None,
            )
    except (FileNotFoundError, PermissionError):
        pass

    return None, None
