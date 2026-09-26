/**
 * Раздача изображений из приватного бакета R2 по пути /media/<ключ>.
 *
 * Почему через Function, а не публичный домен R2: r2.dev открывает
 * листинг бакета и даёт домен, который нельзя привязать к своему.
 * Здесь бакет закрыт, наружу торчат только файлы, загруженные из админки.
 *
 * Путь проверяется на отсутствие «..» и ведущего слэша: иначе через
 * ключ можно было бы выйти за пределы префикса.
 */

interface R2Bucket {
  get(key: string): Promise<{
    body: ReadableStream;
    httpMetadata?: { contentType?: string; cacheControl?: string };
    size?: number;
  } | null>;
}

interface Env {
  MEDIA?: R2Bucket;
}

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export const onRequest = async (context: {
  request: Request;
  env: Env;
  params: { path?: string[] };
}) => {
  const { env, params } = context;
  const key = (params.path || []).join("/");

  if (!key || key.includes("..") || key.startsWith("/")) {
    return new Response("Не найдено", { status: 404 });
  }
  if (!env.MEDIA) {
    return new Response("Хранилище не подключено", { status: 503 });
  }

  const object = await env.MEDIA.get(key).catch(() => null);
  if (!object) return new Response("Не найдено", { status: 404 });

  const ext = key.split(".").pop()?.toLowerCase() || "";
  const contentType = object.httpMetadata?.contentType || TYPES[ext] || "application/octet-stream";

  return new Response(object.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": object.httpMetadata?.cacheControl || "public, max-age=31536000, immutable",
      // SVG может содержать скрипт: отдаём его как вложение, а не
      // встраиваемый документ, и запрещаем исполнение.
      ...(ext === "svg"
        ? {
            "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
            "X-Content-Type-Options": "nosniff",
          }
        : { "X-Content-Type-Options": "nosniff" }),
    },
  });
};
