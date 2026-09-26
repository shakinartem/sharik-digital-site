"use client";

import { useState } from "react";

/**
 * Редактор кейсов и отзывов.
 *
 * Отдельный файл намеренно: у кейса и отзыва поля проще статьи — нет
 * тела и SEO-заголовка. Держать всё в одной длинной форме нечитаемо.
 * Логика входа, пароля и публикации остаётся на странице /admin.
 */

type Kind = "case" | "review";

export type SimpleItem = {
  slug: string;
  title: string;
  markdown: string;
  section: string;
  updatedAt?: string;
  published: boolean;
  draft: boolean;
};

type CaseForm = {
  id: string;
  title: string;
  niche: string;
  city: string;
  direction: "clinic" | "other";
  mainResult: string;
  shortDescription: string;
  task: string;
  whatWasDone: string;
  results: string;
  conclusion: string;
  tags: string;
};

type ReviewForm = {
  id: string;
  author: string;
  role: string;
  text: string;
  result: string;
  niche: string;
};

const EMPTY_CASE: CaseForm = {
  id: "",
  title: "",
  niche: "",
  city: "",
  direction: "clinic",
  mainResult: "",
  shortDescription: "",
  task: "",
  whatWasDone: "",
  results: "",
  conclusion: "",
  tags: "",
};

const EMPTY_REVIEW: ReviewForm = {
  id: "",
  author: "",
  role: "",
  text: "",
  result: "",
  niche: "",
};

/**
 * Блочный список YAML.
 *
 * Каждый пункт — отдельная строка во вводе. Формат именно блочный:
 * в inline-виде `[a, b]` запятая внутри «1,5 млн» рвала значение
 * на части, и цифры в результатах кейсов портились при чтении.
 */
function toList(value: string) {
  const items = value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length ? `\n${items.map((s) => `  - ${s}`).join("\n")}` : "[]";
}

function caseToMarkdown(f: CaseForm): string {
  const lines = [
    "---",
    `id: ${f.id}`,
    `title: ${f.title}`,
    `niche: ${f.niche}`,
    `direction: ${f.direction}`,
  ];
  if (f.city.trim()) lines.push(`city: ${f.city.trim()}`);
  lines.push(
    `mainResult: ${f.mainResult}`,
    `shortDescription: ${f.shortDescription}`,
    `task: ${f.task}`,
    `whatWasDone:${toList(f.whatWasDone)}`,
    `results:${toList(f.results)}`,
    `conclusion: ${f.conclusion}`,
    `images: []`,
    `tags:${toList(f.tags)}`,
    `contourClosed: ${f.city.trim()}`,
  );
  lines.push("---", "");
  return lines.join("\n");
}

function reviewToMarkdown(f: ReviewForm): string {
  const lines = [
    "---",
    `id: ${f.id}`,
    `author: ${f.author}`,
    `role: ${f.role}`,
    `text: ${f.text}`,
    `result: ${f.result}`,
  ];
  if (f.niche.trim()) lines.push(`niche: ${f.niche.trim()}`);
  lines.push("---", "");
  return lines.join("\n");
}

/** Чтение frontmatter обратно в форму. */
function readValue(markdown: string, key: string): string {
  const match = markdown.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
}

function readList(markdown: string, key: string): string {
  const block = markdown.match(new RegExp(`^${key}:\\s*\\n((?:\\s*-\\s+.*\\n?)+)`, "m"));
  if (block) {
    return block[1]
      .split(/\r?\n/)
      .map((l) => l.replace(/^\s*-\s+/, "").trim())
      .filter(Boolean)
      .join("\n");
  }
  const inline = markdown.match(new RegExp(`^${key}:\\s*\\[(.*)\\]$`, "m"));
  return inline
    ? inline[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .join("\n")
    : "";
}

function caseFromMarkdown(markdown: string): CaseForm {
  const direction = readValue(markdown, "direction");
  return {
    id: readValue(markdown, "id"),
    title: readValue(markdown, "title"),
    niche: readValue(markdown, "niche"),
    city: readValue(markdown, "city"),
    direction: direction === "other" ? "other" : "clinic",
    mainResult: readValue(markdown, "mainResult"),
    shortDescription: readValue(markdown, "shortDescription"),
    task: readValue(markdown, "task"),
    whatWasDone: readList(markdown, "whatWasDone"),
    results: readList(markdown, "results"),
    conclusion: readValue(markdown, "conclusion"),
    tags: readList(markdown, "tags"),
  };
}

function reviewFromMarkdown(markdown: string): ReviewForm {
  return {
    id: readValue(markdown, "id"),
    author: readValue(markdown, "author"),
    role: readValue(markdown, "role"),
    text: readValue(markdown, "text"),
    result: readValue(markdown, "result"),
    niche: readValue(markdown, "niche"),
  };
}



export default function SimpleEditor({
  kind,
  items,
  token,
  onSaved,
  onError,
}: {
  kind: Kind;
  items: SimpleItem[];
  token: string;
  onSaved: (list: SimpleItem[]) => void;
  onError: (message: string) => void;
}) {
  const isCase = kind === "case";
  const [current, setCurrent] = useState<string | null>(null);
  const [caseForm, setCaseForm] = useState<CaseForm>(EMPTY_CASE);
  const [reviewForm, setReviewForm] = useState<ReviewForm>(EMPTY_REVIEW);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const field = "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm";
  const label = "mb-1 block text-sm font-medium text-neutral-700";

  const setCase = (key: keyof CaseForm, value: string) =>
    setCaseForm((prev) => ({ ...prev, [key]: value }));
  const setReview = (key: keyof ReviewForm, value: string) =>
    setReviewForm((prev) => ({ ...prev, [key]: value }));

  function open(slug: string) {
    const item = items.find((i) => i.slug === slug);
    if (!item) return;
    setCurrent(slug);
    setStatus(null);
    if (isCase) setCaseForm({ ...EMPTY_CASE, ...caseFromMarkdown(item.markdown) });
    else setReviewForm({ ...EMPTY_REVIEW, ...reviewFromMarkdown(item.markdown) });
  }

  function create() {
    setCurrent(null);
    setStatus(null);
    if (isCase) setCaseForm({ ...EMPTY_CASE, id: "novyy-keys", title: "Новый кейс" });
    else setReviewForm({ ...EMPTY_REVIEW, id: "novyy-otzyv", author: "Новый отзыв" });
  }

  async function save() {
    const id = (isCase ? caseForm.id : reviewForm.id).trim();
    if (!id) {
      onError("Укажите идентификатор");
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const markdown = isCase ? caseToMarkdown(caseForm) : reviewToMarkdown(reviewForm);
      const response = await fetch("/api/admin/articles?slug=" + encodeURIComponent(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        // section нужен, чтобы сервер знал, в какую папку content/ класть файл
        body: JSON.stringify({ slug: id, markdown, section: kind, published: true }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Ошибка сохранения");

      const listResponse = await fetch("/api/admin/articles", {
        headers: { Authorization: "Bearer " + token },
      });
      const listData = (await listResponse.json()) as { articles: SimpleItem[] };
      onSaved(listData.articles.filter((a) => a.section === kind));
      setCurrent(id);
      setStatus("Сохранено. Теперь нажмите «Опубликовать на сайте».");
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ paths: [isCase ? "content/cases" : "content/reviews"] }),
      });
      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) throw new Error(data.error || "Не удалось опубликовать");
      setStatus(data.message || "Опубликовано");
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }



  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside>
        <button
          onClick={create}
          className="mb-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium"
        >
          + {isCase ? "Новый кейс" : "Новый отзыв"}
        </button>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {isCase ? "Кейсы" : "Отзывы"} ({items.length})
        </h2>
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.slug}>
              <button
                onClick={() => open(item.slug)}
                className={
                  "w-full rounded-lg px-3 py-2 text-left text-sm " +
                  (current === item.slug
                    ? "bg-neutral-900 text-white"
                    : "hover:bg-neutral-100")
                }
              >
                <span className="block truncate font-medium">{item.title || item.slug}</span>
                <span className="block truncate text-xs opacity-70">{item.slug}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="space-y-4">
        {isCase ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className={label} htmlFor="c-id">
                  Идентификатор
                </label>
                <input
                  id="c-id"
                  className={field}
                  value={caseForm.id}
                  onChange={(e) => setCase("id", e.target.value)}
                />
              </div>
              <div>
                <label className={label} htmlFor="c-title">
                  Название
                </label>
                <input
                  id="c-title"
                  className={field}
                  value={caseForm.title}
                  onChange={(e) => setCase("title", e.target.value)}
                />
              </div>
              <div>
                <label className={label} htmlFor="c-niche">
                  Ниша
                </label>
                <input
                  id="c-niche"
                  className={field}
                  value={caseForm.niche}
                  onChange={(e) => setCase("niche", e.target.value)}
                />
              </div>
            </div>


            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={label} htmlFor="c-city">
                  Город и закрытый контур
                </label>
                <input
                  id="c-city"
                  className={field}
                  value={caseForm.city}
                  onChange={(e) => setCase("city", e.target.value)}
                  placeholder="Салават"
                />
              </div>
              <div>
                <label className={label} htmlFor="c-dir">
                  Направление
                </label>
                <select
                  id="c-dir"
                  className={field}
                  value={caseForm.direction}
                  onChange={(e) => setCase("direction", e.target.value)}
                >
                  <option value="clinic">Клиникам</option>
                  <option value="other">Другое</option>
                </select>
              </div>
            </div>

            <div>
              <label className={label} htmlFor="c-main">
                Главный результат
              </label>
              <input
                id="c-main"
                className={field}
                value={caseForm.mainResult}
                onChange={(e) => setCase("mainResult", e.target.value)}
                placeholder="146 обращений за 3 месяца · рейтинг 4.9"
              />
            </div>

            <div>
              <label className={label} htmlFor="c-short">
                Короткое описание
              </label>
              <textarea
                id="c-short"
                rows={2}
                className={field}
                value={caseForm.shortDescription}
                onChange={(e) => setCase("shortDescription", e.target.value)}
              />
            </div>

            <div>
              <label className={label} htmlFor="c-task">
                Задача
              </label>
              <textarea
                id="c-task"
                rows={2}
                className={field}
                value={caseForm.task}
                onChange={(e) => setCase("task", e.target.value)}
              />
            </div>

            <div>
              <label className={label} htmlFor="c-done">
                Что сделали — по строке на пункт
              </label>
              <textarea
                id="c-done"
                rows={5}
                className={field + " font-mono"}
                value={caseForm.whatWasDone}
                onChange={(e) => setCase("whatWasDone", e.target.value)}
              />
            </div>

            <div>
              <label className={label} htmlFor="c-res">
                Результаты — по строке на пункт
              </label>
              <textarea
                id="c-res"
                rows={4}
                className={field + " font-mono"}
                value={caseForm.results}
                onChange={(e) => setCase("results", e.target.value)}
              />
            </div>

            <div>
              <label className={label} htmlFor="c-tags">
                Теги — по строке
              </label>
              <textarea
                id="c-tags"
                rows={3}
                className={field + " font-mono"}
                value={caseForm.tags}
                onChange={(e) => setCase("tags", e.target.value)}
              />
            </div>

            <div>
              <label className={label} htmlFor="c-concl">
                Вывод
              </label>
              <textarea
                id="c-concl"
                rows={2}
                className={field}
                value={caseForm.conclusion}
                onChange={(e) => setCase("conclusion", e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className={label} htmlFor="r-id">
                  Идентификатор
                </label>
                <input
                  id="r-id"
                  className={field}
                  value={reviewForm.id}
                  onChange={(e) => setReview("id", e.target.value)}
                />
              </div>
              <div>
                <label className={label} htmlFor="r-author">
                  Автор
                </label>
                <input
                  id="r-author"
                  className={field}
                  value={reviewForm.author}
                  onChange={(e) => setReview("author", e.target.value)}
                  placeholder="Елена, главный врач"
                />
              </div>
              <div>
                <label className={label} htmlFor="r-role">
                  Роль и город
                </label>
                <input
                  id="r-role"
                  className={field}
                  value={reviewForm.role}
                  onChange={(e) => setReview("role", e.target.value)}
                  placeholder="Салават"
                />
              </div>
            </div>

            <div>
              <label className={label} htmlFor="r-text">
                Цитата
              </label>
              <textarea
                id="r-text"
                rows={4}
                className={field}
                value={reviewForm.text}
                onChange={(e) => setReview("text", e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={label} htmlFor="r-result">
                  Результат
                </label>
                <input
                  id="r-result"
                  className={field}
                  value={reviewForm.result}
                  onChange={(e) => setReview("result", e.target.value)}
                />
              </div>
              <div>
                <label className={label} htmlFor="r-niche">
                  Ниша — необязательно
                </label>
                <input
                  id="r-niche"
                  className={field}
                  value={reviewForm.niche}
                  onChange={(e) => setReview("niche", e.target.value)}
                />
              </div>
            </div>

            <p className="rounded-lg bg-amber-50 px-4 py-2 text-xs text-amber-900">
              Добавляйте только реальные отзывы. Если отзыва от конкретного человека нет — строку
              не создавайте: пустое место честнее выдуманной цитаты.
            </p>
          </>
        )}

        {status && (
          <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">{status}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-4">
          <button
            onClick={save}
            disabled={busy}
            className="rounded-lg border border-neutral-300 px-5 py-2 font-medium disabled:opacity-50"
          >
            Сохранить
          </button>
          <button
            onClick={publish}
            disabled={busy}
            className="rounded-lg bg-neutral-900 px-5 py-2 font-medium text-white disabled:opacity-50"
          >
            Опубликовать на сайте
          </button>
          <span className="text-xs text-neutral-500">Пересборка 1–2 минуты</span>
        </div>
      </section>
    </div>
  );
}
