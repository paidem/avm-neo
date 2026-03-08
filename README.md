# Action Video Manager Neo

Modern rebuild of Action Video Manager — a web app for browsing, playing, and bookmarking action camera footage (DJI drones, etc).

## Stack

- **Frontend**: React + TypeScript + Vite, CSS Modules, Lucide icons
- **Backend**: FastAPI + Python 3.11
- **Database**: SQLite (WAL mode) via SQLAlchemy
- **Media**: ffmpeg/ffprobe for thumbnails and metadata, mp4_merge for merging
- **Deploy**: Docker multi-stage build, nginx reverse proxy

## Development

```bash
# Backend
cd backend
pip install -r requirements.txt
MEDIA_BASE_DIR=/path/to/videos ADMIN_PASSWORD=admin uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Frontend dev server proxies `/api` to `localhost:8000` (configured in `vite.config.ts`).

## Docker

```bash
# Basic setup
docker compose up --build

# With Redis sessions
docker compose -f docker-compose.yaml -f docker-compose.redis.yaml up --build

# With OAuth2 proxy
docker compose -f docker-compose.yaml -f docker-compose.oauth.yaml up --build
```

## Features

- **Browse** — Navigate directories, view thumbnails, play videos/images/audio
- **File operations** (admin) — Merge MP4s, rename, delete, delete source files
- **Bookmarks** — Bookmark video moments with description and tags
- **Tag system** — Type-ahead tag input, filter bookmarks by tag, click to jump to video position
- **Light/dark mode** — Toggleable with system preference detection, saved in localStorage
- **Auth** — Password login (in-memory or Redis sessions), OAuth2 proxy header auth
- **DJI support** — Extracts embedded thumbnails from DJI O3/O4 recordings

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `MEDIA_BASE_DIR` | `/media` | Root directory for media files |
| `ADMIN_PASSWORD` | `admin` | Login password |
| `DATABASE_URL` | `sqlite:///data/avm.db` | SQLite database path |
| `THUMBNAIL_DIR` | `thumbnails` | Thumbnail cache directory |
| `SESSION_EXPIRY` | `86400` | Session TTL in seconds |
| `REDIS_HOST` | (none) | Redis host (enables Redis sessions) |
| `USERNAME_HEADER` | (none) | Header for OAuth2 proxy username |
| `ADMIN_USERS` | (none) | Comma-separated admin usernames |
