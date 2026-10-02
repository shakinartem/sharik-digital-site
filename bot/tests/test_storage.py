from pathlib import Path

from bot.storage import BotStorage


def test_storage_persists_user_and_lead():
    scratch_dir = Path(__file__).resolve().parent / "_scratch"
    scratch_dir.mkdir(parents=True, exist_ok=True)
    db_path = scratch_dir / "bot.db"
    if db_path.exists():
        db_path.unlink()

    storage = BotStorage(db_path)

    storage.upsert_user(
        telegram_id=123,
        username="doctor",
        first_name="Anna",
        last_name="Ivanova",
        language_code="ru",
        start_param="checklist",
    )

    user = storage.get_user(123)
    assert user is not None
    assert user.telegram_id == 123
    assert user.username == "doctor"
    assert user.start_param == "checklist"

    storage.save_lead(
        telegram_id=123,
        payload={"clinic_name": "Dental Care", "priority": "audit"},
    )

    lead = storage.get_latest_lead(123)
    assert lead is not None
    assert lead.telegram_id == 123
    assert lead.payload["clinic_name"] == "Dental Care"
