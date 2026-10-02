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

// Проверка токена реальным запросом, а не только фактом наличия:
// секрета в окружении недостаточно, чтобы понять, рабочий он или нет.
import { githubFetch, type GithubError } from "../lib/github";

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

/**
 * Что Git думает о нашем токене.
 *
 * Запрос только на чтение и только к самому репозиторию: он ничего не
 * меняет, но отличает «секрет задан» от «секрет работает» — а именно
 * это и нельзя увидеть в булевом флаге. Права на запись не проверяются:
 * такой запрос потребовал бы создать настоящий коммит.
 */
async function checkToken(env: Env): Promise<Record<string, unknown>> {
  const [owner, name] = String(env.GITHUB_REPO || "").split("/");
  if (!env.GITHUB_TOKEN) return { checked: false, reason: "GITHUB_TOKEN не задан" };
  if (!owner || !name) return { checked: false, reason: "GITHUB_REPO не задан или неверного вида" };

  try {
    const response = await githubFetch(env, `https://api.github.com/repos/${owner}/${name}`);
    const scopes = response.headers.get("x-oauth-scopes") || "";
    const remaining = response.headers.get("x-ratelimit-remaining");
    return {
      checked: true,
      ok: true,
      // У fine-grained токенов поле пустое — так и должно быть.
      scopes: scopes ? scopes.split(",").map((s) => s.trim()).filter(Boolean) : "fine-grained",
      rateLimitRemaining: remaining === null ? null : Number(remaining),
    };
  } catch (error) {
    const status = (error as GithubError).status;
    return {
      checked: true,
      ok: false,
      status,
      reason: (error as Error).message,
    };
  }
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
    // Токен проверен запросом к репозиторию: одного факта «секрет задан»
    // мало, ведь именно его недостаток и вызывал отказ публикации.
    github: await checkToken(env),
  });
};
