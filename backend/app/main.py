import os
import threading
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db
from app.routers import auth, browse, media, thumbnails, files, bookmarks
from app.services.thumbnails import generate_all_thumbnails


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    # Generate thumbnails in background thread so startup isn't blocked
    thread = threading.Thread(target=generate_all_thumbnails, daemon=True)
    thread.start()
    yield


app = FastAPI(title="Action Video Manager", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(browse.router)
app.include_router(media.router)
app.include_router(thumbnails.router)
app.include_router(files.router)
app.include_router(bookmarks.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "2.0.0"}


# Serve SPA static files in production (when built frontend exists)
SPA_DIR = Path(__file__).resolve().parent.parent / "static" / "spa"
if SPA_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=SPA_DIR / "assets"), name="spa-assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve SPA index.html for all non-API routes (client-side routing)."""
        file_path = SPA_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(SPA_DIR / "index.html")
