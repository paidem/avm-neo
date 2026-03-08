from fastapi import Request
from app.config import settings


def check_header_auth(request: Request) -> bool:
    """Check if the user is authenticated via a forwarded header (OAuth2 proxy)."""
    if settings.USERNAME_HEADER and settings.ADMIN_USERS:
        header_user = request.headers.get(settings.USERNAME_HEADER)
        if header_user and header_user in settings.ADMIN_USERS:
            return True
    return False


def get_header_username(request: Request) -> str | None:
    """Get the username from the forwarded header."""
    if settings.USERNAME_HEADER:
        return request.headers.get(settings.USERNAME_HEADER)
    return None
