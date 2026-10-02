"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SimpleEditor, { type SimpleItem } from "@/components/admin/SimpleEditor";
import Dashboard from "@/components/admin/Dashboard";
import EnvCheck from "@/components/admin/EnvCheck";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { groupItems, itemSubtitle, siteUrl } from "@/lib/adminPages";

type Category = "yandex-kit" | "patients" | "economy";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "yandex-kit", label: "Яндекс KIT" },
  { value: "patients", label: "Пациентопоток" },
  { value: "economy", label: "Экономика канала" },
];

type Article = {
  slug: string;
  title: string;
  markdown: string;
  updatedAt?: string;
  published: boolean;
  draft: boolean;
};

/**
 * Собирает готовый markdown-файл статьи из полей формы.
 *
 * Списки пишем блочным YAML, а не в одну строку: «1,5 млн» в inline
 * списке распалось бы на «1» и «5 млн» при чтении обратно.
 */
function list(value: string) {
  const items = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length ? `\n${items.map((s) => `  - ${s}`).join("\n")}` : "[]";
}

function buildMarkdown(input: typeof EMPTY): string {
  return [
    "---",
    `slug: ${input.slug}`,
    `title: ${input.title}`,
    `description: ${input.description}`,
    `seoTitle: ${input.seoTitle || input.title}`,
    `category: ${input.category}`,
    `tags:${list(input.tags)}`,
    `date: ${input.date}`,
    "cta:",
    `  title: ${input.ctaTitle}`,
    `  text: ${input.ctaText}`,
    `  href: ${input.ctaHref}`,
    `  label: ${input.ctaLabel}`,
    `related:${list(input.related)}`,
    "---",
    "",
    input.body.trim(),
    "",
  ].join("\n");
}

/**
 * Разбирает markdown обратно в поля формы.
 *
 * Поддерживает и блочный YAML, и старый inline-вид `[a, b]`:
 * в репозитории остались файлы, записанные до смены формата.
 */
function parseMarkdown(markdown: string) {
  const value = (key: string) => {
    const match = markdown.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
    return match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
  };

  const list = (key: string) => {
    const block = markdown.match(
      new RegExp(`^${key}:\\s*\\n((?:\\s*-\\s+.*\\n?)+)`, "m"),
    );
    if (block) {
      return block[1]
        .split(/\r?\n/)
        .map((l) => l.replace(/^\s*-\s+/, "").trim())
        .filter(Boolean)
        .join(", ");
    }
    const inline = markdown.match(new RegExp(`^${key}:\\s*\\[(.*)\\]$`, "m"));
    if (!inline) return "";
    return inline[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");
  };

  // Поля cta лежат с отступом — ищем по пробелу, а не по началу строки
  const nested = (key: string) => {
    const match = markdown.match(new RegExp(`^\\s{2}${key}:\\s*(.*)$`, "m"));
    return match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
  };

  const category = value("category") as Category;

  return {
    slug: value("slug"),
    title: value("title"),
    description: value("description"),
    seoTitle: value("seoTitle"),
    category: CATEGORIES.some((c) => c.value === category) ? category : "yandex-kit",
    tags: list("tags"),
    date: value("date"),
    ctaTitle: nested("title"),
    ctaText: nested("text"),
    ctaHref: nested("href"),
    ctaLabel: nested("label"),
    related: list("related"),
    body: markdown.replace(/^---[\s\S]*?\n---\n?/, ""),
  };
}

const EMPTY = {
  slug: "",
  title: "",
  description: "",
  seoTitle: "",
  category: "yandex-kit" as Category,
  tags: "",
  date: new Date().toISOString().slice(0, 10),
  ctaTitle: "Помочь с запуском",
  ctaText: "Разберём вашу ситуацию и покажем, с чего начать.",
  ctaHref: "/sellers",
  ctaLabel: "Обсудить задачу",
  related: "",
  body: "",
};

const BLOCK_HELP: [string, string][] = [
  ["Абзац", "просто текст, пустая строка отделяет абзацы"],
  ["Фото", "![описание](/cases/photo.webp) — отдельной строкой"],
  ["Подпись к фото", "caption: текст подписи сразу после фото"],
  ["Жирный и курсив", "**жирный** и *курсив* прямо в тексте"],
  ["Ссылка", "[текст ссылки](https://example.com) в абзаце"],
  ["Заголовок H2", "## Текст — попадёт в оглавление статьи"],
  ["Заголовок H3", "### Текст"],
  ["Список", "- пункт   или   1. пункт"],
  ["Выноска", ':::note title="Заголовок"  (или :::warn, :::tip) + текст + :::'],
  ["Таблица", "| Колонка | Колонка | , | --- | --- | , | значение | значение |"],
];


export default function AdminPage() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  // Дашборд стоит первым: после входа человек должен сразу увидеть
  // заявки и аналитику, а не форму редактора.
  const [tab, setTab] = useState<"dashboard" | "articles" | "case" | "review" | "faq">("dashboard");
  const [caseItems, setCaseItems] = useState<SimpleItem[]>([]);
  const [reviewItems, setReviewItems] = useState<SimpleItem[]>([]);
  const [faqItems, setFaqItems] = useState<SimpleItem[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  /** Выбранная страница в фильтре списка статей. */
  const [articleFilter, setArticleFilter] = useState("all");
  /** Ошибка чтения контента из репозитория: показывается баннером. */
  const [repoError, setRepoError] = useState<string | null>(null);
  /** Позиция курсора в тексте статьи на момент выбора файла. */
  const caretRef = useRef(0);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [lastImage, setLastImage] = useState("");

  /**
   * Вставка загруженного фото в текст статьи.
   *
   * Формат строки — ровно тот, который читает генератор:
   * `![описание](путь)` отдельной строкой, подпись — следующей строкой
   * с `caption:`. Ручной вставкой такой строки пользуются единицы, а
   * здесь фото вставляется само и сразу в правильном месте.
   */
  function insertImage(url: string, caret: number) {
    const alt = imageAlt.trim() || "Фото";
    const caption = imageCaption.trim();
    const block = `![${alt}](${url})\n${caption ? `caption: ${caption}\n` : ""}`;
    const text = form.body;
    const at = Math.max(0, Math.min(caret, text.length));
    // Хвост перед вставкой подрезается, иначе картинка может попасть
    // в середину строки и не распознаться как отдельный блок.
    const head = text.slice(0, at).replace(/\s+$/, "");
    set("body", `${head}\n\n${block}\n${text.slice(at)}`);
    setStatus({ kind: "ok", text: "Фото добавлено в текст статьи." });
  }

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /**
   * Стабильная ссылка на обработчик ошибок.
   *
   * Обязательно через useCallback: если передать inline-стрелку, она
   * пересоздаётся при каждом рендере, меняет зависимости useEffect
   * внутри дашборда, тот вызывает setState — и эффект зацикливается,
   * отправляя бесконечный поток запросов статистики.
   */
  const handleError = useCallback((message: string) => {
    setStatus({ kind: "error", text: message });
  }, []);

  const authedRequest = useCallback((authToken: string) => {
    return fetch("/api/admin/articles", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
  }, []);

  const load = useCallback(
    async (authToken: string) => {
      const response = await authedRequest(authToken);
      if (!response.ok) throw new Error("Не удалось загрузить статьи");
      const data = (await response.json()) as {
        articles: (Article & { section?: string })[];
        repo?: { ok: boolean; error?: string; count?: number };
      };
      // Молчаливый пустой список опаснее пустого списка с причиной:
      // без баннера «Отзывы (0)» выглядит как «отзывов нет», хотя
      // сервер не смог прочитать репозиторий.
      setRepoError(
        data.repo && data.repo.ok === false
          ? data.repo.error || "Не удалось прочитать контент из репозитория"
          : null,
      );
      // Раздел приходит из API: без него не понять, статья это,
      // кейс или отзыв — все три лежат в одном списке.
      setArticles(data.articles.filter((a) => !a.section || a.section === "article"));
      setCaseItems(data.articles.filter((a) => a.section === "case") as SimpleItem[]);
      setReviewItems(data.articles.filter((a) => a.section === "review") as SimpleItem[]);
      setFaqItems(data.articles.filter((a) => a.section === "faq") as SimpleItem[]);
      return data.articles;
    },
    [authedRequest],
  );

  const openArticle = useCallback((list: Article[], slug: string) => {
    const article = list.find((a) => a.slug === slug);
    if (!article) return;
    setCurrent(slug);
    setForm({ ...EMPTY, ...parseMarkdown(article.markdown) });
    setStatus(null);
  }, []);

  function login(event: React.FormEvent) {
    event.preventDefault();
    authedRequest(token)
      .then((response) => {
        if (!response.ok) throw new Error("Неверный пароль");
        setAuthed(true);
        sessionStorage.setItem("sharik_admin", token);
        return load(token);
      })
      .then((list) => {
        if (list.length) openArticle(list, list[0].slug);
      })
      .catch((error: Error) => setStatus({ kind: "error", text: error.message }));
  }

  // Восстанавливаем сессию: пароль живёт в sessionStorage, а не в
  // localStorage, чтобы вместе с вкладкой закрылся и доступ.
  useEffect(() => {
    const saved = sessionStorage.getItem("sharik_admin");
    if (!saved) return;
    setToken(saved);
    authedRequest(saved)
      .then((response) => {
        if (!response.ok) throw new Error("Сессия истекла");
        setAuthed(true);
        return load(saved);
      })
      .then((list) => {
        if (list.length) openArticle(list, list[0].slug);
      })
      .catch(() => {
        sessionStorage.removeItem("sharik_admin");
        setAuthed(false);
      });
  }, [authedRequest, load, openArticle]);

  function newArticle() {
    setCurrent(null);
    setForm({ ...EMPTY, slug: "novaya-statya", title: "Новая статья" });
    setStatus(null);
  }

  async function save(published: boolean) {
    setBusy(true);
    setStatus(null);
    const markdown = buildMarkdown(form);
    try {
      const response = await fetch("/api/admin/articles?slug=" + encodeURIComponent(form.slug), {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slug: form.slug, markdown, published, draft: !published }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Ошибка сохранения");
      await load(token);
      setCurrent(form.slug);
      setStatus({
        kind: "ok",
        text: published
          ? "Опубликовано. Страница появится на сайте после деплоя."
          : "Черновик сохранён.",
      });
    } catch (error) {
      setStatus({ kind: "error", text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  /**
   * Публикация: коммит в репозиторий и запуск сборки.
   *
   * Вынесено отдельно от save(), потому что это разные шаги с разными
   * последствиями: save() — мгновенный черновик в KV, publish() —
   * изменение на боевом сайте. Смешивать их в одной кнопке нельзя:
   * недописанный материал не должен уезжать на прод.
   */
  async function publish(paths: string[]) {
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paths }),
      });
      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) throw new Error(data.error || "Не удалось опубликовать");
      setStatus({ kind: "ok", text: data.message || "Опубликовано" });
    } catch (error) {
      setStatus({ kind: "error", text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  /** Сохранить черновик и сразу отправить на сайт. */
  async function saveAndPublish(published: boolean, paths: string[]) {
    await save(published);
    if (published) await publish(paths);
  }

  async function remove() {
    if (!current) return;
    if (!confirm(`Удалить статью «${form.title || current}»?`)) return;
    setBusy(true);
    try {
      const response = await fetch(
        "/api/admin/articles?slug=" + encodeURIComponent(current) + "&section=article",
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) throw new Error("Ошибка удаления");
      const list = await load(token);
      setStatus({ kind: "ok", text: "Статья удалена." });
      if (list.length) openArticle(list, list[0].slug);
      else newArticle();
    } catch (error) {
      setStatus({ kind: "error", text: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const charCount = form.body.length;
  const readMinutes = useMemo(() => Math.max(1, Math.round(charCount / 900)), [charCount]);


  if (!authed) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <h1 className="text-2xl font-bold">ШАРиК digital</h1>
        <p className="mt-2 text-neutral-600">Редактор статей</p>
        <form onSubmit={login} className="mt-8 space-y-4">
          <label className="block text-sm font-medium" htmlFor="password">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            autoFocus
          />
          {status?.kind === "error" && <p className="text-sm text-red-600">{status.text}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-neutral-900 px-4 py-2 font-medium text-white"
          >
            Войти
          </button>
        </form>
      </main>
    );
  }

  const field = "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm";
  const label = "mb-1 block text-sm font-medium text-neutral-700";
  const chip = "rounded-full border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100";
  const chipActive = "rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white";

  /**
   * Статьи, разложенные по страницам.
   *
   * Категория статьи — это и есть страница, на которой она живёт:
   * «Яндекс KIT» идёт в хаб /blog/yandex-kit, «Пациентопоток» — в
   * блог о клиниках, «Экономика канала» — к материалам про
   * продавцов. Группировка и фильтр берутся из одного списка, поэтому
   * счётчики рядом с чипами всегда совпадают с тем, что показано.
   */
  const articleGroups = groupItems("article", articles);
  const visibleArticleGroups =
    articleFilter === "all"
      ? articleGroups
      : articleGroups.filter((group) => group.key === articleFilter);


  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ШАРиК digital</h1>
          <p className="text-sm text-neutral-600">
            Аналитика, заявки и контент сайта в одном месте.
          </p>
        </div>
        {tab === "articles" && (
          <button
            onClick={newArticle}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium"
          >
            + Новая статья
          </button>
        )}
      </header>

      <div>
        {/* Баннер ошибки чтения репозитория. Без него список может
            показать ноль статей или отзывов, хотя на сайте они есть:
            список молчал бы об ошибке, и человек решил бы, что
            контента нет. */}
        {repoError && (
          <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Контент из репозитория не загрузился: {repoError}. Показаны только записи,
            сохранённые в админке. Проверьте состояние токена кнопкой «Проверить окружение».
          </p>
        )}

        {/* Проверка окружения стоит над вкладками, а не внутри одной из
            них: отказ публикации случается на любой вкладке, где есть
            кнопка «Опубликовать». */}
        <EnvCheck token={token} />

        <div className="mb-6 flex flex-wrap gap-2 border-b border-neutral-200">
          {(
            [
              ["dashboard", "Дашборд"],
              ["articles", `Статьи (${articles.length})`],
              ["case", `Кейсы (${caseItems.length})`],
              ["review", `Отзывы (${reviewItems.length})`],
              ["faq", `FAQ (${faqItems.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={
                "rounded-t-lg px-4 py-2 text-sm font-medium " +
                (tab === key
                  ? "border border-b-0 border-neutral-200 bg-white"
                  : "text-neutral-500 hover:text-neutral-800")
              }
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "dashboard" ? (
          <Dashboard token={token} onError={handleError} />
        ) : tab === "articles" ? (
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Статьи ({articles.length})
          </h2>

          {/* Фильтр по страницам: категория статьи и есть страница,
              на которой она живёт (Яндекс KIT, пациентопоток,
              экономика канала). */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setArticleFilter("all")}
              className={
                articleFilter === "all" ? chipActive : chip
              }
            >
              Все ({articles.length})
            </button>
            {articleGroups.map((group) => (
              <button
                key={group.key}
                type="button"
                onClick={() => setArticleFilter(group.key)}
                className={articleFilter === group.key ? chipActive : chip}
              >
                {group.label} ({group.items.length})
              </button>
            ))}
          </div>

          {visibleArticleGroups.length === 0 && (
            <p className="text-sm text-neutral-500">В этой группе пока пусто.</p>
          )}

          {visibleArticleGroups.map((group) => (
            <div key={group.key} className="mb-4">
              {visibleArticleGroups.length > 1 && (
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {group.label}
                </p>
              )}
              <ul className="space-y-1">
                {group.items.map((article) => (
                  <li key={article.slug}>
                    <button
                      onClick={() => openArticle(articles, article.slug)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                        current === article.slug
                          ? "bg-neutral-900 text-white"
                          : "hover:bg-neutral-100"
                      }`}
                    >
                      <span className="block truncate font-medium">
                        {article.title || article.slug}
                      </span>
                      <span
                        className={`text-xs ${
                          current === article.slug
                            ? "text-neutral-300"
                            : "text-neutral-500"
                        }`}
                      >
                        {itemSubtitle("article", article.markdown)}
                        {article.draft ? " · черновик" : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        <section className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={label} htmlFor="slug">
                Slug (адрес страницы)
              </label>
              <input
                id="slug"
                className={field}
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="kak-sozdat-magazin"
              />
            </div>
            <div>
              <label className={label} htmlFor="date">
                Дата
              </label>
              <input
                id="date"
                type="date"
                className={field}
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={label} htmlFor="title">
              Заголовок
            </label>
            <input
              id="title"
              className={field}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div>
            <label className={label} htmlFor="description">
              Описание для поисковой выдачи
            </label>
            <textarea
              id="description"
              rows={2}
              className={field}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
            <p className="mt-1 text-xs text-neutral-500">
              {form.description.length} символов · оптимально до 160
            </p>
          </div>

          <div>
            <label className={label} htmlFor="seoTitle">
              SEO-заголовок
            </label>
            <input
              id="seoTitle"
              className={field}
              value={form.seoTitle}
              onChange={(e) => set("seoTitle", e.target.value)}
              placeholder="Если пусто — подставится заголовок"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className={label} htmlFor="category">
                Категория
              </label>
              <select
                id="category"
                className={field}
                value={form.category}
                onChange={(e) => set("category", e.target.value as Category)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={label} htmlFor="tags">
                Теги через запятую
              </label>
              <input
                id="tags"
                className={field}
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
              />
            </div>
          </div>

          <fieldset className="space-y-4 rounded-lg border border-neutral-200 p-4">
            <legend className="px-2 text-sm font-semibold">Блок заявки под статьёй</legend>
            <div>
              <label className={label} htmlFor="ctaTitle">
                Заголовок
              </label>
              <input
                id="ctaTitle"
                className={field}
                value={form.ctaTitle}
                onChange={(e) => set("ctaTitle", e.target.value)}
              />
            </div>
            <div>
              <label className={label} htmlFor="ctaText">
                Текст
              </label>
              <input
                id="ctaText"
                className={field}
                value={form.ctaText}
                onChange={(e) => set("ctaText", e.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={label} htmlFor="ctaHref">
                  Ссылка
                </label>
                <input
                  id="ctaHref"
                  className={field}
                  value={form.ctaHref}
                  onChange={(e) => set("ctaHref", e.target.value)}
                />
              </div>
              <div>
                <label className={label} htmlFor="ctaLabel">
                  Надпись на кнопке
                </label>
                <input
                  id="ctaLabel"
                  className={field}
                  value={form.ctaLabel}
                  onChange={(e) => set("ctaLabel", e.target.value)}
                />
              </div>
            </div>
          </fieldset>

          <div>
            <label className={label} htmlFor="related">
              Связанные статьи (slug через запятую)
            </label>
            <input
              id="related"
              className={field}
              value={form.related}
              onChange={(e) => set("related", e.target.value)}
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className={label} htmlFor="body">
                Текст статьи
              </label>
              <button
                type="button"
                onClick={() => setShowHelp((v) => !v)}
                className="text-xs text-neutral-500 underline"
              >
                {showHelp ? "Скрыть" : "Как форматировать"}
              </button>
            </div>
            {showHelp && (
              <dl className="mb-2 space-y-1 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600">
                {BLOCK_HELP.map(([name, syntax]) => (
                  <div key={name} className="flex gap-2">
                    <dt className="w-28 shrink-0 font-medium text-neutral-800">{name}</dt>
                    <dd className="font-mono">{syntax}</dd>
                  </div>
                ))}
              </dl>
            )}
            {/* Фото внутри статьи. Строка ![описание](путь) —
                единственный формат, который читает генератор, и
                вставлять его вручную неудобно: путь появляется только
                после загрузки файла. */}
            <div className="rounded-xl border border-neutral-200 p-4">
              <p className="text-sm font-semibold text-neutral-800">Фото в тексте статьи</p>
              <p className="mb-3 text-xs text-neutral-500">
                Поставьте курсор в текст там, где должна быть картинка, и загрузите файл —
                строка вставится сама. Файл уходит в репозиторий и появляется на сайте
                после публикации.
              </p>
              <div className="mb-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={label} htmlFor="img-alt">
                    Описание фото — для alt
                  </label>
                  <input
                    id="img-alt"
                    className={field}
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Карточка товара в кабинете"
                  />
                </div>
                <div>
                  <label className={label} htmlFor="img-cap">
                    Подпись под фото — необязательно
                  </label>
                  <input
                    id="img-cap"
                    className={field}
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="Так товар выглядит у клиента"
                  />
                </div>
              </div>
              <ImageUpload
                token={token}
                id="article-image"
                label="Загрузить фото в статью"
                value={lastImage}
                onChange={setLastImage}
                onBeforeUpload={() => {
                  caretRef.current = bodyRef.current?.selectionStart ?? form.body.length;
                }}
                onUploaded={(url) => insertImage(url, caretRef.current)}
                hint="JPG, PNG, WebP, GIF или SVG до 5 МБ."
              />
            </div>

            <textarea
              id="body"
              ref={bodyRef}
              rows={24}
              className={`${field} font-mono leading-relaxed`}
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
            />
            <p className="mt-1 text-xs text-neutral-500">
              {charCount} символов · примерно {readMinutes} мин чтения
            </p>
          </div>

          {status && (
            <p
              className={`rounded-lg px-4 py-2 text-sm ${
                status.kind === "ok"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {status.text}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-4">
            <button
              onClick={() => saveAndPublish(true, ["content/articles"])}
              disabled={busy}
              className="rounded-lg bg-neutral-900 px-5 py-2 font-medium text-white disabled:opacity-50"
            >
              {busy ? "Сохраняю…" : "Сохранить и опубликовать"}
            </button>
            <button
              onClick={() => save(false)}
              disabled={busy}
              className="rounded-lg border border-neutral-300 px-5 py-2 font-medium disabled:opacity-50"
            >
              Сохранить черновик
            </button>
            {current && (
              <button
                onClick={remove}
                disabled={busy}
                className="rounded-lg px-5 py-2 font-medium text-red-600 disabled:opacity-50"
              >
                Удалить
              </button>
            )}
            {current && (
              <a
                href={siteUrl(
                  "article",
                  current,
                  articles.filter((a) => a.slug === current)[0]?.markdown || "",
                )}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-neutral-600 underline"
              >
                Смотреть на сайте
              </a>
            )}
            <span className="text-xs text-neutral-500">
              Сайт обновится через 1–2 минуты после сохранения
            </span>
          </div>
        </section>
      </div>
        ) : (
          <SimpleEditor
            kind={tab}
            items={tab === "case" ? caseItems : tab === "faq" ? faqItems : reviewItems}
            token={token}
            onSaved={(list) =>
              tab === "case"
                ? setCaseItems(list)
                : tab === "faq"
                  ? setFaqItems(list)
                  : setReviewItems(list)
            }
            onError={(message) => setStatus({ kind: "error", text: message })}
          />
        )}
      </div>
    </main>
  );
}
