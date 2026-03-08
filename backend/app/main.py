from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db
from app.routers import auth, browse, media, thumbnails, files, bookmarks


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
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
