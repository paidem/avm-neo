import subprocess
import json
import datetime

import tzlocal


def get_video_metadata(file_path: str) -> dict:
    """Get video metadata using ffprobe."""
    try:
        cmd = [
            "ffprobe", "-v", "quiet",
            "-print_format", "json",
            "-show_format", "-show_streams",
            file_path,
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        data = json.loads(result.stdout)

        metadata = {
            "duration": None,
            "codec": None,
            "framerate": None,
            "creation_time": None,
        }

        video_stream = None
        for stream in data.get("streams", []):
            if stream.get("codec_type") == "video":
                video_stream = stream
                break

        if not video_stream:
            return metadata

        # Duration
        duration_str = video_stream.get("duration") or data.get("format", {}).get("duration")
        if duration_str:
            secs = float(duration_str)
            minutes = int(secs // 60)
            seconds = int(secs % 60)
            metadata["duration"] = f"{minutes}:{seconds:02d}"

        # Codec
        if "codec_name" in video_stream:
            metadata["codec"] = video_stream["codec_name"]

        # Framerate
        framerate = video_stream.get("avg_frame_rate")
        if framerate and framerate != "0/0":
            try:
                num, den = map(int, framerate.split("/"))
                if den != 0:
                    metadata["framerate"] = f"{round(num / den, 2)} fps"
            except (ValueError, ZeroDivisionError):
                pass

        # Creation time
        tags = video_stream.get("tags", {})
        creation_time = tags.get("creation_time")
        if creation_time:
            try:
                dt_utc = datetime.datetime.fromisoformat(creation_time.replace("Z", "+00:00"))
                local_tz = tzlocal.get_localzone()
                dt_local = dt_utc.astimezone(local_tz)
                offset_hours = dt_local.utcoffset().total_seconds() / 3600
                sign = "+" if offset_hours >= 0 else "-"
                metadata["creation_time"] = (
                    dt_local.strftime("%Y-%m-%d %H:%M")
                    + f" (GMT{sign}{abs(int(offset_hours))})"
                )
            except Exception:
                pass

        return metadata
    except Exception as e:
        print(f"Error getting video metadata: {e}")
        return {"duration": None, "codec": None, "framerate": None, "creation_time": None}
