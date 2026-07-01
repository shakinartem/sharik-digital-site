from bot.flow import resolve_start_param


def test_resolve_start_param_supports_known_deep_links():
    assert resolve_start_param("checklist") == "checklist"
    assert resolve_start_param("audit") == "audit"
    assert resolve_start_param("consultation") == "consultation"
    assert resolve_start_param("question") == "question"
    assert resolve_start_param("cases") == "cases"
    assert resolve_start_param("case_eurodent") == "case"


def test_resolve_start_param_defaults_to_menu():
    assert resolve_start_param(None) == "menu"
    assert resolve_start_param("unknown") == "menu"
