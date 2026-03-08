import time
import uuid

from app.config import settings

# In-memory session store
_sessions: dict[str, dict] = {}


def create_session() -> str:
    """Create a new session and return its ID."""
    session_id = str(uuid.uuid4())
    _sessions[session_id] = {
        "created": time.time(),
        "expires": time.time() + settings.SESSION_EXPIRY,
    }
    return session_id


def validate_session(session_id: str | None) -> bool:
    """Check if a session ID is valid and not expired."""
    if not session_id or session_id not in _sessions:
        return False
    session = _sessions[session_id]
    if session["expires"] > time.time():
        # Renew on access
        session["expires"] = time.time() + settings.SESSION_EXPIRY
        return True
    # Expired — remove it
    _sessions.pop(session_id, None)
    return False


def delete_session(session_id: str | None) -> None:
    """Remove a session."""
    if session_id:
        _sessions.pop(session_id, None)


def cleanup_expired() -> None:
    """Remove all expired sessions."""
    now = time.time()
    expired = [sid for sid, data in _sessions.items() if data["expires"] < now]
    for sid in expired:
        _sessions.pop(sid, None)
