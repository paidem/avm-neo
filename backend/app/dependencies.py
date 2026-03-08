from fastapi import Request, HTTPException

from app.config import settings
from app.auth.header_auth import check_header_auth, get_header_username

# Import the right session backend
if settings.REDIS_HOST:
    from app.auth.session_redis import validate_session
else:
    from app.auth.session_memory import validate_session


def get_current_user(request: Request) -> dict:
    """Return user info. Does not raise — returns guest if not authenticated."""
    # Check header auth (OAuth2 proxy)
    if check_header_auth(request):
        username = get_header_username(request) or "Admin"
        return {"authenticated": True, "username": username, "role": "admin"}

    # Check cookie session
    session_id = request.cookies.get("session_id")
    if validate_session(session_id):
        return {"authenticated": True, "username": "Admin", "role": "admin"}

    # Guest
    header_username = get_header_username(request)
    return {
        "authenticated": False,
        "username": header_username or "Guest",
        "role": "viewer",
    }


def require_admin(request: Request) -> dict:
    """Require admin auth — raise 401 if not authenticated."""
    user = get_current_user(request)
    if not user["authenticated"]:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user
