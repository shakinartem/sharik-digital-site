/**
 * Формат хранения статей: Markdown + frontmatter.
 *
 * Почему Markdown, а не JSON или дальнейший хардкод в .ts:
 * - админка должна давать редактировать контент без программиста;
 * - diff в git читаемый: видно, что именно изменилось в тексте;
 * - сборка всё равно превращает это в типизированные блоки, поэтому
 *   безопасность рантайма не снижается.
 *
 * Формат блоков соответствует типу Block в data/articles.ts:
 *   абзац         — обычный текст
 *   ## Заголовок  — h2
 *   ### Заголовок — h3
 *   - пункт       — ul
 *   1. пункт      — ol
 *   :::note kind=tip title="..." ... ::: — выноска
 *   | a | b |     — таблица
 */

const CATEGORIES = new Set(["yandex-kit", "patients", "economy"]);

/** Значение в YAML-совместимом виде: кавычки только когда реально нужны. */
function yamlValue(value) {
  const str = String(value ?? "");
  if (str === "") return '""';
  if (/[:#]/.test(str) || /^\s|\s$/.test(str)) return `"${str.replace(/"/g, '\\"')}"`;
  return str;
}

/**
 * Список для frontmatter.
 *
 * Именно блочный YAML, а не [a, b] в одну строку: во встроенном списке
 * запятая считается разделителем, и «1,5 млн» превращалось в «15 млн»
 * при обратном чтении. Проверка round-trip ловила это сразу, но
 * терять цифры в демонстрационных результатах нельзя — блок надёжнее.
 */
function toInlineList(items) {
  const list = (items || []).filter(Boolean);
  if (!list.length) return "[]";
  return `\n${list.map((s) => `  - ${String(s).replace(/[\r\n]+/g, " ").trim()}`).join("\n")}`;
}

/** Разбор frontmatter. Возвращает { meta, body }. */
export function parseFrontmatter(raw) {
  const meta = {};
  const body = raw.replace(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/, (_, block) => {
    // Ключ верхнего уровня, если встретился отступ — это вложенный блок cta
    let inCta = false;
    let listKey = null;

    for (const line of block.split(/\r?\n/)) {
      if (!line.trim()) continue;

      const listItem = line.match(/^\s*-\s+(.*)$/);
      if (listItem && listKey) {
        meta[listKey].push(listItem[1].trim());
        continue;
      }

      // Отступ разрешаем: без него теряются поля вложенного cta
      const pair = line.match(/^(\s*)([a-zA-Z]+):\s*(.*)$/);
      if (!pair) continue;
      const [, indent, key, value] = pair;

      // Ключ без отступа после cta — это уже новый блок верхнего уровня
      if (indent === "" && inCta) inCta = false;

      if (key === "cta" && value === "") {
        meta.cta = {};
        inCta = true;
        listKey = null;
        continue;
      }
      if (inCta) {
        meta.cta[key] = value.replace(/^["']|["']$/g, "");
        continue;
      }

      if (value === "") {
        meta[key] = [];
        listKey = key;
        continue;
      }
      listKey = null;
      if (value.startsWith("[") && value.endsWith("]")) {
        meta[key] = value
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
        continue;
      }
      meta[key] = value.replace(/^["']|["']$/g, "");
    }
    return "";
  });

  return { meta, body };
}

/** Сериализация статьи обратно в Markdown. */
export function serializeArticle(article) {
  const lines = [
    "---",
    `slug: ${article.slug}`,
    `title: ${yamlValue(article.title)}`,
    `description: ${yamlValue(article.description)}`,
    `seoTitle: ${yamlValue(article.seoTitle)}`,
    `category: ${article.category}`,
    `tags: ${toInlineList(article.tags)}`,
    `date: ${article.date}`,
  ];

  if (article.updatedAt) lines.push(`updatedAt: ${article.updatedAt}`);
  if (article.sourceUrl) lines.push(`sourceUrl: ${article.sourceUrl}`);
  if (article.sourceLabel) lines.push(`sourceLabel: ${yamlValue(article.sourceLabel)}`);

  if (article.cta) {
    lines.push("cta:");
    lines.push(`  title: ${yamlValue(article.cta.title)}`);
    lines.push(`  text: ${yamlValue(article.cta.text)}`);
    lines.push(`  href: ${yamlValue(article.cta.href)}`);
    lines.push(`  label: ${yamlValue(article.cta.label)}`);
  }

  lines.push(`related: ${toInlineList(article.related)}`);
  lines.push("---", "");

  for (const block of article.blocks) {
    switch (block.t) {
      case "p":
        lines.push(block.text, "");
        break;
      case "h2":
        lines.push(`## ${block.text}`, "");
        break;
      case "h3":
        lines.push(`### ${block.text}`, "");
        break;
      case "ul":
        lines.push(...block.items.map((i) => `- ${i}`), "");
        break;
      case "ol":
        lines.push(...block.items.map((i, n) => `${n + 1}. ${i}`), "");
        break;
      case "note":
        lines.push(`:::${block.kind} title="${block.title}"`, block.text, ":::", "");
        break;
      case "table":
        lines.push(`| ${block.head.join(" | ")} |`);
        lines.push(`| ${block.head.map(() => "---").join(" | ")} |`);
        lines.push(...block.rows.map((r) => `| ${r.join(" | ")} |`), "");
        break;
    }
  }

  return `${lines.join("\n").replace(/\n{3,}$/, "\n")}\n`;
}


/** Разбор Markdown в типизированные блоки. Обратная операция к serializeArticle. */
export function parseArticle(raw, fallbackSlug = "") {
  const { meta, body } = parseFrontmatter(raw);
  const blocks = [];
  const lines = body.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Выноска :::note kind=tip title="..."
    const note = line.match(/^:::(note|warn|tip)\s+title="([^"]*)"$/);
    if (note) {
      const text = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ":::") {
        text.push(lines[i].trim());
        i++;
      }
      blocks.push({ t: "note", kind: note[1], title: note[2], text: text.join(" ") });
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ t: "h3", text: line.slice(4).trim() });
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ t: "h2", text: line.slice(3).trim() });
      continue;
    }

    // Таблица
    if (line.startsWith("|")) {
      const cells = (row) =>
        row
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((c) => c.trim());
      const head = cells(line);
      i++; // строка-разделитель
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(cells(lines[i].trim()));
        i++;
      }
      blocks.push({ t: "table", head, rows });
      continue;
    }

    // Нумерованный список
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      i--;
      blocks.push({ t: "ol", items });
      continue;
    }

    // Маркированный список
    if (line.startsWith("- ")) {
      const items = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      i--;
      blocks.push({ t: "ul", items });
      continue;
    }

    // Абзац: склеиваем мягкие переносы до пустой строки или нового блока
    const boundary = /^(#{2,3}\s|- |\d+\.\s|\||:::)/;
    const paragraph = [line];
    while (
      i + 1 < lines.length &&
      lines[i + 1].trim() &&
      !boundary.test(lines[i + 1].trim())
    ) {
      i++;
      paragraph.push(lines[i].trim());
    }
    blocks.push({ t: "p", text: paragraph.join(" ") });
  }

  return {
    slug: meta.slug || fallbackSlug,
    title: meta.title || "",
    description: meta.description || "",
    seoTitle: meta.seoTitle || meta.title || "",
    category: CATEGORIES.has(meta.category) ? meta.category : "yandex-kit",
    tags: meta.tags || [],
    date: meta.date || "",
    ...(meta.updatedAt ? { updatedAt: meta.updatedAt } : {}),
    ...(meta.sourceUrl ? { sourceUrl: meta.sourceUrl } : {}),
    ...(meta.sourceLabel ? { sourceLabel: meta.sourceLabel } : {}),
    cta: meta.cta || { title: "", text: "", href: "/", label: "" },
    related: meta.related || [],
    blocks,
  };
}


/* ------------------------------------------------------------------ *
 * Кейсы и отзывы
 *
 * Формат тот же (frontmatter), но без тела: у кейса набор строковых
 * полей и списков, у отзыва — короткие цитата и автор. Парсер статей
 * не трогаем, общий используется только чтение frontmatter.
 * ------------------------------------------------------------------ */

const CASE_DIRECTIONS = new Set(["clinic", "other"]);

/** Кейс -> markdown. */
export function serializeCase(item) {
  const lines = [
    "---",
    `id: ${item.id}`,
    `title: ${yamlValue(item.title)}`,
    `niche: ${yamlValue(item.niche)}`,
    `direction: ${item.direction}`,
  ];
  if (item.city) lines.push(`city: ${yamlValue(item.city)}`);
  lines.push(`mainResult: ${yamlValue(item.mainResult)}`);
  lines.push(`shortDescription: ${yamlValue(item.shortDescription)}`);
  lines.push(`task: ${yamlValue(item.task)}`);
  lines.push(`whatWasDone: ${toInlineList(item.whatWasDone)}`);
  lines.push(`results: ${toInlineList(item.results)}`);
  lines.push(`conclusion: ${yamlValue(item.conclusion)}`);
  lines.push(`images: ${toInlineList(item.images)}`);
  lines.push(`tags: ${toInlineList(item.tags)}`);
  if (item.contourClosed) lines.push(`contourClosed: ${yamlValue(item.contourClosed)}`);
  lines.push("---", "");
  return lines.join("\n");
}

/** Markdown -> кейс. */
export function parseCase(raw, fallbackId = "") {
  const { meta } = parseFrontmatter(raw);
  return {
    id: meta.id || fallbackId,
    title: meta.title || "",
    niche: meta.niche || "",
    ...(meta.city ? { city: meta.city } : {}),
    mainResult: meta.mainResult || "",
    shortDescription: meta.shortDescription || "",
    task: meta.task || "",
    whatWasDone: meta.whatWasDone || [],
    results: meta.results || [],
    conclusion: meta.conclusion || "",
    images: meta.images || [],
    tags: meta.tags || [],
    ...(meta.contourClosed ? { contourClosed: meta.contourClosed } : {}),
    direction: CASE_DIRECTIONS.has(meta.direction) ? meta.direction : "clinic",
  };
}

/** Отзыв -> markdown. */
export function serializeReview(item) {
  const lines = [
    "---",
    `id: ${item.id}`,
    `author: ${yamlValue(item.author)}`,
    `role: ${yamlValue(item.role)}`,
    `text: ${yamlValue(item.text)}`,
    `result: ${yamlValue(item.result)}`,
  ];
  if (item.niche) lines.push(`niche: ${yamlValue(item.niche)}`);
  lines.push("---", "");
  return lines.join("\n");
}

/** Markdown -> отзыв. */
export function parseReview(raw, fallbackId = "") {
  const { meta } = parseFrontmatter(raw);
  return {
    id: meta.id || fallbackId,
    author: meta.author || "",
    role: meta.role || "",
    text: meta.text || "",
    result: meta.result || "",
    ...(meta.niche ? { niche: meta.niche } : {}),
  };
}

/**
 * Вопрос FAQ -> markdown.
 *
 * Формат совпадает со статьями: frontmatter (id, order, question),
 * закрывающий `---`, затем текст ответа в теле. Так один и тот же
 * парсер читает все типы контента, а ответ остаётся обычным текстом,
 * который можно писать в несколько строк.
 */
export function serializeFaq(item) {
  return [
    "---",
    `id: ${item.id}`,
    `order: ${item.order ?? 0}`,
    `question: ${yamlValue(item.q)}`,
    "---",
    "",
    String(item.a || "").trim(),
    "",
  ].join("\n");
}

/** Markdown -> вопрос FAQ. */
export function parseFaq(raw, fallbackId = "") {
  const { meta, body } = parseFrontmatter(raw);
  return {
    id: meta.id || fallbackId,
    order: Number(meta.order) || 0,
    q: meta.question || "",
    a: body
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .join(" ")
      .trim(),
  };
}

