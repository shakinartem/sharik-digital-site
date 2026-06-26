# Telegram bot scaffold

Бот можно делать отдельным репозиторием или отдельной папкой. Для MVP достаточно:

- `/start`;
- сохранение Telegram-профиля;
- выдача PDF-чек-листа;
- мини-диагностика;
- заявка в отдельный чат команды.

## Переменные окружения

```env
BOT_TOKEN=token_from_botfather
LEADS_CHAT_ID=-1001234567890
CHECKLIST_FILE_ID=telegram_file_id_or_local_path
```

## Логика данных пользователя

Автоматически сохраняем:

- telegram_id;
- username;
- first_name;
- last_name;
- language_code;
- source/deep_link;
- created_at;
- status.

Номер телефона не просим в MVP. Если понадобится, добавляем добровольную кнопку `Поделиться контактом`.

## Рекомендация по стеку

Для твоих Telegram-проектов удобно использовать Python + aiogram или Node.js + grammY/Telegraf. Если бот будет частью общей CRM-системы, лучше сразу хранить пользователей и ответы диагностики в БД.
