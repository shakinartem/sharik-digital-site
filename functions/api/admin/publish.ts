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

// Обращения к GitHub — через общий клиент: он показывает настоящую
// причину отказа, а не угадывает её по коду ответа.
import { githubFetch, githubReadJson } from "../../lib/github";

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
const CONTENT_PATHS = ["content/articles", "content/cases", "content/reviews", "content/faq"];

/** Идентификатор материала: латиница в нижнем регистре, цифры, дефисы. */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Запись в дереве git.
 *
 * `sha: null` означает удаление, `content` — новый файл. Оба варианта
 * нельзя смешивать: GitHub возьмёт содержимое, если оно передано, и
 * удалит файл только при явном null.
 */
interface TreeEntry {
  path: string;
  mode: string;
  type: "blob";
  sha?: string | null;
  content?: string;
}


/**
 * Собирает дерево файлов для коммита из KV.
 *
 * Источник — именно KV, а не репозиторий: правки из админки ещё
 * не закоммичены, и если читать content/ из GitHub, на прод уехал бы
 * старый текст.
 *
 * Дерево строится ПОВЕРХ текущего (base_tree), а не с нуля. Раньше
 * в запрос уходил только список файлов контента, и такой коммит
 * содержал бы ровно их — то есть всё остальное (код, компоненты,
 * конфигурация) исчезло бы из репозитория. Файлы, удалённые в
 * админке, не пропускаются молча, а помечаются `sha: null`: в дереве
 * на базе отсутствие записи означало бы «оставить как есть», и
 * материал возвращался бы в список после следующей загрузки.
 */
async function buildTree(env: Env, paths: string[]) {
  if (!env.CONTENT) throw new Error("CONTENT не настроен");
  const { owner, name } = repo(env);
  const branch = env.GITHUB_BRANCH || "main";
  // 1. Текущий HEAD и его дерево — точка отсчёта для нового.
  //
  //    Чтение идёт через githubReadJson: репозиторий публичный, поэтому
  //    HEAD и дерево доступны и без токена. Раньше здесь стоял прямой
  //    fetch с обязательным Authorization, и из-за этого битый или
  //    лимитированный токен ронял публикацию ДО записи — хотя чтение
  //    он и не выполняет. Теперь чтение не зависит от токена, и если
  //    токен действительно не работает, правдивый отказ придёт на
  //    записи, где он и нужен.
  const ref = await githubReadJson<{ object: { sha: string } }>(
    env,
    `https://api.github.com/repos/${owner}/${name}/git/ref/heads/${encodeURIComponent(branch)}`,
  );
  const headSha = ref.object.sha;

  const tree = await githubReadJson<{
    sha: string;
    truncated?: boolean;
    tree: { path: string; mode: string; type: string; sha: string }[];
  }>(env, `https://api.github.com/repos/${owner}/${name}/git/trees/${headSha}?recursive=1`);
  if (tree.truncated) {
    throw new Error("GitHub отдал неполное дерево репозитория — публикация остановлена");
  }

  // 2. Опубликованные записи из KV: путь файла -> содержимое.
  const { keys } = await env.CONTENT.list({ prefix: "content:item:" });
  const wanted: Record<string, string> = {};

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

    wanted[`content/${section}/${record.slug}.md`] = record.markdown;
  }

  // 3. Новое дерево: чужие файлы сохраняем как есть, наши перезаписываем,
  //    пропавшие из KV удаляем.
  const entries: TreeEntry[] = [];
  const handled: Record<string, boolean> = {};
  let removed = 0;

  for (const node of tree.tree) {
    // Каталоги пропускаем: GitHub создаёт их сам по путям файлов.
    if (node.type !== "blob") continue;

    const dir = node.path.slice(0, node.path.lastIndexOf("/"));
    const isContent = CONTENT_PATHS.indexOf(dir) !== -1;
    const publishesDir = paths.indexOf(dir) !== -1;

    if (!isContent || !publishesDir) {
      // Режим сохраняет executable-бит и любые другие файлы.
      entries.push({ path: node.path, mode: node.mode, type: "blob", sha: node.sha });
      continue;
    }

    handled[node.path] = true;
    if (wanted[node.path] !== undefined) {
      entries.push({
        path: node.path,
        mode: "100644",
        type: "blob",
        content: toBase64(wanted[node.path]),
      });
    } else {
      entries.push({ path: node.path, mode: "100644", type: "blob", sha: null });
      removed++;
    }
  }

  // Новые файлы, которых в репозитории ещё нет.
  for (const path of Object.keys(wanted)) {
    if (handled[path]) continue;
    entries.push({ path, mode: "100644", type: "blob", content: toBase64(wanted[path]) });
  }

  return {
    entries,
    baseTree: tree.sha,
    headSha,
    files: Object.keys(wanted).length,
    removed,
  };
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
    const { entries, baseTree, headSha, files, removed } = await buildTree(env, paths);
    // Пустой раздел publish пропускать нельзя: если в KV ничего не
    // осталось, а в репозитории файл есть, публикация как раз и
    // должна его удалить. Отказ делаем только когда нечего ни
    // записать, ни удалить — тогда запрос действительно пустой.
    if (!files && !removed) {
      return json({ error: "Нет опубликованного контента в выбранных разделах" }, 400);
    }

    const { owner, name } = repo(env);

    // Шаг 1: новое дерево. Коммит ссылается на готовый sha, поэтому
    // содержимое файлов передать в него напрямую нельзя — сначала
    // создаём дерево, затем коммит на его основе.
    //
    // Запись, в отличие от чтения, токена требует по существу: без
    // прав на запись в репозиторий коммит невозможен в принципе.
    const treeResponse = await githubFetch(
      env,
      `https://api.github.com/repos/${owner}/${name}/git/trees`,
      {
        method: "POST",
        body: { base_tree: baseTree, tree: entries },
      },
    );

    const newTree = (await treeResponse.json()) as { sha: string };

    // Шаг 2: коммит. parents обязателен — без него ветка осталась бы
    // без изменений, и новое дерево просто висело бы в репозитории.
    const commitResponse = await githubFetch(
      env,
      `https://api.github.com/repos/${owner}/${name}/git/commits`,
      {
        method: "POST",
        body: {
          message: payload.message || "Контент: публикация из админки",
          tree: newTree.sha,
          parents: [headSha],
          committer: { name: "ШАРиК CMS", email: "cms@sharik-digital.ru" },
        },
      },
    );

    const commit = (await commitResponse.json()) as { sha: string; html_url?: string };

    // Снимок контента в KV устарел: после коммита он содержал бы старые
    // тексты ещё пять минут, и правка выглядела бы как «не сохранилось».
    if (env.CONTENT) {
      await env.CONTENT.delete(`content:snapshot:${env.GITHUB_BRANCH || "main"}`).catch(
        () => null,
      );
    }

    // Сборку запускает GitHub Actions: workflow .github/workflows/deploy.yml
    // реагирует на изменение content/ и делает pages deploy.
    // Deploy hooks в Pages неприменимы — они работают только для
    // Git-интеграции, а Direct Upload-проект на неё не переключается.
    return json({
      ok: true,
      commit: commit.sha,
      commitUrl: commit.html_url,
      files,
      removed,
      message:
        "Изменения отправлены в репозиторий. Сборка запустится автоматически, " +
        "через 1–2 минуты обновление будет на сайте.",
    });
  } catch (error) {
    return json({ error: (error as Error).message }, 500);
  }
};
