from __future__ import annotations

from aiogram.filters.callback_data import CallbackData
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton

from bot.messages import CLINIC, KIT, bot_deep_link
from bot.tracks import TRACKS


class DiagnosticCallback(CallbackData, prefix="diag"):
    step: int
    option: int


class ContactCallback(CallbackData, prefix="contact"):
    action: str


class TrackCallback(CallbackData, prefix="track"):
    track: str


def track_deep_link(track_key: str, action: str) -> str:
    """Ссылка на сценарий конкретного направления.

    Клинические сценарии остаются короткими ради обратной
    совместимости: ссылки из рекламы и текстов сайта не трогаем.
    У продавцов префикс kit_ обязателен — иначе они попали бы в
    клиническую диагностику.
    """
    if track_key == KIT:
        return bot_deep_link(f"kit_{action}")
    return bot_deep_link(action)


def main_menu_keyboard(track_key: str = CLINIC) -> InlineKeyboardMarkup:
    if track_key == KIT:
        return InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="Оценить потенциал канала", url=bot_deep_link("kit_audit"))],
                [InlineKeyboardButton(text="Забрать чек-лист запуска", url=bot_deep_link("kit_checklist"))],
                [InlineKeyboardButton(text="Задать вопрос", url=bot_deep_link("kit_question"))],
                [InlineKeyboardButton(text="Кейсы", url=bot_deep_link("kit_cases"))],
            ]
        )

    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Забрать чек-лист в Telegram", url=bot_deep_link("checklist"))],
            [InlineKeyboardButton(text="Понять, где теряются пациенты", url=bot_deep_link("audit"))],
            [InlineKeyboardButton(text="Пройти мини-диагностику", url=bot_deep_link("audit"))],
            [InlineKeyboardButton(text="Задать вопрос", url=bot_deep_link("question"))],
            [InlineKeyboardButton(text="Кейсы", url=bot_deep_link("cases"))],
        ]
    )


def track_picker_keyboard() -> InlineKeyboardMarkup:
    """Выбор направления. Ставится в меню, когда человек пришёл
    без метки и непонятно, к кому он относится."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Я продавец на маркетплейсе",
                    callback_data=TrackCallback(track=KIT).pack(),
                )
            ],
            [
                InlineKeyboardButton(
                    text="Я владелец клиники",
                    callback_data=TrackCallback(track=CLINIC).pack(),
                )
            ],
        ]
    )


def checklist_keyboard(track_key: str = CLINIC) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Пройти мини-диагностику",
                    url=track_deep_link(track_key, "audit"),
                )
            ],
            [InlineKeyboardButton(text="Посмотреть кейсы", url=track_deep_link(track_key, "cases"))],
            [InlineKeyboardButton(text="Вернуться в меню", url=bot_deep_link("menu"))],
        ]
    )


def cases_keyboard(track_key: str = CLINIC) -> InlineKeyboardMarkup:
    cases = TRACKS[track_key].cases
    rows: list[list[InlineKeyboardButton]] = []
    current_row: list[InlineKeyboardButton] = []
    for case_id, case in cases.items():
        current_row.append(
            InlineKeyboardButton(
                text=case["title"],
                url=track_deep_link(track_key, f"case_{case_id}"),
            )
        )
        if len(current_row) == 2:
            rows.append(current_row)
            current_row = []
    if current_row:
        rows.append(current_row)
    rows.append([InlineKeyboardButton(text="Мини-диагностика", url=track_deep_link(track_key, "audit"))])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def diagnostic_keyboard(step: int, track_key: str = CLINIC) -> InlineKeyboardMarkup:
    question = TRACKS[track_key].questions[step]
    rows = []
    for index, option in enumerate(question.options):
        rows.append(
            [
                InlineKeyboardButton(
                    text=option,
                    callback_data=DiagnosticCallback(step=step, option=index).pack(),
                )
            ]
        )
    return InlineKeyboardMarkup(inline_keyboard=rows)


def diagnostic_result_keyboard(track_key: str = CLINIC) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Оставить контакт", callback_data=ContactCallback(action="request").pack())],
            [InlineKeyboardButton(text="Вернуться в меню", url=bot_deep_link("menu"))],
        ]
    )


def contact_request_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="Поделиться контактом", request_contact=True)],
            [KeyboardButton(text="Пишите сюда в Telegram")],
            [KeyboardButton(text="В меню")],
        ],
        resize_keyboard=True,
        one_time_keyboard=True,
    )