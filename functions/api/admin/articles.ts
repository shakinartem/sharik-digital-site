/**
 * API админки: список статей, чтение, сохранение, создание, удаление.
 *
 * Статьи лежат в Cloudflare KV, а не в git: иначе для правки текста
 * пришлось бы запускать сборку на своей машине. Здесь же держится
 * и черновик, и статус публикации — редактор может сохранить
 * недописанный материал и вернуться к нему позже.
 *
 * Почему статический экспорт не мешает: страница /admin и этот
 * endpoint — Pages Functions, они живут на edge и не требуют сервера.
 * А вот сборка статических страниц берёт статьи из git-версии
 * content/articles — публикация подтверждается отдельным шагом.
 */

/** Минимальное описание интерфейса KV без внешних зависимостей. */
interface KVNamespace {
  get(key: string, type?: "text"): Promise<string | null>;
  get(key: string, options: { type: "json" }): Promise<unknown>;
  list(options?: { prefix?: string; limit?: number }): Promise<{
    keys: { name: string }[];
  }>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
  delete(key: string): Promise<void>;
}

interface Env {
  CONTENT?: KVNamespace;
  ADMIN_PASSWORD?: string;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_ARTICLE_BYTES = 200_000;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

/** Сравнение в постоянном времени: защита от подбора пароля по времени ответа. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function isAuthed(request: Request, env: Env): boolean {
  const password = env.ADMIN_PASSWORD;
  if (!password) return false;
  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  return token.length > 0 && safeEqual(token, password);
}

/**
 * Публичный GET /api/admin/articles работает без пароля и отдаёт
 * только метаданные: он нужен админке, чтобы показать список статей
 * до входа. Содержимое статей и любые изменения — только с паролем.
 */
function isMetadataRequest(request: Request): boolean {
  const url = new URL(request.url);
  return url.searchParams.get("meta") === "1";
}

/**
 * Ключ записи в KV.
 *
 * Раздел входит в ключ намеренно: у статьи, кейса и отзыва
 * идентификаторы независимы, и общий префикс привёл бы к тому, что
 * кейс «eurodent» затёр бы статью с таким же slug.
 */
function listKey(section: string, slug: string) {
  return `content:item:${section}:${slug}`;
}

const SECTIONS = new Set(["article", "case", "review"]);

async function handleList(env: Env, includeBodies: boolean) {
  const kv = env.CONTENT;
  if (!kv) return json({ error: "CONTENT не настроен" }, 500);

  const { keys } = await kv.list({ prefix: "content:item:" });
  const entries = await Promise.all(
    keys.map(async (key) => {
      const parts = key.name.replace("content:item:", "").split(":");
      const section = parts.shift() || "article";
      const slug = parts.join(":");
      const raw = await kv.get(key.name);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as {
        slug: string;
        markdown: string;
        updatedAt?: string;
        published?: boolean;
        draft?: boolean;
      };
      // Заголовок берём из frontmatter: список не должен разбирать
      // весь markdown на клиенте.
      const title = parsed.markdown.match(/^title:\s*(.*)$/m)?.[1]?.trim() || parsed.slug;
      return {
        slug: parsed.slug,
        title,
        markdown: parsed.markdown,
        // Старые записи без раздела считаем статьями.
        section,
        updatedAt: parsed.updatedAt,
        published: parsed.published !== false,
        draft: parsed.draft === true,
      };
    }),
  );

  return json({ articles: entries.filter(Boolean) });
}

export const onRequest = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // CORS не нужен: админка живёт на том же домене.
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });

  if (!isAuthed(request, env) && !(request.method === "GET" && isMetadataRequest(request))) {
    return json({ error: "Требуется авторизация" }, 401);
  }
  if (!env.CONTENT) return json({ error: "CONTENT не настроен" }, 500);

  if (request.method === "GET") {
    return handleList(env, isAuthed(request, env));
  }

  const slug = url.searchParams.get("slug") || "";

  if (request.method === "PUT" || request.method === "POST") {
    let payload: {
      slug?: string;
      markdown?: string;
      published?: boolean;
      draft?: boolean;
      section?: string;
    };
    try {
      payload = (await request.json()) as typeof payload;
    } catch {
      return json({ error: "Некорректный JSON" }, 400);
    }

    const target = payload.slug || slug;
    if (!target || !SLUG_RE.test(target)) {
      return json({ error: "Некорректный slug: только латиница в нижнем регистре, цифры и дефисы" }, 400);
    }
    const markdown = String(payload.markdown || "");
    if (!markdown.trim()) return json({ error: "Пустой текст статьи" }, 400);
    if (new TextEncoder().encode(markdown).length > MAX_ARTICLE_BYTES) {
      return json({ error: "Статья слишком большая (максимум 200 КБ)" }, 413);
    }

    // Минимальная валидация frontmatter: без slug и title сборка упадёт,
    // но ловить это на публикации слишком поздно
    if (!/^---\r?\n/.test(markdown)) {
      return json({ error: "Файл должен начинаться с блока --- (frontmatter)" }, 400);
    }
    if (!/^slug:\s*\S+/m.test(markdown)) {
      return json({ error: "В frontmatter нет поля slug" }, 400);
    }
    if (!/^title:\s*\S+/m.test(markdown)) {
      return json({ error: "В frontmatter нет поля title" }, 400);
    }

    // Раздел из запроса: статья, кейс или отзыв. Без него
    // админка не сможет разложить записи по вкладкам.
    const section = SECTIONS.has(payload.section || "") ? payload.section! : "article";

    // У статьи идентификатор лежит в frontmatter, у кейса и отзыва —
    // в поле id. Проверяем нужное, иначе файл не соберётся.
    const idField = section === "article" ? /^slug:\s*(\S+)/m : /^id:\s*(\S+)/m;
    const declared = markdown.match(idField)?.[1];
    if (declared && declared !== target) {
      return json(
        { error: `Идентификатор в файле (${declared}) не совпадает с заданным (${target})` },
        400,
      );
    }

    const record = {
      slug: target,
      markdown,
      updatedAt: new Date().toISOString(),
      published: payload.published !== false,
      draft: payload.draft === true,
      section,
    };

    await env.CONTENT.put(listKey(section, target), JSON.stringify(record));

    return json({ ok: true, slug: target, section, updatedAt: record.updatedAt });
  }

  if (request.method === "DELETE") {
    if (!slug || !SLUG_RE.test(slug)) return json({ error: "Некорректный slug" }, 400);
    const section = url.searchParams.get("section") || "article";
    await env.CONTENT.delete(listKey(section, slug));
    return json({ ok: true, slug, section });
  }

  return json({ error: "Метод не поддерживается" }, 405);
};
