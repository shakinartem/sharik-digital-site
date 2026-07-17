from bot.messages import format_lead_message


def test_format_lead_message_includes_core_fields():
    text = format_lead_message(
        telegram_id=123456,
        username="doctor",
        first_name="Anna",
        last_name="Ivanova",
        start_param="audit",
        clinic_name="Dental Care",
        city="Saratov",
        role="owner",
        clinic_type="stomatology",
        existing_tools="site, maps",
        main_problem="leads are lost",
        lead_channels="telegram",
        response_speed="next day",
        priority="audit",
        audit_focus="checklist",
        telegram_contact_allowed=False,
        comment="",
    )

    assert "Telegram ID" in text
    assert "@doctor" in text
    assert "Dental Care" in text
    assert "Источник" in text
