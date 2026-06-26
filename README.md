# ШАРиК-digital site

MVP-лендинг для digital-агентства ШАРиК-digital: стоматологии, медицинские клиники, лид-магнит, Telegram-бот, кейсы и заявки.

## Стек

- Next.js
- TypeScript
- Tailwind CSS
- Деплой: Vercel или Cloudflare Pages

## Быстрый старт

```bash
npm install
npm run dev
```

Открыть: `http://localhost:3000`

## Структура

```txt
app/
  page.tsx
  privacy/page.tsx
components/
  Header.tsx
  CasesSection.tsx
  ui.tsx
data/
  cases.ts
  site.ts
public/
  brand/
  cases/
  refs/
docs/
  bot-flow.md
  codex-prompt.md
  deploy.md
```

## CTA

Главная связка:

`Сайт -> https://t.me/sharik_digital_bot -> чек-лист -> диагностика -> заявка в чат команды`

## Что важно

- Лид-магнит стоит высоко на странице.
- Услуги и комплексы идут ближе к концу.
- Кейсы открываются в модальных окнах.
- В боте телефон не обязателен: автоматически доступны Telegram ID, username, first_name, last_name, language_code.
