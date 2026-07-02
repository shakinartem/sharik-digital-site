from __future__ import annotations

import logging
from typing import Any

from aiogram import F, Router
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, Contact, Message, FSInputFile, ReplyKeyboardRemove

from bot.config import Settings
from bot.flow import extract_case_id, resolve_start_param
from bot.keyboards import (
    ContactCallback,
    DiagnosticCallback,
    cases_keyboard,
    checklist_keyboard,
    contact_request_keyboard,
    diagnostic_keyboard,
    diagnostic_result_keyboard,
    main_menu_keyboard,
)
from bot.messages import (
    DIAGNOSTIC_QUESTIONS,
    build_audit_intro,
    build_case_text,
    build_cases_menu_text,
    build_checklist_text,
    build_contact_request_text,
    build_contact_saved_text,
    build_main_menu_text,
    build_question_intro,
    format_contact_after_diagnostic_message,
    format_lead_message,
)
from bot.storage import BotStorage


logger = logging.getLogger(__name__)


class FlowStates(StatesGroup):
    diagnostic = State()
    question = State()


def build_router(storage: BotStorage, settings: Settings) -> Router:
    router = Router()

    @router.message(Command("start"))
    async def start_handler(message: Message, state: FSMContext) -> None:
        await state.clear()
        start_param = message.text.split(maxsplit=1)[1] if len(message.text.split(maxsplit=1)) > 1 else None

        user = message.from_user
        if user is not None:
            storage.upsert_user(
                telegram_id=user.id,
                username=user.username,
                first_name=user.first_name,
                last_name=user.last_name,
                language_code=user.language_code,
                start_param=start_param,
            )

        route = resolve_start_param(start_param)
        if route == "checklist":
            await send_checklist(message, settings)
            return
        if route in {"audit", "consultation"}:
            await start_diagnostic(message, state, route)
            return
        if route == "question":
            await start_question(message, state)
            return
        if route == "cases":
            await send_cases(message)
            return
        if route == "case":
            case_id = extract_case_id(start_param)
            await send_case(message, case_id)
            return

        await send_menu(message)

    @router.message(Command("menu"))
    async def menu_handler(message: Message, state: FSMContext) -> None:
        await state.clear()
        await send_menu(message)

    @router.message(Command("cancel"))
    async def cancel_handler(message: Message, state: FSMContext) -> None:
        await state.clear()
        await message.answer("Действие отменено. Возвращаю в меню.", reply_markup=None)
        await send_menu(message)

    @router.callback_query(ContactCallback.filter())
    async def contact_callback_handler(callback: CallbackQuery, state: FSMContext) -> None:
        await callback.answer()
        await callback.message.answer(
            build_contact_request_text(),
            reply_markup=contact_request_keyboard(),
        )
        await state.set_state(FlowStates.question)
        await state.update_data(question_kind="contact_request")

    @router.callback_query(DiagnosticCallback.filter())
    async def diagnostic_answer_handler(callback: CallbackQuery, callback_data: DiagnosticCallback, state: FSMContext) -> None:
        current = await state.get_data()
        step = int(current.get("step", 0))
        if callback_data.step != step:
            await callback.answer("Этот вопрос уже обработан.", show_alert=False)
            return

        answers = dict(current.get("answers", {}))
        question = DIAGNOSTIC_QUESTIONS[step]
        answers[question.key] = question.options[callback_data.option]

        next_step = step + 1
        await callback.answer()

        if next_step >= len(DIAGNOSTIC_QUESTIONS):
            await state.clear()
            await finish_diagnostic(callback.message, callback.from_user, storage, settings, answers, current)
            return

        await state.set_state(FlowStates.diagnostic)
        await state.update_data(step=next_step, answers=answers)
        await callback.message.answer(
            f"Шаг {next_step + 1} из {len(DIAGNOSTIC_QUESTIONS)}\n\n{DIAGNOSTIC_QUESTIONS[next_step].prompt}",
            reply_markup=diagnostic_keyboard(next_step),
        )

    @router.message(FlowStates.question)
    async def question_message_handler(message: Message, state: FSMContext) -> None:
        data = await state.get_data()
        if data.get("question_kind") != "contact_request":
            # Free-text question flow (not contact request)
            await state.clear()
            await save_question(message, storage, settings, message.text or "")
            await message.answer("Спасибо. Сообщение сохранил и передал команде.", reply_markup=None)
            await send_menu(message)
            return

        # --- contact_request flow ---
        user = message.from_user
        if user is None:
            return

        contact_text: str | None = None
        telegram_contact_allowed = False

        # Handle Telegram contact object
        if message.contact is not None:
            contact_obj = message.contact
            if contact_obj.user_id and contact_obj.user_id != user.id:
                await message.answer(
                    "Пожалуйста, отправьте свой собственный контакт.",
                    reply_markup=contact_request_keyboard(),
                )
                return
            contact_text = contact_obj.phone_number

        # Handle text messages
        elif message.text:
            text = message.text.strip()

            # "В меню" button
            if text.lower() in ("в меню", "/menu", "/cancel"):
                await state.clear()
                await message.answer("Возвращаю в меню.", reply_markup=ReplyKeyboardRemove())
                await send_menu(message)
                return

            # "Пишите сюда в Telegram" or "пишите в Telegram"
            if text.lower() == "пишите сюда" or "пишите сюда" in text.lower() or "пишите в telegram" in text.lower():
                contact_text = "Telegram"
                telegram_contact_allowed = True
            else:
                # Treat any other text as a contact (phone, username, etc.)
                contact_text = text

        # No contact and no text - ask again
        else:
            await message.answer(
                "Пожалуйста, отправьте контакт кнопкой, номер телефона или напишите \"пишите сюда\".",
                reply_markup=contact_request_keyboard(),
            )
            return

        # Save contact
        storage.save_contact(telegram_id=user.id, contact_phone=contact_text)

        # Save lead with contact info
        diagnostic_payload = {}
        latest_lead = storage.get_latest_lead(user.id)

        if latest_lead is not None and latest_lead.kind == "diagnostic":
            diagnostic_payload = latest_lead.payload.copy()

        lead_payload = {
            **diagnostic_payload,
            "contact_phone": contact_text,
            "telegram_contact_allowed": telegram_contact_allowed,
        }
        storage.save_lead(telegram_id=user.id, payload=lead_payload, kind="contact_after_diagnostic")

        # Send to admin
        await send_admin_contact_after_diagnostic(
            storage=storage,
            settings=settings,
            user=user,
            contact=contact_text,
            telegram_contact_allowed=telegram_contact_allowed,
            latest_diagnostic=diagnostic_payload if diagnostic_payload else None,
        )

        # Confirm to user
        await state.clear()
        await message.answer(
            build_contact_saved_text(),
            reply_markup=ReplyKeyboardRemove(),
        )
        await send_menu(message)

    @router.message(F.contact)
    async def contact_message_handler(message: Message, state: FSMContext) -> None:
        """Handle contact received outside of any state."""
        contact = message.contact
        user = message.from_user
        if user is None or contact is None:
            return
        if contact.user_id and contact.user_id != user.id:
            await message.answer("Пожалуйста, отправьте свой собственный контакт.")
            return

        storage.save_contact(telegram_id=user.id, contact_phone=contact.phone_number)
        await state.clear()
        await message.answer("Контакт сохранён. Спасибо.", reply_markup=ReplyKeyboardRemove())
        await send_menu(message)

    @router.message(F.text)
    async def fallback_message_handler(message: Message) -> None:
        await send_menu(message)

    return router


async def send_menu(message: Message) -> None:
    await message.answer(build_main_menu_text(), reply_markup=main_menu_keyboard())


async def send_checklist(message: Message, settings: Settings) -> None:
    await message.answer(build_checklist_text(), reply_markup=checklist_keyboard())
    if settings.checklist_path.exists():
        await message.answer_document(FSInputFile(settings.checklist_path))
    else:
        await message.answer(
            "PDF-чек-лист пока не добавлен. Положите файл по пути, указанному в `CHECKLIST_FILE`, и я начну отправлять его автоматически."
        )


async def send_cases(message: Message) -> None:
    await message.answer(build_cases_menu_text(), reply_markup=cases_keyboard())


async def send_case(message: Message, case_id: str | None) -> None:
    if not case_id:
        await message.answer("Не нашёл кейс по этой ссылке.")
        return
    await message.answer(build_case_text(case_id), reply_markup=cases_keyboard())


async def start_diagnostic(message: Message, state: FSMContext, route: str) -> None:
    await state.set_state(FlowStates.diagnostic)
    await state.update_data(step=0, answers={}, source_route=route)
    await message.answer(build_audit_intro())
    await message.answer(
        f"Шаг 1 из {len(DIAGNOSTIC_QUESTIONS)}\n\n{DIAGNOSTIC_QUESTIONS[0].prompt}",
        reply_markup=diagnostic_keyboard(0),
    )


async def start_question(message: Message, state: FSMContext) -> None:
    await state.set_state(FlowStates.question)
    await state.update_data(question_kind="free_text")
    await message.answer(build_question_intro(), reply_markup=contact_request_keyboard())


async def finish_diagnostic(
    message: Message,
    user: Any,
    storage: BotStorage,
    settings: Settings,
    answers: dict[str, Any],
    current: dict[str, Any],
) -> None:
    if user is None:
        return

    payload = {
        "clinic_name": answers.get("clinic_name"),
        "city": answers.get("city"),
        "role": answers.get("role"),
        "clinic_type": answers.get("clinic_type"),
        "existing_tools": answers.get("existing_tools"),
        "main_problem": answers.get("main_problem"),
        "lead_channels": answers.get("lead_channels"),
        "response_speed": answers.get("response_speed"),
        "priority": answers.get("priority"),
        "audit_focus": answers.get("priority"),
        "telegram_contact_allowed": False,
        "comment": None,
        "start_param": current.get("source_route"),
    }
    storage.save_lead(telegram_id=user.id, payload=payload, kind="diagnostic")
    await send_admin_lead(storage, settings, user, payload, kind="diagnostic")
    await message.answer(
        "Спасибо. Я собрал первичную диагностику и передал её команде.\n\nЕсли захотите, можно продолжить вопросом или открыть кейсы.",
        reply_markup=diagnostic_result_keyboard(),
    )


async def save_question(message: Message, storage: BotStorage, settings: Settings, text: str) -> None:
    user = message.from_user
    if user is None:
        return
    payload = {
        "question": text,
        "start_param": "question",
        "telegram_contact_allowed": False,
    }
    storage.save_lead(telegram_id=user.id, payload=payload, kind="question")
    await send_admin_lead(storage, settings, user, payload, kind="question")


async def send_admin_contact_after_diagnostic(
    storage: BotStorage,
    settings: Settings,
    user: Any,
    contact: str,
    telegram_contact_allowed: bool,
    latest_diagnostic: dict[str, Any] | None = None,
) -> None:
    del storage
    bot = settings.bot_username
    text = format_contact_after_diagnostic_message(
        telegram_id=user.id,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        contact=contact,
        telegram_contact_allowed=telegram_contact_allowed,
        latest_diagnostic=latest_diagnostic,
        source=f"@{bot}",
    )

    if settings.admin_chat_id == 0:
        logger.warning("ADMIN_CHAT_ID is missing; lead was not forwarded.")
        return

    from aiogram import Bot

    async with Bot(token=settings.bot_token) as bot_client:
        await bot_client.send_message(settings.admin_chat_id, text)


async def send_admin_lead(
    storage: BotStorage,
    settings: Settings,
    user: Any,
    payload: dict[str, Any],
    *,
    kind: str,
) -> None:
    del storage
    bot = settings.bot_username
    text = format_lead_message(
        telegram_id=user.id,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        start_param=payload.get("start_param"),
        clinic_name=payload.get("clinic_name"),
        city=payload.get("city"),
        role=payload.get("role"),
        clinic_type=payload.get("clinic_type"),
        existing_tools=payload.get("existing_tools"),
        main_problem=payload.get("main_problem"),
        lead_channels=payload.get("lead_channels"),
        response_speed=payload.get("response_speed"),
        priority=payload.get("priority"),
        audit_focus=payload.get("audit_focus") or payload.get("question"),
        telegram_contact_allowed=bool(payload.get("telegram_contact_allowed")),
        comment=payload.get("comment") or payload.get("question"),
        contact_phone=payload.get("contact_phone"),
        source=f"@{bot} ({kind})",
    )

    if settings.admin_chat_id == 0:
        logger.warning("ADMIN_CHAT_ID is missing; lead was not forwarded.")
        return

    from aiogram import Bot

    async with Bot(token=settings.bot_token) as bot_client:
        await bot_client.send_message(settings.admin_chat_id, text)