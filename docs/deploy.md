# Деплой

Рекомендуемый путь для MVP: Vercel. Проект собирается стандартной командой Next.js и не требует обязательных переменных окружения для лендинга.

## Текущий статус перед публикацией

- Сборка: `npm run build`.
- Основной CTA: `https://t.me/sharik_digital_bot`.
- Страницы: `/`, `/privacy`.
- Режим: статический рендер Next.js там, где это возможно.

## GitHub

1. Создать новый репозиторий: `sharik-digital-site`.
2. Загрузить содержимое этого проекта в репозиторий.
3. Проверить, что в корне есть `package.json`.

### Токен для публикации из админки

Публикация (`/api/admin/publish`) коммитит файлы в репозиторий, поэтому
токен должен давать право **записи**. Fine-grained:

- репозиторий `shakinartem/sharik-digital-site` выбран при выдаче;
- права **Contents: Read and write**;
- срок жизни — не истёк (утечка в историю репозитория попадает).

Команда для Pages-проекта:

```bash
npx wrangler pages secret put GITHUB_TOKEN --project-name=sharik-digital-site
```

Проверить, что токен рабочий, можно запросом `/api/health` (с паролем
админки) — в ответе появится раздел `github`:

- `ok: true` — токен принят GitHub;
- `ok: false` с `reason` — там же указано, что именно не так: токен
  отозван, не выбран репозиторий или не хватает прав.

### «Не удалось прочитать ветку … HTTP 403»

Такой текст админка показывала раньше при любом отказе GitHub на чтение
и **не показывала настоящую причину**: HTTP 403 у GitHub означает и
«нет прав», и «исчерпан лимит запросов», и лечится это по-разному.
Сейчас причина читается из ответа GitHub и показывается прямо в
сообщении, а время сброса лимита — вместе с ней.

Репозиторий публичный, поэтому чтение ветки и дерева выполняется и без
токена (сначала с токеном, при 401/403 — анонимно). Поэтому такая ошибка
больше не означает, что сломан доступ к репозиторию: если дело в токене,
отказ придёт на самой записи, где токен действительно необходим.

Читающий доступ к api.github.com без токена — 60 запросов в час на адрес,
а исходящие адреса Cloudflare общие, поэтому лимит может исчерпать кто-то
другой. В таком случае помогает рабочий токен, а не повторная попытка.

## Vercel

1. Import Git Repository.
2. Выбрать `sharik-digital-site`.
3. Framework preset: Next.js.
4. Build command: `npm run build`.
5. Output: стандартный Next.js.
6. Добавить домен.

## Cloudflare Pages

1. Create Pages project.
2. Connect to GitHub.
3. Framework preset: Next.js.
4. Build command: `npm run build`.
5. Deploy command/adapter может потребовать next-on-pages, если используется динамика. Для MVP проще начать с Vercel.

### Секреты для автоматического деплоя

Workflow `.github/workflows/deploy.yml` выкатывает прод через
`wrangler pages deploy` и требует двух секретов в репозитории.
Без них падает **только** шаг «Deploy to Cloudflare Pages»: сборка
(`npm ci`, `Generate content`, `Build`) проходит успешно.

Создание токена: <https://dash.cloudflare.com/profile/api-tokens>

Права токена. Без `Account Settings: Read` wrangler не сумеет
определить аккаунт и упадёт с «Failed to automatically retrieve
account IDs for the logged in user»:

| Раздел | Право |
|---|---|
| User | User Details: **Read** |
| Account | Account Settings: **Read** |
| Account | Cloudflare Pages: **Edit** |

Область токена — **Account → Sakinartem28@gmail.com's Account**,
а не Zone: проект Pages принадлежит аккаунту, не домену.

Account ID (он же `accountId` в workflow) —
`2710ede6f87b97565fc846d0d6ae2170`.

Затем в репозитории: **Settings → Secrets and variables → Actions**
(<https://github.com/shakinartem/sharik-digital-site/settings/secrets/actions>)
добавить два секрета:

| Имя | Значение |
|---|---|
| `CLOUDFLARE_API_TOKEN` | строка токена целиком, без кавычек |
| `CLOUDFLARE_ACCOUNT_ID` | `2710ede6f87b97565fc846d0d6ae2170` |

После добавления workflow сам не перезапускается — нужно либо
перезапустить упавший запуск (Re-run failed jobs), либо сделать
новый push.

Пока секретов нет, прод выкатывается вручную:

```bash
npm run deploy
```

Команда использует локальную авторизацию `wrangler login` и к
секретам репозитория отношения не имеет.

## После деплоя

- Проверить кнопки Telegram.
- Проверить мобильную версию.
- Проверить модальные окна кейсов.
- Подключить Яндекс Метрику.
- Подключить домен.
