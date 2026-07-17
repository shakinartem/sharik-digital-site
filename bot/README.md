# Telegram bot MVP

Отдельный MVP-бот для проекта `ШАРиК-digital`.

## Что умеет

- `/start` с deep links;
- сохранение Telegram-профиля в SQLite;
- выдача чек-листа;
- мини-диагностика / пред-аудит;
- отправка заявки в `ADMIN_CHAT_ID`;
- `/menu` и `/cancel`;
- обработка ссылок `checklist`, `audit`, `consultation`, `question`, `cases`, `case_<caseId>`.

## Запуск

Работать удобнее из папки `bot/`:

```powershell
cd bot
py -m venv .venv
.venv\Scripts\activate
pip install -e .
copy .env.example .env
python -m bot
```

## Env

- `BOT_TOKEN` - токен от BotFather
- `ADMIN_CHAT_ID` - чат или канал, куда бот отправляет заявки
- `DATABASE_URL` - путь к SQLite, по умолчанию `sqlite:///./bot.db`
- `CHECKLIST_FILE` - путь к PDF-чек-листу, по умолчанию `./assets/checklist.pdf`
- `SITE_URL` - пока не обязателен
- `BOT_USERNAME` - по умолчанию `sharik_digital_bot`

## Что нужно добавить вручную

- `BOT_TOKEN`
- `ADMIN_CHAT_ID`
- PDF-чек-лист по пути из `CHECKLIST_FILE`

Если файла PDF нет, бот покажет текстовую заглушку и не упадёт.

