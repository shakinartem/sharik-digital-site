/**
 * Загрузка изображений в R2.
 *
 * Файлы кладутся в приватный бакет и отдаются через /media/<путь>.
 * Публичный домен r2.dev намеренно не используется: он даёт открытый
 * листинг всего бакета и домен вида r2.dev, который нельзя переименовать.
 * Раздача идёт через Pages Function — бакет остаётся закрытым.
 *
 * Ограничения заданы жёстко: без них можно залить в бакет что угодно
 * и занять его чужими файлами.
 */

/** Минимальный интерфейс R2 без внешних зависимостей. */
interface R2Bucket {
  put(key: string, value: ArrayBuffer, options?: {
    httpMetadata?: { contentType?: string; cacheControl?: string };
  }): Promise<unknown>;
}

interface Env {
  MEDIA?: R2Bucket;
  ADMIN_PASSWORD?: string;
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 МБ

/**
 * Разрешённые типы. Список закрыт: по расширению определять тип нельзя,
 * клиент присылает имя файла, которому ничего нельзя верить.
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

/** Случайное имя: исходное имя файла не используем, чтобы исключить обход пути. */
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

export const onRequest = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  if (request.method !== "POST") return json({ error: "Метод не поддерживается" }, 405);

  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!env.ADMIN_PASSWORD || token !== env.ADMIN_PASSWORD) {
    return json({ error: "Требуется авторизация" }, 401);
  }

  if (!env.MEDIA) {
    return json(
      {
        error:
          "Хранилище не подключено. Создайте бакет R2 и добавьте привязку MEDIA в wrangler.toml.",
      },
      500,
    );
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return json({ error: "Файл не получен" }, 400);

  const mime = file.type.toLowerCase();
  if (!ALLOWED[mime]) {
    return json(
      { error: `Формат ${mime || "неизвестен"} не поддерживается. Допустимы: JPG, PNG, WebP, GIF, SVG` },
      400,
    );
  }
  if (file.size > MAX_BYTES) {
    return json({ error: "Файл больше 5 МБ" }, 413);
  }

  const key = safeName(mime);
  const body = await file.arrayBuffer();

  await env.MEDIA.put(key, body, {
    httpMetadata: {
      contentType: mime,
      // Имена уникальны и не перезаписываются, поэтому кэш надолгий.
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  return json({
    ok: true,
    key,
    // Путь для вставки в markdown и в поле photo.
    url: `/media/${key}`,
    size: file.size,
    type: mime,
  });
};
