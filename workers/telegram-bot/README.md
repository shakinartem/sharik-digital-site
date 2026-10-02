# Cloudflare Telegram Bot — ШАРиК-digital

Боевой бот. Работает как Cloudflare Worker, поэтому не зависит от
включённого компьютера: Telegram сам отправляет обновления на вебхук.

- хранилище в D1;
- два направления: клиники и продавцы маркетплейсов;
- питоновская версия в `bot/` осталась резервной, её логика повторена
  здесь в TypeScript.

## Направления

Направление определяется меткой ссылки и живёт в состоянии диалога:
он переживает перезапуск воркера, иначе человек посреди диагностики
продавца получил бы клиническое меню.

| Метка | Куда ведёт |
| --- | --- |
| `checklist`, `audit`, `question`, `cases`, `case_<id>` | клиники |
| `kit_checklist`, `kit_audit`, `kit_question`, `kit_cases`, `kit_case_<id>` | продавцы |
| `seller_*` | алиас старых ссылок с лендинга |

## Переменные окружения

| Переменная | Назначение |
| --- | --- |
| `BOT_TOKEN` | токен BotFather, secret |
| `ADMIN_CHAT_ID` | чат для заявок |
| `WEBHOOK_SECRET` | секрет в пути вебхука, secret |
| `SITE_URL` | адрес сайта |
| `BOT_USERNAME` | имя бота для подписи заявки |
| `CHECKLIST_URL` | PDF для клиник |
| `CHECKLIST_KIT_URL` | PDF для продавцов |

Чек-листы лежат на самом сайте и отдаются воркеру по ссылке:

- `https://sharik-digital.ru/checklists/clinic.pdf`
- `https://sharik-digital.ru/checklists/kit.pdf`

## Проверки

```bash
npm run typecheck
npm test
```

Тесты закрывают маршрутизацию: старые ссылки остаются клиническими,
`kit_*` ведут к продавцам, алиас `seller_*` работает, а кейс чужого
направления не показывается.

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