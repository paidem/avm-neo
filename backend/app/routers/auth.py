from fastapi import APIRouter, Request, Response, Form, Depends
from app.config import settings
from app.dependencies import get_current_user

# Import the right session backend
if settings.REDIS_HOST:
    from app.auth.session_redis import create_session, delete_session
else:
    from app.auth.session_memory import create_session, delete_session

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
def login(response: Response, request: Request, password: str = Form(...)):
    if password == settings.ADMIN_PASSWORD:
        session_id = create_session()
        response.set_cookie(
            key="session_id",
            value=session_id,
            max_age=settings.SESSION_EXPIRY,
            httponly=True,
            samesite="strict",
            secure=request.url.scheme == "https",
        )
        return {"status": "success", "message": "Login successful"}
    return {"status": "error", "message": "Invalid password"}


@router.post("/logout")
def logout(response: Response, request: Request):
    session_id = request.cookies.get("session_id")
    delete_session(session_id)
    response.delete_cookie("session_id")
    return {"status": "success", "message": "Logged out successfully"}


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return user
