/**
 * Публикация контента: коммит в GitHub + запуск сборки Cloudflare Pages.
 *
 * Почему через git, а не напрямую в KV: сайт собирается статически,
 * и markdown лежит в репозитории. Только коммит приводит к тому, что
 * новая страница реально появится на sharik-digital.ru. KV служит
 * черновиком и историей правок, но источником правды для продакшена
 * остаётся репозиторий.
 *
 * Схема «Сохранить»:
 *   1. админка кладёт markdown в KV — мгновенно, это черновик;
 *   2. этот эндпоинт коммитит файлы из content/ в репозиторий;
 *   3. дёргает deploy hook — Cloudflare пересобирает сайт;
 *   4. через 1–2 минуты изменение видно всем.
 */

interface Env {
  CONTENT?: KVNamespace;
  ADMIN_PASSWORD?: string;
  GITHUB_TOKEN?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
}

interface KVNamespace {
  get(key: string, type?: "text"): Promise<string | null>;
  get(key: string, options: { type: "json" }): Promise<unknown>;
  list(options?: { prefix?: string }): Promise<{ keys: { name: string }[] }>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

/** Куда коммитим: GITHUB_REPO в формате owner/repo. */
function repo(env: Env) {
  const [owner, name] = String(env.GITHUB_REPO || "").split("/");
  if (!owner || !name) throw new Error("GITHUB_REPO не задан (формат owner/repo)");
  return { owner, name };
}

const githubHeaders = (env: Env) => ({
  Authorization: `Bearer ${env.GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
});

/** Строка -> base64. GitHub требует base64, а не urlencoded. */
function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  // Собираем строку кусками: обычный for..of по Uint8Array требует
  // downlevelIteration, а конфиг проекта его не включает.
  const CHUNK = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const chunk = bytes.subarray(i, i + CHUNK);
    for (let j = 0; j < chunk.length; j++) {
      binary += String.fromCharCode(chunk[j]);
    }
  }
  return btoa(binary);
}

/** Разделы контента, из которых собирается коммит. */
const CONTENT_PATHS = ["content/articles", "content/cases", "content/reviews"];

/** Идентификатор материала: латиница в нижнем регистре, цифры, дефисы. */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;


/**
 * Собирает дерево файлов для коммита из KV.
 *
 * Источник — именно KV, а не репозиторий: правки из админки ещё
 * не закоммичены, и если читать content/ из GitHub, на прод уехал бы
 * старый текст. Все файлы разделов кладутся в дерево целиком — так
 * публикация не зависит от того, что уже было в репозитории.
 *
 * Удалённые в админке материалы не удаляются из репозитория: в дереве
 * просто не будет их путей, а очистка делается вручную через git.
 */
async function buildTree(env: Env, paths: string[]) {
  if (!env.CONTENT) throw new Error("CONTENT не настроен");
  const { keys } = await env.CONTENT.list({ prefix: "content:item:" });
  const tree: { path: string; mode: string; type: string; content?: string }[] = [];

  for (const key of keys) {
    const raw = await env.CONTENT.get(key.name);
    if (!raw) continue;

    const record = JSON.parse(raw) as {
      slug: string;
      markdown: string;
      section?: string;
      published?: boolean;
    };
    // Черновики на сайт не выходят.
    if (record.published === false) continue;

    const section = record.section || "article";
    if (!paths.includes(`content/${section}`)) continue;
    if (!SLUG_RE.test(record.slug)) continue;

    tree.push({
      path: `content/${section}/${record.slug}.md`,
      mode: "100644",
      type: "blob",
      content: toBase64(record.markdown),
    });
  }

  return tree;
}

export const onRequest = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

  if (request.method !== "POST") return json({ error: "Метод не поддерживается" }, 405);

  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!env.ADMIN_PASSWORD || token !== env.ADMIN_PASSWORD) {
    return json({ error: "Требуется авторизация" }, 401);
  }

  if (!env.GITHUB_TOKEN) {
    return json(
      { error: "GITHUB_TOKEN не настроен — сохраните как черновик и опубликуйте вручную." },
      500,
    );
  }

  let payload: { paths?: string[]; message?: string } = {};
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    // Пустое тело допустимо: публикуем весь контент
  }

  const paths =
    Array.isArray(payload.paths) && payload.paths.length
      ? payload.paths.filter((p) => CONTENT_PATHS.includes(p))
      : CONTENT_PATHS;

  if (!paths.length) return json({ error: "Не выбрано ни одного раздела" }, 400);

  try {
    const tree = await buildTree(env, paths);
    if (!tree.length) return json({ error: "Нет опубликованного контента в выбранных разделах" }, 400);

    const { owner, name } = repo(env);
    const branch = env.GITHUB_BRANCH || "main";

    const commitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${name}/git/commits`,
      {
        method: "POST",
        headers: { ...githubHeaders(env), "Content-Type": "application/json" },
        body: JSON.stringify({
          message: payload.message || "Контент: публикация из админки",
          branch,
          committer: { name: "ШАРиК CMS", email: "cms@sharik-digital.ru" },
          tree,
        }),
      },
    );

    if (!commitResponse.ok) {
      const body = await commitResponse.text().catch(() => "");
      return json({ error: `GitHub отклонил коммит: ${body.slice(0, 300)}` }, 502);
    }

    const commit = (await commitResponse.json()) as { sha: string; html_url?: string };

    // Сборку запускает GitHub Actions: workflow .github/workflows/deploy.yml
    // реагирует на изменение content/ и делает pages deploy.
    // Deploy hooks в Pages неприменимы — они работают только для
    // Git-интеграции, а Direct Upload-проект на неё не переключается.
    return json({
      ok: true,
      commit: commit.sha,
      commitUrl: commit.html_url,
      files: tree.length,
      message:
        "Изменения отправлены в репозиторий. Сборка запустится автоматически, " +
        "через 1–2 минуты обновление будет на сайте.",
    });
  } catch (error) {
    return json({ error: (error as Error).message }, 500);
  }
};
