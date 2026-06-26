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

## После деплоя

- Проверить кнопки Telegram.
- Проверить мобильную версию.
- Проверить модальные окна кейсов.
- Подключить Яндекс Метрику.
- Подключить домен.
