from __future__ import annotations

from aiogram.filters.callback_data import CallbackData
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton

from bot.messages import DIAGNOSTIC_QUESTIONS, CASE_LIBRARY, bot_deep_link


class DiagnosticCallback(CallbackData, prefix="diag"):
    step: int
    option: int


class ContactCallback(CallbackData, prefix="contact"):
    action: str


def main_menu_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Забрать чек-лист в Telegram", url=bot_deep_link("checklist"))],
            [InlineKeyboardButton(text="Понять, где теряются пациенты", url=bot_deep_link("audit"))],
            [InlineKeyboardButton(text="Пройти мини-диагностику", url=bot_deep_link("audit"))],
            [InlineKeyboardButton(text="Задать вопрос", url=bot_deep_link("question"))],
            [InlineKeyboardButton(text="Кейсы", url=bot_deep_link("cases"))],
        ]
    )


def checklist_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Пройти мини-диагностику", url=bot_deep_link("audit"))],
            [InlineKeyboardButton(text="Посмотреть кейсы", url=bot_deep_link("cases"))],
            [InlineKeyboardButton(text="Вернуться в меню", url=bot_deep_link("menu"))],
        ]
    )


def cases_keyboard() -> InlineKeyboardMarkup:
    rows = []
    current_row: list[InlineKeyboardButton] = []
    for case_id, case in CASE_LIBRARY.items():
        current_row.append(InlineKeyboardButton(text=case["title"], url=bot_deep_link(f"case_{case_id}")))
        if len(current_row) == 2:
            rows.append(current_row)
            current_row = []
    if current_row:
        rows.append(current_row)
    rows.append([InlineKeyboardButton(text="Мини-диагностика", url=bot_deep_link("audit"))])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def diagnostic_keyboard(step: int) -> InlineKeyboardMarkup:
    question = DIAGNOSTIC_QUESTIONS[step]
    rows = []
    for index, option in enumerate(question.options):
        rows.append([InlineKeyboardButton(text=option, callback_data=DiagnosticCallback(step=step, option=index).pack())])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def diagnostic_result_keyboard() -> InlineKeyboardMarkup:
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
            [KeyboardButton(text="/menu")],
        ],
        resize_keyboard=True,
        one_time_keyboard=True,
    )
