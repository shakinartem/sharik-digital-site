from __future__ import annotations

from dataclasses import dataclass

from bot.tracks import CLINIC, KIT, TRACKS

# Маршруты, у которых есть трек. Значение — ключ направления.
TRACKED_START_PARAMS: dict[str, str] = {
    "checklist": CLINIC,
    "audit": CLINIC,
    "consultation": CLINIC,
    "question": CLINIC,
    "cases": CLINIC,
    "kit_checklist": KIT,
    "kit_audit": KIT,
    "kit_consultation": KIT,
    "kit_question": KIT,
    "kit_cases": KIT,
}

# Сценарии продавцов, у которых в старых ссылках были свои имена.
# Из лендинга они ушли на kit_audit и kit_consultation, но в рекламе
# могли остаться: ведём на тот же сценарий, что и по новой метке.
SELLER_ALIASES: dict[str, str] = {
    "potential": "kit_audit",
    "launch": "kit_consultation",
}

# Короткие ссылки без трека — это клинические сценарии. Они зашиты
# в тексты на сайте и в рекламные кампании, поэтому переименовывать
# их нельзя: старые ссылки перестанут работать.
LEGACY_START_PARAMS = frozenset({"checklist", "audit", "consultation", "question", "cases"})

KNOWN_START_PARAMS = frozenset(TRACKED_START_PARAMS) | {"menu"}


@dataclass(frozen=True, slots=True)
class StartRoute:
    """Разобранный deep link: куда идти и в каком направлении."""

    action: str
    track: str
    case_id: str | None = None


# Алиас для ссылок, которые уже стоят в рекламных кампаниях: префикс
# seller_ сайт использовал раньше, но бот его не знал и молча открывал
# главное меню. Оставляем поддержку, чтобы старые объявления не стали
# хуже, а новые ведём на kit_.
LEGACY_SELLER_PREFIX = "seller_"


def resolve_start_param(param: str | None) -> str:
    """Имя действия без учёта направления.

    Сохранено для прежних вызовов и тестов: resolve_start_param
    ("kit_audit") вернёт "audit".
    """
    if not param:
        return "menu"

    normalized = param.strip().lower()
    if normalized.startswith(LEGACY_SELLER_PREFIX):
        normalized = normalized.removeprefix(LEGACY_SELLER_PREFIX)
        if normalized in SELLER_ALIASES:
            normalized = SELLER_ALIASES[normalized]
        else:
            normalized = f"kit_{normalized}"
    if normalized.startswith("case_") or normalized.startswith("kit_case_"):
        return "case"
    if normalized.startswith("track_"):
        return "track"

    if normalized in TRACKED_START_PARAMS:
        return normalized.removeprefix("kit_")

    if normalized == "menu":
        return "menu"

    return "menu"


def resolve_track(param: str | None) -> str:
    """Направление по deep link. Неизвестное — клиника.

    Откат нужен для ссылок, уже разошедшихся по рекламе: лучше
    показать знакомый сценарий, чем ошибку.
    """
    if not param:
        return CLINIC
    normalized = param.strip().lower()
    if normalized in TRACKED_START_PARAMS:
        return TRACKED_START_PARAMS[normalized]
    if normalized.startswith(LEGACY_SELLER_PREFIX) or normalized.startswith("kit_"):
        return KIT
    return CLINIC


def extract_case_id(param: str | None) -> str | None:
    if not param:
        return None
    normalized = param.strip().lower()
    if normalized.startswith(LEGACY_SELLER_PREFIX):
        normalized = normalized.removeprefix(LEGACY_SELLER_PREFIX)
    for prefix in ("kit_case_", "case_"):
        if normalized.startswith(prefix):
            case_id = normalized.removeprefix(prefix).strip()
            if case_id:
                return case_id
    return None


def resolve_route(param: str | None) -> StartRoute:
    """Полное разобранное правило перехода по deep link."""
    track = resolve_track(param)
    action = resolve_start_param(param)

    if action == "case":
        case_id = extract_case_id(param)
        if case_id and case_id in TRACKS[track].cases:
            return StartRoute(action="case", track=track, case_id=case_id)
        # Кейс неизвестен этому направлению: не показываем чужой
        # кейс, отдаём список.
        return StartRoute(action="cases", track=track)

    return StartRoute(action=action, track=track)
