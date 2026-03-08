import os
import hashlib
import subprocess
import json
import time

from app.config import settings


def get_thumbnail_url(file_path: str, abs_path: str, is_video: bool = True) -> str | None:
    """Generate (if needed) and return the thumbnail URL for a media file."""
    filename = os.path.basename(file_path)
    try:
        file_size = os.path.getsize(abs_path)
    except Exception:
        file_size = 0

    hash_input = f"{filename}_{file_size}".encode()
    file_hash = hashlib.md5(hash_input).hexdigest()

    thumb_dir = os.path.join(settings.THUMBNAIL_DIR, file_hash[:2])
    os.makedirs(thumb_dir, exist_ok=True)
    thumb_path = os.path.join(thumb_dir, f"{file_hash}.jpg")

    if not os.path.exists(thumb_path):
        try:
            if is_video:
                cmd = _build_video_thumbnail_cmd(abs_path, thumb_path)
            else:
                cmd = [
                    "ffmpeg", "-i", abs_path,
                    "-vf", "scale=200:-1",
                    thumb_path,
                ]

            start = time.perf_counter()
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            elapsed = time.perf_counter() - start
            print(f"Generated thumbnail for {abs_path} in {elapsed:.2f}s")
        except Exception as e:
            print(f"Error generating thumbnail: {e}")
            return None

    return f"/api/thumbnails/{file_hash[:2]}/{file_hash}.jpg"


def _build_video_thumbnail_cmd(abs_path: str, thumb_path: str) -> list[str]:
    """Build ffmpeg command for video thumbnail — extract embedded or generate."""
    try:
        probe_cmd = [
            "ffprobe", "-v", "quiet",
            "-print_format", "json",
            "-show_format", "-show_streams",
            abs_path,
        ]
        result = subprocess.run(probe_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        data = json.loads(result.stdout)
        nb_streams = int(data["format"]["nb_streams"])

        # DJI O3/O4 have an embedded thumbnail as the last stream
        if nb_streams > 3 and data["streams"][nb_streams - 1].get("disposition", {}).get("attached_pic") == 1:
            return [
                "ffmpeg", "-i", abs_path,
                "-map", f"0:{nb_streams - 1}",
                "-frames:v", "1",
                thumb_path,
            ]
    except Exception:
        pass

    # Default: extract first frame
    return [
        "ffmpeg", "-i", abs_path,
        "-ss", "00:00:00.000", "-vframes", "1",
        "-vf", "scale=200:-1",
        thumb_path,
    ]


def generate_all_thumbnails() -> None:
    """Walk media dir and pre-generate thumbnails for all videos."""
    from app.services.filesystem import VIDEO_EXTENSIONS

    base = settings.MEDIA_BASE_DIR
    for dirpath, _, filenames in os.walk(base):
        # Skip filtered directories
        dirname = os.path.basename(dirpath)
        if dirname in settings.FILTERED_FILES:
            continue
        # Skip if inside a filtered path
        skip = False
        for filt in settings.FILTERED_FILES:
            if f"/{filt}/" in dirpath:
                skip = True
                break
        if skip:
            continue

        for filename in filenames:
            ext = os.path.splitext(filename)[1].lower()
            if ext in VIDEO_EXTENSIONS:
                abs_path = os.path.join(dirpath, filename)
                get_thumbnail_url(filename, abs_path, is_video=True)
