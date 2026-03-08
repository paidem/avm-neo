from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, browse, media

app = FastAPI(title="Action Video Manager", version="2.0.0")

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


@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "2.0.0"}
