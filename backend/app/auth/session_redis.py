import json
import time
import uuid

import redis

from app.config import settings

_redis = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0)


def create_session() -> str:
    """Create a new session stored in Redis."""
    session_id = str(uuid.uuid4())
    session_data = {
        "created": time.time(),
        "expires": time.time() + settings.SESSION_EXPIRY,
    }
    _redis.setex(
        f"session:{session_id}",
        settings.SESSION_EXPIRY,
        json.dumps(session_data),
    )
    return session_id


def validate_session(session_id: str | None) -> bool:
    """Check if a session ID is valid in Redis."""
    if not session_id:
        return False
    raw = _redis.get(f"session:{session_id}")
    if not raw:
        return False
    session = json.loads(raw)
    if session.get("expires", 0) > time.time():
        # Renew on access
        session["expires"] = time.time() + settings.SESSION_EXPIRY
        _redis.setex(
            f"session:{session_id}",
            settings.SESSION_EXPIRY,
            json.dumps(session),
        )
        return True
    return False


def delete_session(session_id: str | None) -> None:
    """Remove a session from Redis."""
    if session_id:
        _redis.delete(f"session:{session_id}")
