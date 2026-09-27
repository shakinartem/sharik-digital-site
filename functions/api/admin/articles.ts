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

// Разбор архива репозитория лежит рядом: используется только здесь,
// а в другие endpoint его тянуть незачем.
import { readFilesFromTarGz } from "../../lib/tar";

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
  GITHUB_TOKEN?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
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

const SECTIONS = new Set(["article", "case", "review", "faq"]);

/** Раздел контента -> папка в репозитории. */
const SECTION_DIR: Record<string, string> = {
  article: "content/articles",
  case: "content/cases",
  review: "content/reviews",
  faq: "content/faq",
};

type RepoItem = { slug: string; section: string; markdown: string };

/**
 * Сколько живёт распакованный снимок контента.
 *
 * Пять минут — компромисс: архив репозитория весит несколько мегабайт,
 * и тянуть его при каждом открытии админки расточительно, а держать
 * дольше нельзя, иначе после публикации правки не видно.
 */
const SNAPSHOT_TTL = 300;

function snapshotKey(branch: string) {
  return `content:snapshot:${branch}`;
}

/** Раздел по пути файла: content/faq/kit-1.md -> faq. */
function sectionOf(path: string): string {
  for (const section of Object.keys(SECTION_DIR)) {
    if (path.startsWith(SECTION_DIR[section] + "/") && path.endsWith(".md")) return section;
  }
  return "";
}

/**
 * Читает контент, который уже лежит в репозитории.
 *
 * Зачем: KV — только черновик. Реальные 15 статей, 9 кейсов и 29
 * вопросов лежат в git, и без этого админка показывала «Отзывы (0)» —
 * то есть утверждала обратное.
 *
 * Источник — архив codeload.github.com, а не api.github.com. С API всё
 * было плохо сразу по двум причинам: он требует токена, а токен в
 * проекте Pages не даёт доступа (403), и без токена лимит в 60 запросов
 * в час считается на IP — у адресов Cloudflare он общий и исчерпается
 * чужими запросами. Архив этому лимиту не подчиняется, отдаётся без
 * токена, а распаковать его в Worker умеет DecompressionStream.
 *
 * Публикация токена по-прежнему требует: она идёт через API записи и
 * падает с понятной ошибкой, если токен не выпущен.
 */
async function readFromRepo(env: Env): Promise<Record<string, RepoItem>> {
  const repoName = env.GITHUB_REPO;
  if (!repoName) throw new Error("GITHUB_REPO не задан в проекте Pages");

  const [owner, name] = repoName.split("/");
  if (!owner || !name) throw new Error(`GITHUB_REPO задан неверно: ${repoName}`);

  const branch = env.GITHUB_BRANCH || "main";
  const kv = env.CONTENT;
  if (!kv) throw new Error("CONTENT не настроен: нет хранилища для снимка контента");

  const key = snapshotKey(branch);

  const cached = await kv.get(key, "text").catch(() => null);
  if (cached) {
    try {
      return JSON.parse(cached) as Record<string, RepoItem>;
    } catch {
      // Испорченный снимок не должен ломать админку: читаем заново.
    }
  }

  const url =
    `https://codeload.github.com/${owner}/${name}/tar.gz/refs/heads/` +
    `${encodeURIComponent(branch)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `GitHub не отдал архив репозитория: HTTP ${response.status}. ` +
        "Проверьте GITHUB_REPO и GITHUB_BRANCH в проекте Pages.",
    );
  }

  const out: Record<string, RepoItem> = {};
  const decoder = new TextDecoder();

  await readFilesFromTarGz(
    response,
    "",
    (path) => Boolean(sectionOf(path)),
    (path, data) => {
      const section = sectionOf(path);
      if (!section) return;
      const slug = path.slice(path.lastIndexOf("/") + 1).replace(/\.md$/, "");
      out[`${section}:${slug}`] = { slug, section, markdown: decoder.decode(data) };
    },
  );

  // Снимок кладём, только если что-то нашли: пустой архив в кэше
  // замаскировал бы настоящую ошибку до следующей попытки.
  if (Object.keys(out).length) {
    await kv.put(key, JSON.stringify(out), { expirationTtl: SNAPSHOT_TTL }).catch(() => null);
  }

  return out;
}
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
        // Отметка, что запись пока не опубликована и лежит только в KV.
        fromDraft: true,
      };
    }),
  );

  const fromDraft = entries.filter(Boolean) as Record<string, unknown>[];

  // Соединяем с содержимым репозитория: черновик имеет приоритет,
  // иначе на его месте стоял бы старый текст из git.
  let repo: Record<string, { slug: string; section: string; markdown: string }> = {};
  let repoInfo: { ok: boolean; error?: string; count: number } = { ok: true, count: 0 };
  try {
    repo = await readFromRepo(env);
    repoInfo = { ok: true, count: Object.keys(repo).length };
  } catch (error) {
    repoInfo = { ok: false, error: (error as Error).message, count: 0 };
  }
  const merged: Record<string, unknown>[] = [];
  const seen = new Set<string>();

  for (const item of fromDraft) {
    merged.push(item);
    seen.add(`${item.section}:${item.slug}`);
  }

  for (const [id, file] of Object.entries(repo)) {
    if (seen.has(id)) continue;
    const title =
      file.markdown.match(/^title:\s*(.*)$/m)?.[1]?.trim() ||
      file.markdown.match(/^question:\s*(.*)$/m)?.[1]?.trim() ||
      file.markdown.match(/^author:\s*(.*)$/m)?.[1]?.trim() ||
      file.slug;
    merged.push({
      slug: file.slug,
      title,
      markdown: file.markdown,
      section: file.section,
      published: true,
      draft: false,
      // Запись из репозитория: её можно править, она уже на сайте.
      fromDraft: false,
    });
  }

  // Стабильный порядок: сначала черновики, затем по разделу и имени.
  merged.sort((a, b) => {
    const sectionOrder = { article: 0, case: 1, review: 2, faq: 3 } as Record<string, number>;
    const sa = sectionOrder[String(a.section)] ?? 9;
    const sb = sectionOrder[String(b.section)] ?? 9;
    if (sa !== sb) return sa - sb;
    return String(a.slug).localeCompare(String(b.slug));
  });

  /**
   * Публичный запрос без пароля (meta=1) отдаёт только метаданные.
   *
   * Раньше includeBodies игнорировался, и любой мог получить полный
   * текст всех статей, кейсов и вопросов по ссылке без пароля. Для
   * списка метаданных текста не нужно: заголовок, раздел, статус.
   */
  const payload = includeBodies
    ? merged
    : merged.map((item) => {
        const { markdown: _markdown, ...rest } = item as Record<string, unknown>;
        return rest;
      });

  return json({ articles: payload, total: merged.length, repo: repoInfo });
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

    if (!/^---\r?\n/.test(markdown)) {
      return json({ error: "Файл должен начинаться с блока --- (frontmatter)" }, 400);
    }

    // Раздел из запроса: статья, кейс, отзыв или вопрос FAQ. Без него
    // админка не сможет разложить записи по вкладкам.
    const section = SECTIONS.has(payload.section || "") ? payload.section! : "article";

    // Обязательные поля зависят от типа записи. У статьи идентификатор
    // и заголовок лежат в frontmatter, у кейса — id и title, у отзыва —
    // id (его опознаёт автор), у FAQ — id и question. Универсальная
    // проверка на slug+title запрещала бы два из четырёх форматов.
    const idField = section === "article" ? /^slug:\s*(\S+)/m : /^id:\s*(\S+)/m;
    if (!idField.test(markdown)) {
      return json(
        { error: `В frontmatter нет поля ${section === "article" ? "slug" : "id"}` },
        400,
      );
    }

    const declared = markdown.match(idField)?.[1];
    if (declared && declared !== target) {
      return json(
        { error: `Идентификатор в файле (${declared}) не совпадает с заданным (${target})` },
        400,
      );
    }

    if (section === "article" || section === "case") {
      if (!/^title:\s*\S+/m.test(markdown)) {
        return json({ error: "В frontmatter нет поля title" }, 400);
      }
    }

    if (section === "faq" && !/^question:\s*\S+/m.test(markdown)) {
      return json({ error: "В frontmatter нет поля question" }, 400);
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
