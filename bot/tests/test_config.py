from pathlib import Path

from bot.config import Settings, load_settings


def test_load_settings_reads_required_env(monkeypatch):
    scratch_dir = Path(__file__).resolve().parent / "_scratch"
    scratch_dir.mkdir(parents=True, exist_ok=True)
    checklist_path = scratch_dir / "checklist.pdf"
    checklist_path.write_text("placeholder", encoding="utf-8")

    monkeypatch.setenv("BOT_TOKEN", "token-123")
    monkeypatch.setenv("ADMIN_CHAT_ID", "-1001234567890")
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{scratch_dir / 'bot.db'}")
    monkeypatch.setenv("CHECKLIST_FILE", str(checklist_path))

    settings = load_settings()

    assert isinstance(settings, Settings)
    assert settings.bot_token == "token-123"
    assert settings.admin_chat_id == -1001234567890
    assert settings.database_path == scratch_dir / "bot.db"
    assert settings.checklist_path == checklist_path
