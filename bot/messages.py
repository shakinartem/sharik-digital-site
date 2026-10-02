from __future__ import annotations

from dataclasses import dataclass
from textwrap import dedent
from typing import Any


BOT_USERNAME = "sharik_digital_bot"
BOT_LINK = f"https://t.me/{BOT_USERNAME}"

# Ключи направлений. Объявлены здесь, а не в tracks.py, потому что
# tracks импортирует этот модуль: наоборот получится циклический
# импорт. Тексты — единственное место, где треки не нужны.
CLINIC = "clinic"
KIT = "kit"


@dataclass(frozen=True, slots=True)
class DiagnosticQuestion:
    key: str
    prompt: str
    options: tuple[str, ...]


DIAGNOSTIC_QUESTIONS: tuple[DiagnosticQuestion, ...] = (
    DiagnosticQuestion(
        key="clinic_type",
        prompt="Какая у вас клиника?",
        options=("Стоматология", "Медицинский центр", "Косметология", "Подология", "Другое"),
    ),
    DiagnosticQuestion(
        key="existing_tools",
        prompt="Что уже используется?",
        options=("Сайт", "Соцсети", "Карты", "Реклама", "CRM", "Telegram / WhatsApp-заявки", "Бот", "Пока ничего системного"),
    ),
    DiagnosticQuestion(
        key="main_problem",
        prompt="Что сейчас беспокоит больше всего?",
        options=(
            "Мало заявок",
            "Карты плохо работают",
            "Сайт не приводит пациентов",
            "Соцсети не дают обращений",
            "Заявки теряются",
            "Нет CRM / автоматизации",
            "Не понимаю, что работает",
            "Нужно всё под ключ",
        ),
    ),
    DiagnosticQuestion(
        key="lead_channels",
        prompt="Куда сейчас попадают заявки?",
        options=("Телефон", "WhatsApp", "Telegram", "CRM", "Форма на сайте", "В разные места", "Не отслеживаем системно"),
    ),
    DiagnosticQuestion(
        key="response_speed",
        prompt="Как быстро обычно отвечают пациенту?",
        options=("До 5 минут", "5-30 минут", "В течение часа", "Несколько часов", "На следующий день", "Не знаю"),
    ),
    DiagnosticQuestion(
        key="priority",
        prompt="Что хотите улучшить в первую очередь?",
        options=(
            "Больше пациентов",
            "Усилить карты",
            "Упаковать соцсети",
            "Сделать сайт / лендинг",
            "Настроить заявки в Telegram",
            "Подключить CRM",
            "Автоматизировать обработку",
            "Получить понятный план",
        ),
    ),
)


CASE_LIBRARY: dict[str, dict[str, str]] = {
    "eurodent": {
        "title": "Eurodent",
        "niche": "Стоматология",
        "result": "1,5 млн охватов · 450 лидов · запись на 6 месяцев вперед",
    },
    "biomed": {
        "title": "Биомед",
        "niche": "Стоматология",
        "result": "146 обращений за 3 месяца · +68% действий в картах",
    },
    "interdent": {
        "title": "Интердент",
        "niche": "Стоматология",
        "result": "118 обращений · +57% построений маршрута",
    },
    "divina-podology": {
        "title": "Divina Podology",
        "niche": "Подология",
        "result": "Запуск с нуля · первые клиенты за 2 недели",
    },
    "kerala": {
        "title": "Kerala",
        "niche": "Аюрведа и wellness",
        "result": "500 000 охват · 300 лидов · CPL 230 ₽",
    },
    "arximed-security": {
        "title": "Arximed Security",
        "niche": "MedTech",
        "result": "Ошибки заказа снижены с 3,5% до 0,4%",
    },
    "dental-pro": {
        "title": "Дентал-про",
        "niche": "Стоматология",
        "result": "+41% обращений · 18% конверсия в запись",
    },
    "ibradent": {
        "title": "IbraDent",
        "niche": "Премиальная стоматология",
        "result": "97 лидов · +49% действий в профиле",
    },
    "po-pyatam": {
        "title": "По Пятам",
        "niche": "Подология",
        "result": "100 000+ просмотров в неделю · 10% конверсия в запись",
    },
}


def bot_deep_link(start_param: str) -> str:
    return f"{BOT_LINK}?start={start_param}"


def build_main_menu_text(track_key: str = "clinic") -> str:
    if track_key == KIT:
        return dedent(
            """
            **Что делаем с продавцами маркетплейсов**

            Считаем потенциал собственного канала продаж и, если он нужен,
            запускаем магазин на Яндекс KIT под ключ.

            Выберите, что полезно прямо сейчас:
            """
        ).strip()

    return dedent(
        """
        Привет! Я бот ШАРиК-digital.

        Мы помогаем стоматологиям находить точки, где теряются пациенты: в картах, сайте, соцсетях, заявках и обработке.

        Здесь можно:
        - забрать чек-лист;
        - пройти мини-диагностику;
        - посмотреть кейсы;
        - задать вопрос.
        """
    ).strip()


def build_checklist_text(track_key: str = "clinic") -> str:
    if track_key == KIT:
        return dedent(
            """
            **Чек-лист запуска магазина на Яндекс KIT**

            Порядок работ и точки, на которых запуски обычно ломаются.
            Начните с шага 0: если в ассортименте есть запрещённые
            категории или мерные товары, продолжать не нужно.

            Файл придёт следующим сообщением — сохраните его.
            """
        ).strip()

    return dedent(
        """
        Отлично. Сейчас отправлю чек-лист.

        Если PDF пока не загружен, я покажу короткую заглушку и дам кнопку на мини-диагностику.
        """
    ).strip()


def build_audit_intro(track_key: str = "clinic") -> str:
    if track_key == KIT:
        return dedent(
            """
            **Мини-диагностика продавца**

            Шесть вопросов — две минуты. Покажем, где сейчас теряются
            деньги на площадке и нужен ли вам собственный канал продаж.

            Отвечайте кнопками, текст вводить не нужно.
            """
        ).strip()

    return dedent(
        """
        Давайте быстро посмотрим, где клиника может терять пациентов.

        Я задам несколько коротких вопросов. Это займёт пару минут.
        """
    ).strip()


def build_question_intro() -> str:
    return dedent(
        """
        Напишите вопрос или коротко опишите ситуацию.

        Я сохраню сообщение и передам его команде.
        """
    ).strip()


def build_contact_request_text() -> str:
    return dedent(
        """
        Оставьте удобный контакт или просто напишите, что можно связаться с вами здесь в Telegram.

        Можно отправить:
        — контакт кнопкой ниже;
        — номер телефона;
        — Telegram / WhatsApp / MAX;
        — или просто написать "пишите сюда".
        """
    ).strip()


def build_contact_saved_text() -> str:
    return dedent(
        """
        Готово, контакт сохранил и передал команде.

        Мы посмотрим ответы диагностики и напишем, чтобы разобрать, где клиника может терять пациентов.
        """
    ).strip()


def build_cases_menu_text() -> str:
    return dedent(
        """
        Вот несколько кейсов. Если хотите, могу показать карточку конкретного проекта.

        Нажмите кнопку с кейсом или вернитесь в меню.
        """
    ).strip()


def build_case_text(case_id: str) -> str:
    case = CASE_LIBRARY.get(case_id)
    if case is None:
        return dedent(
            """
            Кейс пока не найден.

            Попробуйте открыть общий список кейсов и выбрать один из доступных вариантов.
            """
        ).strip()

    return dedent(
        f"""
        Кейс: {case["title"]}
        Ниша: {case["niche"]}
        Результат: {case["result"]}

        Если хотите, могу сразу показать мини-диагностику по вашей клинике.
        """
    ).strip()


def format_lead_message(
    *,
    telegram_id: int,
    username: str | None,
    first_name: str | None,
    last_name: str | None,
    start_param: str | None,
    clinic_name: str | None,
    city: str | None,
    role: str | None,
    clinic_type: str | None,
    existing_tools: str | None,
    main_problem: str | None,
    lead_channels: str | None,
    response_speed: str | None,
    priority: str | None,
    audit_focus: str | None,
    telegram_contact_allowed: bool,
    comment: str | None,
    contact_phone: str | None = None,
    source: str = f"@{BOT_USERNAME}",
    track: str = CLINIC,
    field_labels: dict[str, str] | None = None,
) -> str:
    def field(label: str, value: Any) -> str:
        formatted = "—" if value in (None, "", []) else str(value)
        return f"{label}: {formatted}"

    # Подписи приходят снаружи, а не берутся из tracks: тексты лежат
    # ниже треков по графу импортов, и прямой импорт закольцовал бы
    # модули. Ключи совпадают с key вопросов диагностики.
    labels = field_labels or {}

    def answer_label(question_key: str, default: str) -> str:
        return labels.get(question_key, default)

    lines = [
        "Новая заявка с сайта / Telegram-бота",
        "",
        field("Направление", "Клиники" if track == CLINIC else "Продавцы"),
        field("Telegram ID", telegram_id),
        field("Username", f"@{username}" if username else None),
        field("Имя", f"{first_name or ''} {last_name or ''}".strip() or None),
    ]

    # Поля клиники продавцу не нужны: у него нет ни клиники, ни города,
    # и пустые строки в заявке только мешают разбирать её в чате.
    if track == CLINIC:
        lines += [
            field("Клиника", clinic_name),
            field("Город", city),
            field("Роль", role),
        ]

    lines += [
        field(answer_label("clinic_type", "Тип клиники"), clinic_type),
        field(answer_label("existing_tools", "Что уже есть"), existing_tools),
        field(answer_label("main_problem", "Главная проблема"), main_problem),
        field(answer_label("lead_channels", "Куда приходят заявки"), lead_channels),
        field(answer_label("response_speed", "Скорость ответа"), response_speed),
        field(answer_label("priority", "Приоритет"), priority),
        field("Что хочет разобрать", audit_focus),
        field("Можно написать в Telegram", "Да" if telegram_contact_allowed else "Нет"),
        field("Контакт", contact_phone),
        field("Комментарий", comment),
        field("Источник", source),
    ]

    if start_param:
        lines.append(field("Start param", start_param))

    return "\n".join(lines)


def format_contact_after_diagnostic_message(
    *,
    telegram_id: int,
    username: str | None,
    first_name: str | None,
    last_name: str | None,
    contact: str,
    telegram_contact_allowed: bool,
    latest_diagnostic: dict[str, Any] | None = None,
    source: str = f"@{BOT_USERNAME}",
) -> str:
    def field(label: str, value: Any) -> str:
        formatted = "—" if value in (None, "", []) else str(value)
        return f"{label}: {formatted}"

    lines = [
        "Контакт после диагностики",
        "",
        field("Telegram ID", telegram_id),
        field("Username", f"@{username}" if username else None),
        field("Имя", f"{first_name or ''} {last_name or ''}".strip() or None),
    ]

    if latest_diagnostic:
        lines += [
            "",
            "Последняя диагностика:",
            field("- тип клиники", latest_diagnostic.get("clinic_type")),
            field("- что уже есть", latest_diagnostic.get("existing_tools")),
            field("- главная проблема", latest_diagnostic.get("main_problem")),
            field("- куда приходят заявки", latest_diagnostic.get("lead_channels")),
            field("- скорость ответа", latest_diagnostic.get("response_speed")),
            field("- приоритет", latest_diagnostic.get("priority")),
        ]

    from datetime import datetime, timezone

    lines += [
        "",
        field("Контакт", contact),
        field("Можно писать в Telegram", "Да" if telegram_contact_allowed else "Нет"),
        field("Источник", "contact_after_diagnostic"),
        field("Дата", datetime.now(timezone.utc).isoformat()),
    ]

    return "\n".join(lines)
