from bot.flow import resolve_route, resolve_start_param, resolve_track
from bot.tracks import CLINIC, KIT


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


def test_legacy_links_stay_on_clinic_track():
    """Ссылки зашиты в тексты сайта и рекламу — они обязаны работать."""
    for param in ("checklist", "audit", "consultation", "question", "cases"):
        route = resolve_route(param)
        assert route.track == CLINIC, param
    assert resolve_route("case_eurodent").track == CLINIC
    assert resolve_route("case_eurodent").case_id == "eurodent"


def test_kit_links_route_to_seller_track():
    for param, action in (
        ("kit_checklist", "checklist"),
        ("kit_audit", "audit"),
        ("kit_consultation", "consultation"),
        ("kit_question", "question"),
        ("kit_cases", "cases"),
    ):
        route = resolve_route(param)
        assert route.track == KIT, param
        assert route.action == action, param


def test_kit_case_link_opens_seller_case():
    route = resolve_route("kit_case_arximed-security")
    assert route.action == "case"
    assert route.track == KIT
    assert route.case_id == "arximed-security"


def test_seller_never_sees_clinic_case():
    """Клинический кейс продавцу показывать нельзя — это и неверно,
    и выглядит как ошибка. Отдаём список кейсов направления."""
    route = resolve_route("kit_case_eurodent")
    assert route.track == KIT
    assert route.action == "cases"
    assert route.case_id is None


def test_unknown_kit_link_falls_back_inside_kit_track():
    route = resolve_route("kit_audit2")
    assert route.track == KIT
    assert route.action == "menu"


def test_clinic_keeps_full_case_library():
    route = resolve_route("case_arximed-security")
    assert route.action == "case"
    assert route.case_id == "arximed-security"


def test_resolve_track_defaults_to_clinic():
    assert resolve_track(None) == CLINIC
    assert resolve_track("unknown") == CLINIC
    assert resolve_track("kit_audit") == KIT


def test_legacy_seller_prefix_still_works():
    """Префикс seller_ стоял на лендинге, но бот его не знал и просто
    открывал меню. Поддерживаем, чтобы старые ссылки из рекламы
    заработали так же, как новые на kit_."""
    assert resolve_route("seller_audit").action == "audit"
    assert resolve_route("seller_audit").track == KIT
    assert resolve_route("seller_question").action == "question"
    assert resolve_route("seller_cases").action == "cases"


def test_legacy_seller_named_scenarios_map_to_current_ones():
    assert resolve_route("seller_potential").action == "audit"
    assert resolve_route("seller_launch").action == "consultation"


def test_legacy_seller_case_link_finds_case():
    route = resolve_route("seller_case_arximed-security")
    assert route.action == "case"
    assert route.track == KIT
    assert route.case_id == "arximed-security"


