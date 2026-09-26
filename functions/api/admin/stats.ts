/**
 * Сводка аналитики и заявки для админки.
 *
 * Всё считается из фактически накопленных событий в KV. Показывать
 * выдуманные цифры нельзя: если данных мало, дашборд обязан сказать
 * «мало данных», а не рисовать правдоподобные проценты.
 *
 * Читает KV с сервера, а не из консоли Cloudflare: внутри воркера
 * данные консистентны, и это единственный способ получить достоверные
 * агрегаты.
 */

interface KVNamespace {
  get(key: string, type?: "text"): Promise<string | null>;
  list(options?: { prefix?: string; limit?: number }): Promise<{
    keys: { name: string }[];
  }>;
}

interface Env {
  ANALYTICS?: KVNamespace;
  CONTENT?: KVNamespace;
  ADMIN_PASSWORD?: string;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

/** Ключ дневного лога событий. */
function dayKey(date: Date): string {
  return `analytics:log:${date.toISOString().slice(0, 10)}`;
}

interface StoredEvent {
  event: string;
  page: string;
  source: string;
  label?: string;
  sid?: string;
  ts: number;
}

export const onRequest = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  if (request.method !== "GET") return json({ error: "Метод не поддерживается" }, 405);

  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!env.ADMIN_PASSWORD || token !== env.ADMIN_PASSWORD) {
    return json({ error: "Требуется авторизация" }, 401);
  }
  if (!env.ANALYTICS || !env.CONTENT) {
    return json({ error: "ANALYTICS или CONTENT не настроены" }, 500);
  }

  const url = new URL(request.url);
  const days = Math.min(Math.max(Number(url.searchParams.get("days")) || 30, 1), 90);

  const to = Date.now();
  const from = to - days * 86_400_000;

  // Читаем дневные логи за период параллельно: так быстрее, чем по одному.
  const keys: string[] = [];
  for (let i = 0; i < days; i++) keys.push(dayKey(new Date(to - i * 86_400_000)));

  const chunks = await Promise.all(
    keys.map((key) => env.ANALYTICS!.get(key).catch(() => null)),
  );

  const events: StoredEvent[] = [];
  for (const chunk of chunks) {
    if (!chunk) continue;
    for (const line of chunk.split("\n")) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line) as StoredEvent;
        if (parsed.ts >= from && parsed.ts < to) events.push(parsed);
      } catch {

  // --- Счётчики -------------------------------------------------------
  const sessions = new Set<string>();
  const pageViews: Record<string, number> = {};
  const sources: Record<string, number> = {};
  const ctas: Record<string, number> = {};
  const counts: Record<string, number> = {};
  const byDay: Record<string, number> = {};

  for (const e of events) {
    counts[e.event] = (counts[e.event] || 0) + 1;
    if (e.sid) sessions.add(e.sid);

    if (e.event === "page_view") {
      pageViews[e.page] = (pageViews[e.page] || 0) + 1;
      sources[e.source || "direct"] = (sources[e.source || "direct"] || 0) + 1;
      const day = new Date(e.ts).toISOString().slice(0, 10);
      byDay[day] = (byDay[day] || 0) + 1;
    }
    if (e.event === "cta_click" && e.label) ctas[e.label] = (ctas[e.label] || 0) + 1;
  }

  // --- Заявки ---------------------------------------------------------
  const { keys: leadKeys } = await env.CONTENT.list({ prefix: "lead:", limit: 1000 });
  const leadNames = leadKeys
    .map((k) => k.name)
    .sort()
    .reverse()
    .slice(0, 200);
  const leadChunks = await Promise.all(
    leadNames.map((name) => env.CONTENT!.get(name).catch(() => null)),
  );

  const leads: Record<string, unknown>[] = [];
  for (const chunk of leadChunks) {
    if (!chunk) continue;
    try {
      leads.push(JSON.parse(chunk));
    } catch {
      /* пропускаем битую запись */
    }
  }

  const leadsInRange = leads.filter((l) => {
    const ts = Number(l.ts || 0);
    return ts >= from && ts < to;
  });

  // --- Итоги ----------------------------------------------------------
  const visitors = sessions.size;
  const views = counts.page_view || 0;
  const organic = (sources.yandex || 0) + (sources.google || 0);
  const kitViews = Object.entries(pageViews)
    .filter(([page]) => page.includes("kit"))
    .reduce((sum, [, count]) => sum + count, 0);

  const funnel = [
    { step: "Посетители", value: visitors },
    { step: "Просмотры страниц", value: views },
    { step: "Клики по CTA", value: counts.cta_click || 0 },
    { step: "Начали форму", value: counts.form_start || 0 },
    { step: "Отправили заявку", value: leadsInRange.length },
  ];

  return json({
    period: { days, from, to },
    totals: {
      visitors,
      views,
      leads: leadsInRange.length,
      // Конверсия от посетителей, а не от просмотров: так она не
      // завышается из-за перезаходов на другие страницы.
      conversion: visitors ? Number(((leadsInRange.length / visitors) * 100).toFixed(2)) : 0,
      organic,
      organicShare: views ? Number(((organic / views) * 100).toFixed(1)) : 0,
      kitViews,
    },
    counts,
    sources,
    topPages: Object.entries(pageViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([page, count]) => ({ page, count })),
    topCtas: Object.entries(ctas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, count]) => ({ label, count })),
    byDay: Object.entries(byDay)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([day, count]) => ({ day, count })),
    funnel,
    leads: leads.slice(0, 50),
  });
};

        // Одна битая строка не должна ломать всю выгрузку
      }
    }
  }
