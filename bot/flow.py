from __future__ import annotations

KNOWN_START_PARAMS = {
    "menu",
    "checklist",
    "audit",
    "consultation",
    "question",
    "cases",
}


def resolve_start_param(param: str | None) -> str:
    if not param:
        return "menu"

    normalized = param.strip().lower()
    if normalized.startswith("case_"):
        return "case"
    if normalized in KNOWN_START_PARAMS:
        return normalized
    return "menu"


def extract_case_id(param: str | None) -> str | None:
    if not param:
        return None

    normalized = param.strip().lower()
    if not normalized.startswith("case_"):
        return None
    case_id = normalized.removeprefix("case_").strip()
    return case_id or None
