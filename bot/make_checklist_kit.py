"""Сборка PDF-чек-листа для продавцов маркетплейсов.

Содержание опирается на официальную справку Яндекс KIT, а не на
общие советы: каждый пункт соответствует разделу настройки, который
реально существует. Проверяется по llms-full.txt.

Оформление повторяет бренд: бордо #760229, тёмно-синий #061C41,
Montserrat на заголовках и Manrope в тексте — те же шрифты, что
на сайте, поэтому PDF не выглядит чужеродным в лендинге.
"""
from __future__ import annotations

from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

ASSETS = Path(__file__).resolve().parent / "assets"
FONTS = ASSETS / "fonts"

PRIMARY = HexColor("#760229")
ACCENT = HexColor("#9B002F")
INK = HexColor("#061C41")
MUTED = HexColor("#6B7280")
LINE = HexColor("#E5E7EB")
TINT = HexColor("#F5F5F5")


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("Display", str(FONTS / "montserrat-Bold.ttf")))
    pdfmetrics.registerFont(TTFont("DisplayX", str(FONTS / "montserrat-ExtraBold.ttf")))
    pdfmetrics.registerFont(TTFont("Body", str(FONTS / "manrope-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("BodySemibold", str(FONTS / "manrope-SemiBold.ttf")))
    pdfmetrics.registerFont(TTFont("BodyBold", str(FONTS / "manrope-Bold.ttf")))


S_TITLE = ParagraphStyle("title", fontName="DisplayX", fontSize=25, leading=29, textColor=INK, spaceAfter=4)
S_SUB = ParagraphStyle("sub", fontName="Body", fontSize=10.5, leading=15, textColor=MUTED)
S_KICKER = ParagraphStyle("kicker", fontName="BodyBold", fontSize=8.5, leading=11, textColor=PRIMARY)
S_H = ParagraphStyle("h", fontName="Display", fontSize=13, leading=17, textColor=INK, spaceBefore=2, spaceAfter=6)
S_ITEM = ParagraphStyle("item", fontName="Body", fontSize=9.6, leading=14.2, textColor=INK, leftIndent=13, bulletIndent=2)
S_ITEM_B = ParagraphStyle("itemb", fontName="BodySemibold", fontSize=9.6, leading=14.2, textColor=INK, leftIndent=13, bulletIndent=2)
S_NOTE = ParagraphStyle("note", fontName="Body", fontSize=9, leading=13.5, textColor=MUTED)
S_WHY = ParagraphStyle("why", fontName="Body", fontSize=9.2, leading=13.6, textColor=PRIMARY)
S_FOOT = ParagraphStyle("foot", fontName="Body", fontSize=8, leading=11, textColor=MUTED)


# Разделы повторяют структуру справки: сначала понятно, подходит ли
# вообще KIT, потом порядок работ, потом узкие места, которые чаще
# всего ломают запуск.
SECTIONS: list[tuple[str, str, list[tuple[str, str]]]] = [
    (
        "Шаг 0",
        "Проверьте, подходит ли вам KIT",
        [
            ("Есть ли у вас ИП или ООО",
             "Доступ к платформе есть только у ИП и юридических лиц. Физлицу каталог завести нельзя."),
            ("Нет ли в ассортименте запрещённых позиций",
             "Алкоголь, табачные изделия, оружие и рецептурные лекарственные средства через сервис не продаются."),
            ("Нет ли мерных и весовых товаров",
             "Платформа пока не адаптирована под гвозди, доски, линолеум, песок и провода."),
            ("Нет ли товаров со сложными характеристиками",
             "Автозапчасти и подобное продавать можно, но только на базовых возможностях."),
            ("Готова ли политика конфиденциальности",
             "Требование 152-ФЗ к документам, а не к вёрстке: она нужна до запуска, а не после. Отдельно уточните, что в ней упомянуты Метрика и вебвизор, если планируете их использовать."),
        ],
    ),
    (
        "Шаг 1",
        "Данные, которые нужно собрать заранее",
        [
            ("Документы на компанию и банковские реквизиты",
             "Пустая информация о компании всплывает на этапе подключения оплаты — когда деньги уже приходят."),
            ("Перечень товаров с ценами",
             "Без цен карточка не доходит до витрины, и это заметно не сразу."),
            ("Реальные остатки и условия хранения",
             "Заказ есть, а товара нет — самая дорогая ошибка при запуске."),
            ("Условия доставки и самовывоза",
             "Логистика настраивается до приёма первой продажи."),
            ("Тексты категорий и карточек",
             "Описание категории — это посадочная страница, а не подпись в каталоге."),
        ],
    ),
    (
        "Шаг 2",
        "Товары, цены и остатки",
        [
            ("Категория соответствует реальному товару",
             "Карточка не в той ветке почти не находится через внутреннюю навигацию."),
            ("У каждого товара заполнены цена и остаток",
             "Цена без остатка и остаток без цены не продаются."),
            ("Фотографии загружены",
             "Первое, на что смотрит покупатель, и основа для фильтра и выдачи."),
            ("Заведены склады",
             "Склады появляются сами после загрузки товаров с остатками: отдельной кнопки нет."),
            ("Остатки синхронизированы, а не введены один раз",
             "Через месяц витрина разойдётся с реальностью — это хуже пустого каталога."),
        ],
    ),
    (
        "Шаг 3",
        "Оплата",
        [
            ("Выберите сервис под свою аудиторию",
             "Яндекс Пэй доступен только авторизованным в Яндекс ID, CloudPayments — всем остальным, включая тех, у кого аккаунта нет."),
            ("Подключите онлайн-кассу",
             "Без неё онлайн-оплата при самовывозе не заработает."),
            ("Решите, нужен ли порог минимальной суммы",
             "Проверяется до применения промокода. Полезен при низкой марже, вреден на старте и для товаров срочного спроса."),
            ("Учтите комиссию за наличные",
             "При оплате при получении наличными возможна комиссия транспортной компании — она вычитается из маржи заказа."),
        ],
    ),
    (
        "Шаг 4",
        "Доставка",
        [
            ("Подключите службы доставки и настройте стоимость",
             "Служба отвечает на вопрос «кто везёт», склад — «откуда и когда забирают»."),
            ("Заполните графики отгрузки и забора",
             "От графика зависит срок доставки, который видит покупатель. Незаполненный график сужает выбор дат и снижает конверсию."),
            ("Включите КГТ, если есть крупногабаритный товар",
             "Диваны, холодильники и мебель без этой опции едут по обычному сценарию."),
            ("Не правьте данные в кабинетах служб доставки",
             "После настройки логистики в KIT это приводит к ошибкам в обработке заказов."),
        ],
    ),
    (
        "Шаг 5",
        "Проверка перед открытием",
        [
            ("Сделайте тестовый заказ",
             "Стоит десяти минут и показывает ошибки, которые иначе найдёт покупатель."),
            ("Проверьте, что карточки видны в каталоге",
             "Созданная карточка может не попасть на витрину."),
            ("Проверьте даты доставки в корзине",
             "Они должны совпадать с графиком отгрузки."),
            ("Отправьте sitemap в Яндекс.Вебмастер",
             "Без этого новые страницы узнают поисковики только по внутренним ссылкам."),
        ],
    ),
]


def draw_page(canvas, doc) -> None:
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(PRIMARY)
    canvas.rect(0, height - 12 * mm, width, 12 * mm, stroke=0, fill=1)
    canvas.setFillColor(MUTED)
    canvas.setFont("Body", 7.5)
    canvas.drawString(18 * mm, height - 8.4 * mm, "ШАРиК digital · чек-лист запуска магазина на Яндекс KIT")
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(18 * mm, 14 * mm, width - 18 * mm, 14 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Body", 7.5)
    canvas.drawString(18 * mm, 10 * mm, "sharik-digital.ru/sellers")
    canvas.drawRightString(width - 18 * mm, 10 * mm, f"Стр. {doc.page}")
    canvas.restoreState()


def build() -> Path:
    register_fonts()
    out = ASSETS / "checklist-kit.pdf"

    doc = BaseDocTemplate(
        str(out),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        title="Чек-лист запуска магазина на Яндекс KIT",
        author="ШАРиК digital",
    )
    frame = Frame(
        doc.leftMargin,
        doc.bottomMargin,
        doc.width,
        doc.height,
        id="body",
    )
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=draw_page)])

    story: list = []

    # Шапка
    story.append(Paragraph("ЧЕК-ЛИСТ ДЛЯ ПРОДАВЦОВ", S_KICKER))
    story.append(Spacer(1, 3))
    story.append(Paragraph("Запуск магазина<br/>на Яндекс KIT", S_TITLE))
    story.append(Spacer(1, 8))
    story.append(
        Paragraph(
            "Порядок работ и точки, на которых запуски обычно ломаются. "
            "Каждый пункт соответствует разделу официальной справки Яндекса: "
            "если сомневаетесь в деталях интерфейса, сверяйтесь с "
            "yandex.ru/support/kit/ru.",
            S_SUB,
        )
    )
    story.append(Spacer(1, 12))

    # Предупреждение
    warn = Table(
        [[Paragraph(
            "<b>Сначала прочитайте шаг 0.</b> Если в ассортименте есть запрещённые "
            "категории или мерные товары, продолжать не нужно: платформа их не "
            "принимает, и деньги будут потрачены впустую.",
            S_ITEM,
        )]],
        colWidths=[doc.width],
    )
    warn.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), HexColor("#FBF1F4")),
        ("BOX", (0, 0), (-1, -1), 0.6, HexColor("#E8CBD4")),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(warn)
    story.append(Spacer(1, 14))

    for index, (kicker, title, items) in enumerate(SECTIONS):
        blocks: list = [Paragraph(kicker.upper(), S_KICKER), Spacer(1, 2), Paragraph(title, S_H)]
        for check, why in items:
            blocks.append(Paragraph(f"&#9744;&nbsp;&nbsp;{check}", S_ITEM_B))
            blocks.append(Spacer(1, 1))
            blocks.append(Paragraph(f"{why}", S_WHY))
            blocks.append(Spacer(1, 5))
        if index < len(SECTIONS) - 1:
            story.append(KeepTogether(blocks))
            story.append(Spacer(1, 10))
        else:
            story.extend(blocks)

    # Финал
    story.append(Spacer(1, 12))
    final = Table(
        [[Paragraph(
            "<b>Считаете, подходит ли вам KIT?</b> Разберём ассортимент и модель "
            "продаж и покажем потенциал канала в осторожном, базовом и "
            "оптимистичном сценариях. Напишите в Telegram: @sharik_digitall",
            S_ITEM,
        )]],
        colWidths=[doc.width],
    )
    final.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), TINT),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(final)
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "Источник технических требований: официальная справка Яндекс KIT. "
        "Проверяйте актуальность: интерфейс и состав разделов меняются.",
        S_FOOT,
    ))

    doc.build(story)
    return out


if __name__ == "__main__":
    path = build()
    print("готов", path.name, round(path.stat().st_size / 1024, 1), "KB")