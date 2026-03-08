import os


class Settings:
    MEDIA_BASE_DIR: str = os.environ.get("MEDIA_BASE_DIR", "/media")
    ADMIN_PASSWORD: str = os.environ.get("ADMIN_PASSWORD", "admin")
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "change-me-in-production")
    SESSION_EXPIRY: int = 60 * 60 * 24 * 30  # 30 days

    REDIS_HOST: str = os.environ.get("REDIS_HOST", "")
    REDIS_PORT: int = int(os.environ.get("REDIS_PORT", "6379"))

    DATABASE_URL: str = os.environ.get("DATABASE_URL", "sqlite:///data/avm.db")
    THUMBNAIL_DIR: str = os.environ.get(
        "THUMBNAIL_DIR",
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "thumbnails"),
    )

    USERNAME_HEADER: str | None = os.environ.get("USERNAME_HEADER", None)
    ADMIN_USERS: list[str] = []

    FILTERED_FILES: list[str] = []
    HIDDEN_EXTENSIONS: list[str] = []
    PRIVATE_FOLDERS: list[str] = []

    def __init__(self):
        # Parse admin users
        admin_users_str = os.environ.get("ADMIN_USERS", "")
        if admin_users_str:
            self.ADMIN_USERS = [u.strip() for u in admin_users_str.split(",") if u.strip()]

        # Parse filtered files
        filtered_env = os.environ.get("FILTERED_FILES", "")
        if filtered_env:
            self.FILTERED_FILES = [f.strip() for f in filtered_env.split(",") if f.strip()]
        else:
            self.FILTERED_FILES = [
                ".DS_Store", ".Thumbs.db", "Thumbs.db", "._.Trashes",
                ".Spotlight-V100", ".fseventsd", ".Trashes", "@eaDir",
                "desktop.ini", "thumbs.db", "#snapshot", "#recycle", "thumbnails",
            ]

        # Parse hidden extensions
        hidden_env = os.environ.get("HIDDEN_EXTENSIONS", "")
        if hidden_env:
            self.HIDDEN_EXTENSIONS = [e.strip() for e in hidden_env.split(",") if e.strip()]
        else:
            self.HIDDEN_EXTENSIONS = ["source", "srt", "db"]

        # Parse private folders
        private_env = os.environ.get("PRIVATE_FOLDERS", "")
        if private_env:
            private_names = [p.strip() for p in private_env.split(",") if p.strip()]
        else:
            private_names = ["Personal"]
        self.PRIVATE_FOLDERS = [
            os.path.join(self.MEDIA_BASE_DIR, name) for name in private_names
        ]

        # Ensure dirs exist
        os.makedirs(self.THUMBNAIL_DIR, exist_ok=True)
        os.makedirs(os.path.dirname(self.DATABASE_URL.replace("sqlite:///", "")), exist_ok=True)


settings = Settings()
