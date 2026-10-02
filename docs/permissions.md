# Разрешения: Cloudflare, GitHub, Telegram

Полный список прав, которые нужны проекту — и для работы агента, и для
жизни сайта. Всё сверено с кодом и с реальными ресурсами аккаунта
(`wrangler kv namespace list`, `wrangler d1 list`, `wrangler whoami`),
а не взято из общей документации Cloudflare.

Документ отвечает на два разных вопроса, их важно не путать:

1. **Что нужно мне (агенту), чтобы работать с площадкой** — раздел
   «Для агента».
2. **Что нужно сайту, чтобы работать самому** — раздел
   «Для работоспособности сайта». Эти права токену GitHub и Functions не
   нужны: это право платформы, а не ключа.

---

## Кратко: минимум на сегодня

Если нужен один токен на всё обслуживание — берите строки из раздела
**«Для агента»**. Обязательные — четыре:

| Право | Зачем |
|---|---|
| User → User Details: **Read** | `wrangler` определяет владельца токена |
| Account → Account Settings: **Read** | без него wrangler не находит аккаунт и падает |
| Account → Cloudflare Pages: **Edit** | деплой сайта |
| Account → Workers Scripts: **Edit** | деплой Telegram-бота (это Worker, не Pages) |

Область токена: **Account → Sakinartem28@gmail.com's Account**,
не Zone. Account ID — `2710ede6f87b97565fc846d0d6ae2170`.

---

## Для агента

Права, без которых я не смогу обслуживать площадку.

### Область User

| Право | Обязательное | Зачем именно |
|---|---|---|
| User Details: **Read** | **да** | `wrangler whoami` и все команды сначала читают профиль владельца токена |

### Область Account

| Право | Обязательное | Зачем именно |
|---|---|---|
| Account Settings: **Read** | **да** | wrangler по токену определяет, к какому аккаунту он относится. Без этого — `Failed to automatically retrieve account IDs for the logged in user`, деплой падает при рабочем токене |
| Cloudflare Pages: **Edit** | **да** | `wrangler pages deploy` — выкатка сайта |
| Workers Scripts: **Edit** | **да** | деплой `workers/telegram-bot`; права Pages его не покрывают |
| Workers KV Storage: **Edit** | нет | два namespace проекта: контент и аналитика. Edit, а не Write, из-за удаления записей при публикации |
| D1: **Edit** | нет | база `sharik-digital-bot-db`: миграции, осмотр данных |
| Workers Tail: **Read** | нет | логи Functions, когда заявки не приходят |
| Account Analytics: **Read** | нет | статистика проекта в дашборде |

### Область Zone

Проект живёт на своём домене `sharik-digital.ru`, но Pages-проект
принадлежит **аккаунту**, а не зоне. Для деплоя зональных прав не нужно
вовсе. Они понадобятся, только если появится работа с DNS или
маршрутами вручную:

| Право | Зачем |
|---|---|
| Workers Routes: **Edit** | маршруты Worker вручную, а не через Pages |
| DNS: **Edit** | только если понадобится править записи домена |

---

## Для работоспособности сайта

Это **не права токена**. Это то, что должно быть настроено в проекте,
иначе сайт работает частично или не работает вовсе.

### Ресурсы Cloudflare, которые используются

Проверено списками в аккаунте (`wrangler kv namespace list`,
`wrangler d1 list`):

| Ресурс | Идентификатор | Где используется | Что случится без него |
|---|---|---|---|
| Pages-проект `sharik-digital-site` | — | `wrangler.toml`, деплой | нет сайта |
| KV `sharik-content` | `1a4d0569de914ad3b02cdd69f24ab1d1` | биндинг `CONTENT`: черновики статей, кейсов, отзывов | админка не сохраняет тексты |
| KV `sharik-analytics` | `9cecb052736c48dcad2e602ce7266d87` | биндинг `ANALYTICS`: клики, калькуляторы, скроллы | дашборд пустой, заявки не видно |
| Worker `sharik-digital-telegram-bot` | — | `workers/telegram-bot` | бот в Telegram не отвечает |
| D1 `sharik-digital-bot-db` | `aa1d4767-0ed9-4803-9f62-ea7f9bd4a688` | состояние диалогов бота | бот не помнит, на каком шаге пользователь |
| KV `OAUTH_KV` | `db2bcdff60804da7b4ac511ccf8115fa` | служебный, Wrangler OAuth | к проекту не относится |

> В аккаунте есть чужие ресурсы — `qualive-identity`, `spgutils-db`,
> проекты `devpair` и `spgutils`. Они не входят в этот проект. Токен,
> ограниченный ресурсами проекта, до них не дотянется; глобальный без
> ограничений — дотянется, поэтому ограничивайте область.

### Секреты Pages-проекта

Задаются командой (значения в репозитории не хранятся):

```bash
npx wrangler pages secret put <ИМЯ> --project-name=sharik-digital-site
```

| Секрет | Обязательный | Что делает | Без него |
|---|---|---|---|
| `ADMIN_PASSWORD` | **да** | пароль входа в админку | админка недоступна |
| `GITHUB_TOKEN` | **да** | коммит публикации в репозиторий | «Опубликовать» не работает: нет прав на запись |
| `ADMIN_CHAT_ID` | **да** | чат, куда уходят заявки | форма заявки возвращает 500, заявки теряются |
| `BOT_TOKEN` | нет | токен Telegram-бота из Pages | бот на сайте не работает |
| `GITHUB_REPO` | нет | `owner/repo`, из `wrangler.toml` | публикация не знает, куда коммитить |
| `GITHUB_BRANCH` | нет | ветка, из `wrangler.toml` | публикация не знает, куда коммитить |

`GITHUB_REPO` и `GITHUB_BRANCH` — не секреты, а переменные: лежат в
`wrangler.toml` и видны всем.

### Секреты Worker-бота

```bash
npx wrangler secret put <ИМЯ> --config workers/telegram-bot/wrangler.toml
```

| Секрет | Обязательный | Без него |
|---|---|---|
| `BOT_TOKEN` | **да** | бот не может писать в Telegram |
| `ADMIN_CHAT_ID` | **да** | контакты с сайта не доходят |
| `WEBHOOK_SECRET` | нет | проверка подлинности webhook отключена |

Переменные Worker-а: `SITE_URL`, `CHECKLIST_URL`,
`CHECKLIST_KIT_URL`, `BOT_USERNAME` — в `wrangler.toml`.

### Токен GitHub

Отдельный от Cloudflare, fine-grained:

| Право | Зачем |
|---|---|
| репозиторий `shakinartem/sharik-digital-site` | выбран при выдаче |
| Contents: **Read and write** | создание дерева и коммита при публикации |
| Metadata: **Read** | чтение HEAD и дерева |

Репозиторий публичный, поэтому чтение ветки и дерева работает и без
токена — код на это рассчитывает и при отказе GitHub уходит в
анонимный запрос. Запись без токена невозможна.

### Секреты GitHub Actions

Для автоматического деплоя в репозитории
(<https://github.com/shakinartem/sharik-digital-site/settings/secrets/actions>):

| Секрет | Значение |
|---|---|
| `CLOUDFLARE_API_TOKEN` | строка токена Cloudflare целиком |
| `CLOUDFLARE_ACCOUNT_ID` | `2710ede6f87b97565fc846d0d6ae2170` |

Без них workflow падает на шаге «Deploy to Cloudflare Pages», а сборка
проходит успешно.

---

## Чего токену быть не надо

- **Global API Key** — полный доступ к аккаунту, включая удаление. Для
  деплоя не требуется, не выдавайте.
- **Zone: DNS: Edit** и прочие зональные права, если DNS руками не
  трогаете: зона проекту не принадлежит.
- **Доступ к чужим проектам** аккаунта (`devpair`, `spgutils`).
  Ограничивайте через *Account Resources → Specific account*.
- **Токен в переписке и в коде.** Токен Cloudflare показывается один
  раз при создании, в GitHub-секреты вставляется сразу. В репозиторий и
  в чат токен не кладём.

---

## Проверка, что всё настроено

```bash
npx wrangler whoami                                    # аккаунт и права токена
npx wrangler pages project list                        # есть ли Pages-проект
npx wrangler kv namespace list                         # два namespace проекта
npx wrangler d1 list                                   # база бота
npx wrangler pages deployment list --project-name=sharik-digital-site
```

Состояние биндингов и секретов на боевом сайте показывает
`/api/health` — с паролем админки, раздел `github` отвечает, рабочий
ли токен GitHub. Открыть эндпоинт ссылкой нельзя: он закрыт паролем и
показывает список настроенного, а браузер не умеет слать
`Authorization: Bearer`. Кнопка «Проверить окружение» в админке делает
то же самое из браузера.