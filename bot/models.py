from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass(slots=True)
class UserProfile:
    telegram_id: int
    username: str | None
    first_name: str | None
    last_name: str | None
    language_code: str | None
    start_param: str | None
    first_seen_at: str
    last_seen_at: str
    contact_phone: str | None = None


@dataclass(slots=True)
class LeadRecord:
    id: int
    telegram_id: int
    kind: str
    payload: dict[str, Any]
    created_at: str

