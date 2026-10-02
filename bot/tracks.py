"""Направления работы бота.

Бот обслуживает два разных продукта: пациентопоток клиник и
собственный канал продаж селлеров. Аудитории не пересекаются, и
вопросы у них разные, поэтому один сценарий на всех не работает:
селлеру нельзя предлагать «какая у вас клиника».

Направление хранится одним ключом `track` и проходит через весь
путь заявки — от deep link до сообщения в админский чат. Схема
базы не меняется: новый ключ просто добавляется в payload.

Добавить третье направление — значит дописать Track в TRACKS.
Все старые короткие ссылки остаются валидными и ведут в клинику:
они зашиты в тексты на сайте и в рекламные кампании.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from bot.messages import CASE_LIBRARY, CLINIC, KIT, DiagnosticQuestion

CLINIC = "clinic"
KIT = "kit"

# Диагностика клиники: сценарий 7К, вопросы про пациентопоток.
CLINIC_QUESTIONS: tuple[DiagnosticQuestion, ...] = (
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

# Диагностика продавца: те же шесть шагов, но про каталог,
# площадку и трафик. Ключи оставлены прежними, поэтому старые
# записи в базе остаются читаемыми.
KIT_QUESTIONS: tuple[DiagnosticQuestion, ...] = (
    DiagnosticQuestion(
        key="clinic_type",
        prompt="Что продаёте?",
        options=(
            "Одежда и обувь",
            "Косметика и парфюмерия",
            "Товары для дома",
            "Электроника и гаджеты",
            "Детские товары",
            "Спорт и туризм",
            "Красота и здоровье",
            "Другое",
        ),
    ),
    DiagnosticQuestion(
        key="existing_tools",
        prompt="Где уже продаёте и что настроено?",
        options=(
            "Только Wildberries",
            "Только Ozon",
            "Обе площадки",
            "Свой магазин на Яндекс KIT",
            "Свой сайт",
            "Инфопродукты",
            "Только закупка и перепродажа",
            "Пока ничего",
        ),
    ),
    DiagnosticQuestion(
        key="main_problem",
        prompt="Что сейчас мешает больше всего?",
        options=(
            "Нет своего канала продаж",
            "Всё завязано на площадку",
            "Не понимаю, окупается ли реклама",
            "Мало повторных покупок",
            "Нет нормальной аналитики",
            "Товары теряются в выдаче",
            "Нужен быстрый запуск",
            "Хочу разобраться в цифрах",
        ),
    ),
    DiagnosticQuestion(
        key="lead_channels",
        prompt="Куда сейчас попадают заказы и вопросы?",
        options=(
            "Карточки Wildberries",
            "Карточки Ozon",
            "Свой магазин",
            "Telegram",
            "WhatsApp",
            "Почта",
            "В разные места",
            "Не отслеживаю системно",
        ),
    ),
    DiagnosticQuestion(
        key="response_speed",
        prompt="Как быстро обычно отвечаете покупателю?",
        options=("До 5 минут", "5-30 минут", "В течение часа", "Несколько часов", "На следующий день", "Не знаю"),
    ),
    DiagnosticQuestion(
        key="priority",
        prompt="Что хотите получить в первую очередь?",
        options=(
            "Оценку потенциала канала",
            "План запуска магазина",
            "Понять экономику и окупаемость",
            "Перенести товары с площадки",
            "Настроить аналитику",
            "Собрать SEO для каталога",
            "Определить, нужен ли KIT вообще",
            "Получить понятный план действий",
        ),
    ),
)

# Кейсы продавцов. Собственных кейсов в этом направлении на сайте
# пока нет, поэтому список честно короткий: берём реальный кейс
# по медицинскому оборудованию, который на сайте помечен как
# направление «other», и не выдумываем результаты селлеров,
# которых не было.
KIT_CASES: dict[str, dict[str, str]] = {
    "arximed-security": {
        "title": "Arximed Security",
        "niche": "MedTech и медицинское оборудование",
        "result": "Ошибки заказа снижены с 3,5% до 0,4% · 0 мошеннических оплат",
    },
}

# Подписи полей в заявке. Ключи диагностики одинаковые у обоих
# направлений, но называть «клинику» в заявке селлера нельзя.
LABELS: dict[str, dict[str, str]] = {
    CLINIC: {
        "clinic_type": "Тип клиники",
        "existing_tools": "Что уже есть",
        "main_problem": "Главная проблема",
        "lead_channels": "Куда приходят заявки",
        "response_speed": "Скорость ответа",
        "priority": "Приоритет",
    },
    KIT: {
        "clinic_type": "Категория товаров",
        "existing_tools": "Где продаёте сейчас",
        "main_problem": "Что мешает",
        "lead_channels": "Куда попадают заказы",
        "response_speed": "Скорость ответа",
        "priority": "Что хочет получить",
    },
}

# Человеческие названия направлений для меню и заголовка заявки.
TITLES: dict[str, str] = {
    CLINIC: "Клиникам",
    KIT: "Продавцам",
}

SUBTITLES: dict[str, str] = {
    CLINIC: "Пациентопоток по методологии 7К",
    KIT: "Собственный канал продаж поверх маркетплейса",
}


@dataclass(frozen=True, slots=True)
class Track:
    key: str
    title: str
    subtitle: str
    questions: tuple[DiagnosticQuestion, ...]
    cases: dict[str, dict[str, str]] = field(default_factory=dict)
    checklist_name: str = "checklist.pdf"
    # Имя файла чек-листа переопределяется настройками, если
    # оператор положил свой PDF по другому пути.
    checklist_env: str = "CHECKLIST_FILE"

    def label(self, question_key: str) -> str:
        return LABELS[self.key].get(question_key, question_key)

    def answer_labels(self) -> list[str]:
        return [self.label(q.key) for q in self.questions]


TRACKS: dict[str, Track] = {
    CLINIC: Track(
        key=CLINIC,
        title=TITLES[CLINIC],
        subtitle=SUBTITLES[CLINIC],
        questions=CLINIC_QUESTIONS,
        cases=CASE_LIBRARY,
        checklist_name="checklist.pdf",
    ),
    KIT: Track(
        key=KIT,
        title=TITLES[KIT],
        subtitle=SUBTITLES[KIT],
        questions=KIT_QUESTIONS,
        cases=KIT_CASES,
        checklist_name="checklist-kit.pdf",
        checklist_env="CHECKLIST_KIT_FILE",
    ),
}

DEFAULT_TRACK = CLINIC


def get_track(key: str | None) -> Track:
    """Возвращает направление по ключу, при неизвестном — базовое.

    Молчаливый откат важен для старых ссылок: если в рекламу попал
    `?start=kit_audit2`, человек увидит клинический сценарий, а не
    ошибку.
    """
    if not key:
        return TRACKS[DEFAULT_TRACK]
    return TRACKS.get(key, TRACKS[DEFAULT_TRACK])


def question_by_key(track_key: str, question_key: str) -> DiagnosticQuestion | None:
    for question in TRACKS[track_key].questions:
        if question.key == question_key:
            return question
    return None


def normalize_track(value: Any) -> str:
    return value if isinstance(value, str) and value in TRACKS else DEFAULT_TRACK