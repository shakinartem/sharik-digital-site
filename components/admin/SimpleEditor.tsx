"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ImageListField } from "@/components/admin/ImageListField";
import { groupItems, itemSubtitle, siteUrl } from "@/lib/adminPages";
import { FAQ_HUBS } from "@/data/faq";
// Импорт из scripts/, а не из @/lib: генератор контента — единственное
// место, где формат frontmatter FAQ определён. Копия алгоритма в
// компоненте рано или поздно разошлась бы с ним.
import { parseFrontmatter, serializeFaq } from "../../scripts/lib/content.mjs";

/**
 * Редактор кейсов и отзывов.
 *
 * Отдельный файл намеренно: у кейса и отзыва поля проще статьи — нет
 * тела и SEO-заголовка. Держать всё в одной длинной форме нечитаемо.
 * Логика входа, пароля и публикации остаётся на странице /admin.
 */

type Kind = "case" | "review" | "faq";

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
  /** Фотографии кейса — по строке на путь. */
  images: string;
};

type ReviewForm = {
  id: string;
  author: string;
  role: string;
  text: string;
  result: string;
  niche: string;
  /** Аватар отзыва: путь к картинке, например /media/имя.jpg */
  photo: string;
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
  images: "",
};

const EMPTY_REVIEW: ReviewForm = {
  id: "",
  author: "",
  role: "",
  text: "",
  result: "",
  niche: "",
  photo: "",
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
    // Раньше здесь стояло пустое `images: []`: картинки кейса были
    // недоступны из админки, хотя на сайте они рендерятся — первое
    // фото становится обложкой карточки.
    `images:${toList(f.images)}`,
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
  if (f.photo.trim()) lines.push(`photo: ${f.photo.trim()}`);
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
    images: readList(markdown, "images"),
  };
}


/**
 * Вопрос FAQ: порядок определяет позицию вопроса на странице.
 *
 * hub — на какой странице вопрос живёт, group — подраздел внутри
 * неё. Оба поля редактируются здесь, а не в коде: иначе перенести
 * вопрос между страницами или разложить длинный список по темам
 * можно было бы только правкой исходников.
 */
type FaqForm = {
  id: string;
  order: string;
  hub: string;
  group: string;
  question: string;
  answer: string;
};

const EMPTY_FAQ: FaqForm = {
  id: "",
  order: "0",
  hub: "agency",
  group: "",
  question: "",
  answer: "",
};

/**
 * FaqForm -> markdown.
 *
 * Сериализация отдана scripts/lib/content.mjs — тем же кодом, что
 * пишет файлы при сборке. Своя сборка строк здесь создала бы второй
 * источник правды: поправили формат в генераторе, а админка
 * продолжила бы писать по-старому.
 */
function faqToMarkdown(f: FaqForm): string {
  return serializeFaq({
    id: f.id,
    order: Number(f.order) || 0,
    hub: f.hub,
    group: f.group.trim() || undefined,
    q: f.question,
    a: f.answer,
  });
}

/** Значение одного поля frontmatter без кавычек. */
function fmValue(markdown: string, key: string): string {
  const match = markdown.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
}

/** Страница вопроса: нужна списку в админке и подсказке подразделов. */
function hubOf(markdown: string): string {
  return fmValue(markdown, "hub") || "agency";
}

/** Подраздел вопроса; пустая строка — вопрос без группы. */
function groupOf(markdown: string): string {
  return fmValue(markdown, "group");
}

/**
 * Markdown -> FaqForm.
 *
 * Разбор идёт через parseFrontmatter из scripts/lib/content.mjs —
 * тем же кодом, что читает файлы при сборке. Свой разбор здесь
 * означал бы второй источник правды для одного и того же формата.
 */
function faqFromMarkdown(markdown: string): FaqForm {
  const { meta, body } = parseFrontmatter(markdown);
  return {
    id: meta.id || "",
    order: String(Number(meta.order) || 0),
    hub: meta.hub || "agency",
    group: typeof meta.group === "string" ? meta.group : "",
    question: meta.question || "",
    answer: body.trim(),
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
    photo: readValue(markdown, "photo"),
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
  const isFaq = kind === "faq";
  const [current, setCurrent] = useState<string | null>(null);
  const [caseForm, setCaseForm] = useState<CaseForm>(EMPTY_CASE);
  const [reviewForm, setReviewForm] = useState<ReviewForm>(EMPTY_REVIEW);
  const [faqForm, setFaqForm] = useState<FaqForm>(EMPTY_FAQ);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  /**
   * Выбранная страница в фильтре списка: "all" — показываем всё,
   * иначе только содержимое выбранной страницы. По умолчанию список
   * открыт целиком: сначала видно весь объём, а не одну вкладку.
   */
  const [pageFilter, setPageFilter] = useState("all");

  const field = "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm";
  const label = "mb-1 block text-sm font-medium text-neutral-700";
  const chip = "rounded-full border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100";
  const chipActive = "rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white";

  /**
   * Подразделы, которые уже заняты на выбранной странице.
   *
   * Нужны, чтобы новый вопрос не оказался в блоке «Другие вопросы»
   * только из-за опечатки в названии: кнопки под полем показывают
   * точные значения, которые используются на сайте.
   */
  const groupOptions = isFaq
    ? items
        // Вопросы со всех страниц, но подразделы берём только со
        // страницы, выбранной в форме: иначе в подсказку попадут
        // «Стоимость и сроки» со страницы KIT.
        .filter((i) => hubOf(i.markdown) === faqForm.hub)
        .map((i) => groupOf(i.markdown))
        .filter((g): g is string => Boolean(g))
        // Уникальные значения без Set: проект собирается под es5,
        // где итерация по Set требует downlevelIteration.
        .filter((g, index, all) => all.indexOf(g) === index)
    : [];

  const sectionTitle = isCase ? "Кейсы" : isFaq ? "Вопросы FAQ" : "Отзывы";
  const newItemLabel = isCase ? "Новый кейс" : isFaq ? "Новый вопрос" : "Новый отзыв";

  /**
   * Список, разложенный по страницам.
   *
   * И фильтр, и заголовки групп считает lib/adminPages из того же
   * frontmatter, что читает генератор, поэтому цифры рядом с
   * названиями страниц всегда совпадают с тем, что показано ниже.
   */
  const groups = groupItems(kind, items);
  const visibleGroups =
    pageFilter === "all" ? groups : groups.filter((group) => group.key === pageFilter);

  const setCase = (key: keyof CaseForm, value: string) =>
    setCaseForm((prev) => ({ ...prev, [key]: value }));
  const setFaq = (key: keyof FaqForm, value: string) =>
    setFaqForm((prev) => ({ ...prev, [key]: value }));
  const setReview = (key: keyof ReviewForm, value: string) =>
    setReviewForm((prev) => ({ ...prev, [key]: value }));

  function open(slug: string) {
    const item = items.find((i) => i.slug === slug);
    if (!item) return;
    setCurrent(slug);
    setStatus(null);
    if (isCase) setCaseForm({ ...EMPTY_CASE, ...caseFromMarkdown(item.markdown) });
    else if (isFaq) setFaqForm({ ...EMPTY_FAQ, ...faqFromMarkdown(item.markdown) });
    else setReviewForm({ ...EMPTY_REVIEW, ...reviewFromMarkdown(item.markdown) });
  }

  function create() {
    setCurrent(null);
    setStatus(null);
    if (isCase) setCaseForm({ ...EMPTY_CASE, id: "novyy-keys", title: "Новый кейс" });
    else if (isFaq) setFaqForm({ ...EMPTY_FAQ, id: "novyy-vopros" });
    else setReviewForm({ ...EMPTY_REVIEW, id: "novyy-otzyv", author: "Новый отзыв" });
  }

  async function save() {
    const id = (isCase ? caseForm.id : isFaq ? faqForm.id : reviewForm.id).trim();
    if (!id) {
      onError("Укажите идентификатор");
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const markdown = isCase
        ? caseToMarkdown(caseForm)
        : isFaq
          ? faqToMarkdown(faqForm)
          : reviewToMarkdown(reviewForm);
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
        body: JSON.stringify({ paths: [isCase ? "content/cases" : isFaq ? "content/faq" : "content/reviews"] }),
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



  /**
   * Удаление материала.
   *
   * Запись стирается из KV сразу, а файл в репозитории удаляется при
   * публикации: /api/admin/publish пересобирает дерево content/ и для
   * исчезнувших файлов ставит sha: null. Поэтому в подтверждении и
   * в статусе прямо сказано, что сайт обновится после публикации —
   * иначе выглядело бы, что удаление не сработало.
   */
  async function remove() {
    const id = current;
    if (!id) return;
    const title =
      (isCase ? caseForm.title : isFaq ? faqForm.question : reviewForm.author) || id;
    if (!confirm(`Удалить «${title}»? С сайта он исчезнет после публикации.`)) return;
    setBusy(true);
    try {
      const response = await fetch(
        "/api/admin/articles?slug=" + encodeURIComponent(id) + "&section=" + kind,
        { method: "DELETE", headers: { Authorization: "Bearer " + token } },
      );
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Не удалось удалить");

      const listResponse = await fetch("/api/admin/articles", {
        headers: { Authorization: "Bearer " + token },
      });
      const listData = (await listResponse.json()) as { articles: SimpleItem[] };
      onSaved(listData.articles.filter((a) => a.section === kind));
      setCurrent(null);
      setStatus("Удалено. Нажмите «Опубликовать на сайте», чтобы материал исчез с сайта.");
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  /** Открытый материал целиком: нужен для ссылки «смотреть на сайте». */
  const currentItem = current ? items.filter((i) => i.slug === current)[0] : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside>
        <button
          onClick={create}
          className="mb-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium"
        >
          + {newItemLabel}
        </button>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {sectionTitle} ({items.length})
        </h2>

        {/* Фильтр по страницам. Число рядом с названием — сколько
            материала лежит на этой странице: так сразу видно, что,
            например, вопросов по продавцам больше остальных. */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setPageFilter("all")}
            className={pageFilter === "all" ? chipActive : chip}
          >
            Все ({items.length})
          </button>
          {groups.map((group) => (
            <button
              key={group.key}
              type="button"
              onClick={() => setPageFilter(group.key)}
              className={pageFilter === group.key ? chipActive : chip}
            >
              {group.label} ({group.items.length})
            </button>
          ))}
        </div>

        {visibleGroups.length === 0 && (
          <p className="text-sm text-neutral-500">Здесь пока пусто.</p>
        )}

        {visibleGroups.map((group) => (
          <div key={group.key} className="mb-4">
            {/* Заголовок группы нужен только когда видно несколько
                страниц: при фильтре он лишь повторял бы имя чипа. */}
            {visibleGroups.length > 1 && (
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => (
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
                    <span className="block truncate font-medium">
                      {item.title || item.slug}
                    </span>
                    <span className="block truncate text-xs opacity-70">
                      {itemSubtitle(kind, item.markdown)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
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

            {/* Фотографии кейса. Раньше поле в форме было, а в
                markdown писалось пустое `images: []` — картинки
                нельзя было ни добавить, ни поменять местами. */}
            <div className="rounded-xl border border-neutral-200 p-4">
              <ImageListField
                token={token}
                label="Фотографии кейса"
                value={caseForm.images
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean)}
                onChange={(images) => setCase("images", images.join("\n"))}
                hint="Первое фото становится обложкой карточки на сайте. Остальные идут галереей в подробном разборе кейса."
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
        ) : isFaq ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={label} htmlFor="f-id">
                  Идентификатор
                </label>
                <input
                  id="f-id"
                  className={field}
                  value={faqForm.id}
                  onChange={(e) => setFaq("id", e.target.value)}
                />
              </div>
              <div>
                <label className={label} htmlFor="f-order">
                  Порядок на странице
                </label>
                <input
                  id="f-order"
                  type="number"
                  className={field}
                  value={faqForm.order}
                  onChange={(e) => setFaq("order", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={label} htmlFor="f-hub">
                  Страница
                </label>
                <select
                  id="f-hub"
                  className={field}
                  value={faqForm.hub}
                  onChange={(e) => setFaq("hub", e.target.value)}
                >
                  {FAQ_HUBS.map((h) => (
                    <option key={h.value} value={h.value}>
                      {h.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label} htmlFor="f-group">
                  Подраздел
                </label>
                <input
                  id="f-group"
                  className={field}
                  value={faqForm.group}
                  onChange={(e) => setFaq("group", e.target.value)}
                  placeholder="Оплата и заказ"
                />
              </div>
            </div>
            {groupOptions.length > 0 && (
              <div>
                <p className="mb-1 text-xs text-neutral-500">
                  Уже есть на этой странице: {groupOptions.join(", ")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {groupOptions.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFaq("group", g)}
                      className="rounded-full border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-100"
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className={label} htmlFor="f-question">
                Вопрос
              </label>
              <input
                id="f-question"
                className={field}
                value={faqForm.question}
                onChange={(e) => setFaq("question", e.target.value)}
              />
            </div>
            <div>
              <label className={label} htmlFor="f-answer">
                Ответ
              </label>
              <textarea
                id="f-answer"
                rows={6}
                className={field}
                value={faqForm.answer}
                onChange={(e) => setFaq("answer", e.target.value)}
              />
            </div>
            <p className="text-xs text-neutral-500">
              Страница определяет, где вопрос выводится. Подраздел группирует вопросы
              внутри страницы: пустое поле отправит вопрос в блок «Другие вопросы».
              Порядок задаёт позицию — чем меньше число, тем выше; он же определяет
              порядок подразделов.
            </p>
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

            <div className="rounded-xl border border-neutral-200 p-4">
              <ImageUpload
                token={token}
                label="Фото автора"
                value={reviewForm.photo}
                onChange={(url) => setReview("photo", url)}
                hint="Круглый аватар в карточке отзыва. Без фото показываются инициалы."
              />
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
          {current && (
            <a
              href={siteUrl(kind, current, currentItem?.markdown || "")}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-neutral-600 underline"
            >
              Смотреть на сайте
            </a>
          )}
          {current && (
            <button
              onClick={remove}
              disabled={busy}
              className="rounded-lg px-5 py-2 font-medium text-red-600 disabled:opacity-50"
            >
              Удалить
            </button>
          )}
          <span className="text-xs text-neutral-500">Пересборка 1–2 минуты</span>
        </div>
      </section>
    </div>
  );
}
