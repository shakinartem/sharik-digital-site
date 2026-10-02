/**
 * Загрузка изображений.
 *
 * Файл кладётся в public/media/ репозитория через GitHub API, и уже
 * существующий конвейер (коммит -> GitHub Actions -> деплой) выкладывает
 * его на сайт. Отдельное объектное хранилище не требуется: фото
 * версионируются вместе с контентом, поэтому откат статьи откатывает и
 * её картинку.
 *
 * Ограничения жёсткие: без них в репозиторий попадёт что угодно.
 */

// Ошибки GitHub разбирает общий клиент: он отдаёт настоящую причину
// отказа вместо обрезка невнятного тела ответа.
import { githubFetch } from "../../lib/github";

interface Env {
  ADMIN_PASSWORD?: string;
  GITHUB_TOKEN?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 МБ

/**
 * Разрешённые типы. Список закрыт: имя файла приходит от клиента,
 * доверять ему нельзя — сверяем MIME-тип заголовка.
 */
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

/** Случайное имя: исходное не используем, чтобы исключить обход пути. */
function safeName(mime: string): string {
  const ext = ALLOWED[mime];
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes)
    .map((b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 12);
  return `${Date.now()}-${suffix}.${ext}`;
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const CHUNK = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const part = bytes.subarray(i, i + CHUNK);
    for (let j = 0; j < part.length; j++) binary += String.fromCharCode(part[j]);
  }
  return btoa(binary);
}

export const onRequest = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  if (request.method !== "POST") return json({ error: "Метод не поддерживается" }, 405);

  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!env.ADMIN_PASSWORD || token !== env.ADMIN_PASSWORD) {
    return json({ error: "Требуется авторизация" }, 401);
  }

  const [owner, name] = env.GITHUB_REPO?.split("/") || [];
  if (!env.GITHUB_TOKEN || !owner || !name) {
    return json({ error: "Не настроен доступ к репозиторию" }, 500);
  }
  const branch = env.GITHUB_BRANCH || "main";

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return json({ error: "Файл не получен" }, 400);

  const mime = file.type.toLowerCase();
  if (!ALLOWED[mime]) {
    return json(
      {
        error: `Формат ${mime || "неизвестен"} не поддерживается. Допустимы: JPG, PNG, WebP, GIF, SVG`,
      },
      400,
    );
  }
  if (file.size > MAX_BYTES) return json({ error: "Файл больше 5 МБ" }, 413);

  const fileName = safeName(mime);
  const body = await file.arrayBuffer();

  try {
    // Contents API принимает содержимое файла — для картинок это base64.
    //
    // Отказ не проглатывается: githubFetch уже превратил его в текст с
    // настоящей причиной (недействительный токен, нет прав, лимит), и
    // терять её здесь значило бы вернуть в админку обрезок тела ответа
    // вместо объяснения. Ловим только чтобы отдать 502 с этим текстом:
    // необработанная ошибка уехала бы в 500 без тела, и редактор увидел
    // бы пустое сообщение.
    await githubFetch(
      env,
      `https://api.github.com/repos/${owner}/${name}/contents/public/media/${fileName}`,
      {
        method: "PUT",
        body: {
          message: `Медиатека: ${fileName}`,
          branch,
          committer: { name: "ШАРиК CMS", email: "cms@sharik-digital.ru" },
          content: toBase64(body),
        },
      },
    );
  } catch (error) {
    return json({ error: (error as Error).message }, 502);
  }

  return json({
    ok: true,
    // public/media превращается в /media на сайте.
    url: `/media/${fileName}`,
    size: file.size,
    type: mime,
    message: "Файл загружен. Сайт обновится в течение 1–2 минут.",
  });
};
