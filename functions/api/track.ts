/**
 * Приём аналитических событий.
 *
 * События складываются в KV в ключ analytics:log и уходят в лог
 * платформы. Схема хранения намеренно простая: цель — видеть цепочку
 * «источник → статья → CTA», а не строить полноценную систему
 * метрик. Если событий станет много, логи можно выгрузить в ClickHouse
 * или BigQuery одной командой.
 *
 * Ответ всегда 204 без тела: чтобы не тормозить навигацию и не
 * подсказывать боту, что здесь что-то принимают.
 */

/**
 * Минимальное описание интерфейса KV.
 *
 * Объявлено локально, чтобы не тянуть @cloudflare/workers-types ради
 * одного типа: это единственная зависимость, которая нужна функции,
 * и в рантайм она ничего не добавляет.
 */
interface KVNamespace {
  /** overload: type в аргументе, типизированный литералом */
  get(key: string, options: { type: "json" }): Promise<unknown>;
  get(key: string, type?: "text"): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
}

interface Event {
  event?: string;
  page?: string;
  source?: string;
  ts?: number;
  [key: string]: unknown;
}

const ALLOWED = new Set([
  "page_view",
  "cta_click",
  "form_start",
  "form_submit",
  "calculator_start",
  "calculator_complete",
  "article_scroll",
  "article_cta",
]);

const MAX_TEXT = 200;
const MAX_BATCH_PER_MINUTE = 120;

export const onRequest = async (context: {
  request: Request;
  env: {
    ANALYTICS?: KVNamespace;
    ADMIN_CHAT_ID?: string;
    BOT_TOKEN?: string;
  };
}) => {
  const { request, env } = context;
  const noContent = new Response(null, { status: 204 });

  if (request.method !== "POST") {
    return new Response(null, { status: 405 });
  }

  let payload: Event;
  try {
    payload = (await request.json()) as Event;
  } catch {
    return new Response(null, { status: 400 });
  }

  // Список событий закрыт: иначе через эту точку можно засорять лог
  // чем угодно из-вне.
  const name = String(payload.event || "");
  if (!ALLOWED.has(name)) return noContent;

  const event = {
    event: name,
    page: String(payload.page || "").slice(0, MAX_TEXT),
    source: String(payload.source || "direct").slice(0, MAX_TEXT),
    label: payload.label ? String(payload.label).slice(0, MAX_TEXT) : undefined,
    referrer: payload.referrer ? String(payload.referrer).slice(0, MAX_TEXT) : undefined,
    percent: payload.percent,
    ts: Date.now(),
  };

  // Простейшая защита от флуда: не больше событий в минуту на ключ
  const ip =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("x-forwarded-for") ||
    "unknown";
  const rateKey = `analytics:rate:${ip}`;
  const now = Date.now();

  if (env.ANALYTICS) {
    try {
      const rate = (await env.ANALYTICS.get(rateKey, { type: "json" })) as {
        count?: number;
        at?: number;
      } | null;
      const count = typeof rate?.count === "number" ? rate.count : 0;
      const at = typeof rate?.at === "number" ? rate.at : 0;

      if (now - at < 60_000 && count >= MAX_BATCH_PER_MINUTE) {
        return noContent;
      }
      const nextCount = now - at < 60_000 ? count + 1 : 1;
      await env.ANALYTICS.put(rateKey, JSON.stringify({ count: nextCount, at: now }), {
        expirationTtl: 120,
      });

      // Пишем по дню, чтобы записи не смешивались
      const day = new Date(now).toISOString().slice(0, 10);
      const key = `analytics:log:${day}`;
      const existing = (await env.ANALYTICS.get(key)) || "";
      await env.ANALYTICS.put(key, `${existing}${JSON.stringify(event)}\n`, {
        expirationTtl: 60 * 60 * 24 * 90, // храним 90 дней
      });
    } catch (error) {
      // Ошибка записи не должна ломать страницу — логируем и идём дальше
      console.error("analytics write failed:", error);
    }
  } else {
    // Без KV события всё равно видны в логах платформы
    console.log("analytics:", JSON.stringify(event));
  }

  return noContent;
};
