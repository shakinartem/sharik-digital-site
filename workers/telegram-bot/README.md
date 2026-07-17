# Cloudflare Telegram Bot — ШАРиК-digital

Этот бот повторяет MVP Python/aiogram бота, но работает как Cloudflare Worker:
- нет VPS;
- нет локального polling-процесса;
- хранилище в D1.

Python-бот в `bot/` оставлен как backup/reference.

## Окружение

- Cloudflare Workers
- D1
- Telegram Bot API через `fetch`
- TypeScript

## Быстрый старт

```bash
cd workers/telegram-bot
npm install
```

### 1. Создать D1

```bash
npx wrangler d1 create sharik-digital-bot-db
npx wrangler d1 migrations apply sharik-digital-bot-db --remote
```

## 2. Заполнить `wrangler.toml`

Создайте `wrangler.toml` на основе `wrangler.toml.example` и укажите реальный `database_id`.

## 3. Secrets

```bash
npx wrangler secret put BOT_TOKEN
npx wrangler secret put ADMIN_CHAT_ID
npx wrangler secret put WEBHOOK_SECRET
```

## 4. Деплой

```bash
npm run db:migrate
npm run deploy
```

## 5. Webhook

Telegram → Worker:

```bash
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://YOUR_WORKER_URL/webhook",
    "secret_token": "YOUR_WEBHOOK_SECRET",
    "drop_pending_updates": true
  }'
```

## 6. Откат на Python-бота

```bash
# отключить webhook
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/deleteWebhook" \
  -H "Content-Type: application/json" \
  -d '{"drop_pending_updates": true}'

# запустить Python polling
cd bot
python -m bot
```

## Проверка

- `GET /health`
- `/start`
- `/checklist`
- `/audit`
- `/cases`
- `/question`
- «Оставить контакт»