/**
 * Лёгкий трекер событий без внешних зависимостей.
 *
 * Раньше здесь стоял только свой трекер, а Яндекс.Метрика была
 * отвергнута по весу. Сейчас счётчик тоже подключён (components/
 * MetricaCounter.tsx), но роли у систем разные: Метрика даёт вебвизор,
 * кликовую карту и источники, а своя аналитика отвечает на вопрос
 * «что работает» точнее и остаётся, если внешний сервис недоступен.
 *
 * События уходят в /api/track через sendBeacon: он не блокирует
 * переход и не отменяется, если пользователь уходит со страницы.
 */

export type EventName =
  | "page_view"
  | "cta_click"
  | "form_start"
  | "form_submit"
  | "calculator_start"
  | "calculator_complete"
  | "article_scroll"
  | "article_cta"
  | "article_view"
  | "case_view"
  | "seller_view"
  | "clinic_view"
  | "kit_view"
  | "phone_click"
  | "telegram_click"
  | "email_click";

type Payload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    __sharikTrack?: (name: EventName, payload?: Payload) => void;
  }
}

const ENDPOINT = "/api/track";

/**
 * Анонимный идентификатор сессии.
 *
 * Живёт в sessionStorage: обнуляется при закрытии вкладки и не
 * связывает человека между визитами. Персональных данных и полного
 * IP не храним — этого достаточно, чтобы считать посетителей, а не
 * людей.
 */
function sessionId(): string {
  if (typeof window === "undefined") return "server";
  const KEY = "sharik_sid";
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

/** UTM-метки текущего визита. Запоминаются один раз на сессию. */
function utm(): Record<string, string> {
  const KEY = "sharik_utm";
  if (typeof window === "undefined") return {};

  const saved = sessionStorage.getItem(KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as Record<string, string>;
    } catch {
      /* повреждённое значение просто перезапишем ниже */
    }
  }

  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const value = params.get(key);
    if (value) out[key] = value.slice(0, 100);
  }
  // Пустой объект тоже запоминаем: метки не должны «прилипать» к
  // следующим страницам внутри одной сессии.
  sessionStorage.setItem(KEY, JSON.stringify(out));
  return out;
}

/** Определяем, откуда пришёл пользователь: поиск, соцсеть или переход. */
function detectSource(): string {
  if (typeof document === "undefined") return "direct";
  const ref = document.referrer;
  if (!ref) return "direct";
  try {
    const host = new URL(ref).hostname;
    if (host.includes("yandex")) return "yandex";
    if (host.includes("google")) return "google";
    if (host.includes("t.me") || host.includes("telegram")) return "telegram";
    if (host.includes("vk")) return "vk";
    if (host.includes("dzen")) return "dzen";
    return "other";
  } catch {
    return "other";
  }
}

export function track(name: EventName, payload: Payload = {}) {
  if (typeof window === "undefined") return;

  const body = JSON.stringify({
    event: name,
    page: window.location.pathname,
    source: detectSource(),
    // Идентификатор сессии и UTM нужны, чтобы считать посетителей,
    // а не просмотры, и связывать источник трафика с заявкой.
    sid: sessionId(),
    utm: utm(),
    ts: Date.now(),
    ...payload,
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
    } else {
      // Fallback для старых браузеров
      fetch(ENDPOINT, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Аналитика не должна ломать страницу ни при каких условиях
  }
}

const CTA_LABELS: Record<string, string> = {
  "Рассчитать потенциал": "seller_potential",
  "Помочь с запуском": "kit_launch_help",
  "Оценить объём работ": "kit_estimate",
  "Получить точный расчёт": "kit_exact_estimate",
  "Пройти пред-аудит": "clinic_audit",
  "Получить расчёт": "get_quote",
  "Получить Seller Growth Report": "seller_report",
  "Запустить KIT": "kit_start",
  "Рассчитать мой потенциал": "seller_calc",
  "Задать вопрос": "question",
  "Начать с диагностики": "diagnostic",
};

/**
 * Глобальный слушатель: один раз на страницу ловит все клики по
 * ссылкам и кнопкам. Не нужно размечать каждую кнопку вручную —
 * при добавлении нового CTA аналитика подхватит его сама.
 */
export function initAnalytics() {
  if (typeof window === "undefined") return;
  if (window.__sharikTrack) return;
  window.__sharikTrack = track;

  // 1. Просмотр страницы
  track("page_view");

  // 2. Клик по любой ссылке с известным текстом — считаем как CTA
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!link) return;
      const text = (link.textContent || "").trim();
      const href = link.getAttribute("href") || "";

      const label = CTA_LABELS[text];
      if (label) {
        track("cta_click", { label, text, href });
        return;
      }
      // Внутренние переходы — считаем интерес к навигации
      if (href.startsWith("/") && !href.startsWith("//")) {
        track("cta_click", { label: "internal_link", href });
      }
    },
    { passive: true },
  );
}

/** Скользящий процент чтения статьи: 50% и 90%. */
export function initArticleScroll() {
  if (typeof window === "undefined") return;
  const sent = new Set<number>();
  const onScroll = () => {
    const doc = document.documentElement;
    const total = doc.scrollHeight - window.innerHeight;
    if (total <= 0) return;
    const percent = Math.round((window.scrollY / total) * 100);
    for (const mark of [50, 90]) {
      if (percent >= mark && !sent.has(mark)) {
        sent.add(mark);
        track("article_scroll", { percent: mark });
      }
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
}