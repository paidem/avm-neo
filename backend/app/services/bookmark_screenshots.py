import os
import subprocess
import time

from app.config import settings

BOOKMARK_SCREENSHOT_DIR = os.path.join(settings.THUMBNAIL_DIR, "bookmarks")


def get_bookmark_screenshot_path(bookmark_id: int) -> str:
    """Return the absolute file path for a bookmark's screenshot."""
    return os.path.join(BOOKMARK_SCREENSHOT_DIR, f"{bookmark_id}.jpg")


def screenshot_exists(bookmark_id: int) -> bool:
    """Check if a screenshot already exists for this bookmark."""
    return os.path.exists(get_bookmark_screenshot_path(bookmark_id))


def generate_bookmark_screenshot(
    bookmark_id: int,
    video_abs_path: str,
    position_seconds: float,
) -> str | None:
    """Generate a screenshot at position_seconds. Returns file path or None on failure."""
    os.makedirs(BOOKMARK_SCREENSHOT_DIR, exist_ok=True)
    output_path = get_bookmark_screenshot_path(bookmark_id)

    # Convert seconds to HH:MM:SS.mmm for ffmpeg
    hours = int(position_seconds // 3600)
    minutes = int((position_seconds % 3600) // 60)
    secs = position_seconds % 60
    timestamp = f"{hours:02d}:{minutes:02d}:{secs:06.3f}"

    cmd = [
        "ffmpeg", "-y",
        "-ss", timestamp,
        "-i", video_abs_path,
        "-vframes", "1",
        "-vf", "scale=400:-1",
        output_path,
    ]

    try:
        start = time.perf_counter()
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        elapsed = time.perf_counter() - start
        if result.returncode == 0 and os.path.exists(output_path):
            print(f"Bookmark screenshot #{bookmark_id} generated in {elapsed:.2f}s")
            return output_path
        print(f"ffmpeg failed for bookmark #{bookmark_id}: {result.stderr.decode()[:200]}")
        return None
    except Exception as e:
        print(f"Error generating bookmark screenshot: {e}")
        return None


def delete_bookmark_screenshot(bookmark_id: int) -> None:
    """Remove a bookmark's screenshot file if it exists."""
    path = get_bookmark_screenshot_path(bookmark_id)
    if os.path.exists(path):
        os.remove(path)
