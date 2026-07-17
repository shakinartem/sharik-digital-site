# Cloudflare Worker Telegram Bot — ШАРиК-digital

## Почему Worker

- нет VPS;
- нет локального polling-процесса;
- хранилище в D1;
- масштабируется автоматически.

Python/aiogram бот в `bot/` оставлен как backup/reference.

## Файлы

```
workers/telegram-bot/
  package.json
  wrangler.toml.example
  migrations/0001_init.sql
  src/
    index.ts
    telegram.ts
    state.ts
    texts.ts
    keyboards.ts
    cases.ts
```

## D1

```bash
cd workers/telegram-bot
npx wrangler d1 create sharik-digital-bot-db
npx wrangler d1 migrations apply sharik-digital-bot-db --remote
```

## Secrets

```bash
npx wrangler secret put BOT_TOKEN
npx wrangler secret put ADMIN_CHAT_ID
npx wrangler secret put WEBHOOK_SECRET
```

## Деплой

```bash
npm run db:migrate
npm run deploy
```

## Webhook

```bash
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://YOUR_WORKER_URL/webhook",
    "secret_token": "YOUR_WEBHOOK_SECRET",
    "drop_pending_updates": true
  }'
```

## Откат на Python-бота

```bash
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/deleteWebhook" \
  -H "Content-Type: application/json" \
  -d '{"drop_pending_updates": true}'

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