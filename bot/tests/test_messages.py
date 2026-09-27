from bot.messages import CLINIC, KIT, format_lead_message
from bot.tracks import get_track


def _lead(**overrides):
    payload = dict(
        telegram_id=123456,
        username="seller",
        first_name="Иван",
        last_name=None,
        start_param="audit",
        clinic_name="Dental Care",
        city="Saratov",
        role="owner",
        clinic_type="Стоматология",
        existing_tools="Сайт, карты",
        main_problem="Мало заявок",
        lead_channels="Telegram",
        response_speed="На следующий день",
        priority="Больше пациентов",
        audit_focus="checklist",
        telegram_contact_allowed=False,
        comment="",
    )
    payload.update(overrides)
    return format_lead_message(**payload)


def test_format_lead_message_includes_core_fields():
    text = _lead()
    assert "Telegram ID" in text
    assert "@seller" in text
    assert "Dental Care" in text
    assert "Источник" in text


def test_clinic_lead_uses_clinic_labels():
    text = _lead()
    assert "Направление: Клиники" in text
    assert "Тип клиники" in text
    assert "Куда приходят заявки" in text


def test_kit_lead_uses_seller_labels_and_hides_clinic_fields():
    track = get_track(KIT)
    text = _lead(
        track=track.key,
        field_labels={q.key: track.label(q.key) for q in track.questions},
        clinic_name=None,
        city=None,
        role=None,
    )
    assert "Направление: Продавцы" in text
    assert "Категория товаров" in text
    assert "Куда попадают заказы" in text
    # Клинические подписи и поля продавцу не показываем.
    assert "Тип клиники" not in text
    assert "Клиника:" not in text
    assert "Город:" not in text


def test_kit_lead_keeps_shared_fields():
    track = get_track(KIT)
    text = _lead(
        track=track.key,
        field_labels={q.key: track.label(q.key) for q in track.questions},
    )
    assert "Telegram ID" in text
    assert "@seller" in text
    assert "Источник" in text


def test_no_dental_emoji_in_lead():
    """Эмодзи зуба остался от клинического сценария и пугал продавцов."""
    assert "🦷" not in _lead()

