/**
 * Проверка окружения Pages Functions.
 *
 * Нужен, чтобы за секунды понять, доехали ли биндинги и секреты до
 * функций. Значения не показываются — только факт наличия, иначе
 * эндпоинт стал бы способом утечь токен.
 *
 * Закрыт паролем админки: список того, что настроено, не должен быть
 * виден всем подряд.
 */

interface Env {
  CONTENT?: unknown;
  ANALYTICS?: unknown;
  ADMIN_PASSWORD?: string;
  GITHUB_TOKEN?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
  BOT_TOKEN?: string;
  ADMIN_CHAT_ID?: string;
}

export const onRequest = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const noContent = new Response(null, { status: 204 });

  if (request.method !== "GET") return noContent;

  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!env.ADMIN_PASSWORD || token !== env.ADMIN_PASSWORD) {
    return Response.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  return Response.json({
    bindings: {
      CONTENT: Boolean(env.CONTENT),
      ANALYTICS: Boolean(env.ANALYTICS),
    },
    secrets: {
      ADMIN_PASSWORD: Boolean(env.ADMIN_PASSWORD),
      GITHUB_TOKEN: Boolean(env.GITHUB_TOKEN),
      BOT_TOKEN: Boolean(env.BOT_TOKEN),
      // Без ADMIN_CHAT_ID форма заявки возвращает 500 — самая частая
      // причина «заявки не приходят», поэтому выводим её явно.
      ADMIN_CHAT_ID: Boolean(env.ADMIN_CHAT_ID),
    },
    vars: {
      GITHUB_REPO: env.GITHUB_REPO || null,
      GITHUB_BRANCH: env.GITHUB_BRANCH || null,
    },
  });
};
