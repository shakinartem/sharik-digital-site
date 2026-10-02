from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any

from bot.models import LeadRecord, UserProfile, now_iso


class BotStorage:
    def __init__(self, db_path: Path) -> None:
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.db_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _init_db(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    telegram_id INTEGER PRIMARY KEY,
                    username TEXT,
                    first_name TEXT,
                    last_name TEXT,
                    language_code TEXT,
                    start_param TEXT,
                    first_seen_at TEXT NOT NULL,
                    last_seen_at TEXT NOT NULL,
                    contact_phone TEXT
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS leads (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    telegram_id INTEGER NOT NULL,
                    kind TEXT NOT NULL,
                    payload_json TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (telegram_id) REFERENCES users (telegram_id)
                )
                """
            )

    def upsert_user(
        self,
        *,
        telegram_id: int,
        username: str | None,
        first_name: str | None,
        last_name: str | None,
        language_code: str | None,
        start_param: str | None,
    ) -> None:
        timestamp = now_iso()
        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO users (
                    telegram_id, username, first_name, last_name, language_code,
                    start_param, first_seen_at, last_seen_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(telegram_id) DO UPDATE SET
                    username = excluded.username,
                    first_name = excluded.first_name,
                    last_name = excluded.last_name,
                    language_code = excluded.language_code,
                    start_param = excluded.start_param,
                    last_seen_at = excluded.last_seen_at
                """,
                (
                    telegram_id,
                    username,
                    first_name,
                    last_name,
                    language_code,
                    start_param,
                    timestamp,
                    timestamp,
                ),
            )

    def save_contact(self, *, telegram_id: int, contact_phone: str | None) -> None:
        timestamp = now_iso()
        with self._connect() as connection:
            connection.execute(
                """
                UPDATE users
                SET contact_phone = ?, last_seen_at = ?
                WHERE telegram_id = ?
                """,
                (contact_phone, timestamp, telegram_id),
            )

    def get_user(self, telegram_id: int) -> UserProfile | None:
        with self._connect() as connection:
            row = connection.execute(
                """
                SELECT telegram_id, username, first_name, last_name, language_code,
                       start_param, first_seen_at, last_seen_at, contact_phone
                FROM users
                WHERE telegram_id = ?
                """,
                (telegram_id,),
            ).fetchone()
        if row is None:
            return None
        return UserProfile(
            telegram_id=row["telegram_id"],
            username=row["username"],
            first_name=row["first_name"],
            last_name=row["last_name"],
            language_code=row["language_code"],
            start_param=row["start_param"],
            first_seen_at=row["first_seen_at"],
            last_seen_at=row["last_seen_at"],
            contact_phone=row["contact_phone"],
        )

    def save_lead(self, *, telegram_id: int, payload: dict[str, Any], kind: str = "diagnostic") -> LeadRecord:
        timestamp = now_iso()
        payload_json = json.dumps(payload, ensure_ascii=False)
        with self._connect() as connection:
            cursor = connection.execute(
                """
                INSERT INTO leads (telegram_id, kind, payload_json, created_at)
                VALUES (?, ?, ?, ?)
                """,
                (telegram_id, kind, payload_json, timestamp),
            )
        return LeadRecord(
            id=cursor.lastrowid,
            telegram_id=telegram_id,
            kind=kind,
            payload=payload,
            created_at=timestamp,
        )

    def get_latest_lead(self, telegram_id: int) -> LeadRecord | None:
        with self._connect() as connection:
            row = connection.execute(
                """
                SELECT id, telegram_id, kind, payload_json, created_at
                FROM leads
                WHERE telegram_id = ?
                ORDER BY id DESC
                LIMIT 1
                """,
                (telegram_id,),
            ).fetchone()
        if row is None:
            return None
        return LeadRecord(
            id=row["id"],
            telegram_id=row["telegram_id"],
            kind=row["kind"],
            payload=json.loads(row["payload_json"]),
            created_at=row["created_at"],
        )

