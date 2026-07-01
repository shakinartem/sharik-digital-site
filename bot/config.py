from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


@dataclass(frozen=True, slots=True)
class Settings:
    bot_token: str
    admin_chat_id: int
    database_path: Path
    checklist_path: Path
    site_url: str | None = None
    bot_username: str = "sharik_digital_bot"


def _resolve_path(raw_path: str | None, default_path: Path, base_dir: Path) -> Path:
    path = Path(raw_path) if raw_path else default_path
    if not path.is_absolute():
        path = (base_dir / path).resolve()
    return path


def load_settings() -> Settings:
    load_dotenv()
    base_dir = Path(__file__).resolve().parent

    bot_token = os.environ["BOT_TOKEN"].strip()
    admin_chat_raw = os.environ.get("ADMIN_CHAT_ID") or os.environ.get("LEADS_CHAT_ID")
    if not admin_chat_raw:
        raise KeyError("ADMIN_CHAT_ID")

    database_url = os.getenv("DATABASE_URL", "sqlite:///./bot.db").strip()
    if database_url.startswith("sqlite:///"):
        raw_database_path = database_url.removeprefix("sqlite:///")
    else:
        raw_database_path = database_url

    checklist_raw = os.getenv("CHECKLIST_FILE") or os.getenv("CHECKLIST_FILE_ID")

    return Settings(
        bot_token=bot_token,
        admin_chat_id=int(admin_chat_raw),
        database_path=_resolve_path(raw_database_path, base_dir / "bot.db", base_dir),
        checklist_path=_resolve_path(checklist_raw, base_dir / "assets" / "checklist.pdf", base_dir),
        site_url=(os.getenv("SITE_URL") or None),
    )

