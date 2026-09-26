/**
 * Генератор типизированных данных из markdown-файлов в content/.
 *
 * Запускается перед next build. Смысл: Markdown остаётся источником
 * правды для человека и админки, а на рантайм попадает тот же
 * типизированный Block[], что и раньше. Рендерер не меняется.
 *
 * Три типа контента обрабатываются одинаково: статьи, кейсы, отзывы.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArticle, parseCase, parseReview, parseFaq } from "./lib/content.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content");

/** Читает все .md из папки. Отсутствующая папка — не ошибка. */
function readDir(dir) {
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .sort();
  } catch {
    return [];
  }
}

/** Проверки целостности: ошибка здесь ломает сборку, а не выпускает
 *  на прод страницу с битыми related-ссылками или пустым title. */
function check(items, kind) {
  const ids = new Set();
  const errors = [];

  for (const item of items) {
    const id = kind === "article" ? item.slug : item.id;
    // У отзыва и вопроса FAQ поля title нет по замыслу: их опознаёт
    // автор и текст вопроса. Требовать title здесь — значит запретить
    // сами форматы.
    if (kind !== "review" && kind !== "faq" && !item.title) {
      errors.push(`${id}: пустой title`);
    }
    if (ids.has(id)) errors.push(`${id}: дубль идентификатора`);
    ids.add(id);
  }

  if (kind === "article") {
    for (const item of items) {
      if (!item.description) errors.push(`${item.slug}: пустой description`);
      if (!item.blocks.length) errors.push(`${item.slug}: нет блоков`);
      for (const related of item.related) {
        if (!ids.has(related)) {
          errors.push(`${item.slug}: related указывает на несуществующий "${related}"`);
        }
      }
    }
  }

  if (kind === "case") {
    for (const item of items) {
      if (!item.mainResult) errors.push(`${item.id}: пустой mainResult`);
      if (!item.task) errors.push(`${item.id}: пустой task`);
    }
  }

  if (kind === "review") {
    for (const item of items) {
      if (!item.text) errors.push(`${item.id}: пустой text`);
      if (!item.author) errors.push(`${item.id}: пустой author`);
    }
  }

  if (kind === "faq") {
    for (const item of items) {
      if (!item.q) errors.push(`${item.id}: пустой question`);
      if (!item.a) errors.push(`${item.id}: пустой answer`);
    }
  }

  return errors;
}

/** Печатает TS-массив объектов в сгенерированный файл. */
function emit(target, typeImport, importPath, typeName, varName, items) {
  // items.map по пустому массиву даёт never[], и TypeScript не может
  // сопоставить его с типом — приходится подставлять элемент явно.
  const body = items
    .map((item) => `  ${JSON.stringify(item, null, 2).replace(/\n/g, "\n  ")}`)
    .join(",\n");
  const declaration = items.length
    ? `[\n${body},\n]`
    : `([] as ${typeName}[])`;

  const output = `// ФАЙЛ СОЗДАЁТСЯ АВТОМАТИЧЕСКИ — не редактируйте вручную.
// Источник правды: content/ (markdown-файлы)
// Правьте контент через админку (/admin) или в markdown-файлах,
// затем запустите: node scripts/generate-content.mjs
//
// Файл коммитится, чтобы dev-сервер работал без предсборки,
// но правки будут перезаписаны при следующей генерации.

import type { ${typeImport} } from "${importPath}";

export const ${varName}: ${typeName}[] = ${declaration};
`;

  writeFileSync(join(root, target), output, "utf8");
  return items.length;
}

const articles = readDir(join(contentDir, "articles")).map((file) =>
  parseArticle(readFileSync(join(contentDir, "articles", file), "utf8"), file.replace(/\.md$/, "")),
);
// Новые сверху: даты в формате YYYY-MM-DD сравниваются как строки
articles.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

const cases = readDir(join(contentDir, "cases")).map((file) =>
  parseCase(readFileSync(join(contentDir, "cases", file), "utf8"), file.replace(/\.md$/, "")),
);

const reviews = readDir(join(contentDir, "reviews")).map((file) =>
  parseReview(readFileSync(join(contentDir, "reviews", file), "utf8"), file.replace(/\.md$/, "")),
);

const faq = readDir(join(contentDir, "faq")).map((file) =>
  parseFaq(readFileSync(join(contentDir, "faq", file), "utf8"), file.replace(/\.md$/, "")),
);
// Порядок задан полем order: он определяет, в каком виде вопросы
// идут на странице, поэтому сортировка обязательна.
faq.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

const errors = [
  ...check(articles, "article"),
  ...check(cases, "case"),
  ...check(reviews, "review"),
  ...check(faq, "faq"),
];

if (errors.length) {
  console.error("✗ Ошибки в контенте:");
  for (const error of errors) console.error(`   ${error}`);
  process.exit(1);
}

emit(
  "data/articles.generated.ts",
  "Article",
  "./articles",
  "Article",
  "generatedArticles",
  articles,
);
emit("data/cases.generated.ts", "CaseItem", "./cases", "CaseItem", "generatedCases", cases);
emit(
  "data/reviews.generated.ts",
  "ReviewItem",
  "./reviews",
  "ReviewItem",
  "generatedReviews",
  reviews,
);

emit(
  "data/faq.generated.ts",
  "FaqItem",
  "./faq",
  "FaqItem",
  "generatedFaq",
  faq,
);

console.log(
  `✓ Контент сгенерирован: ${articles.length} статей, ${cases.length} кейсов, ` +
    `${reviews.length} отзывов, ${faq.length} вопросов FAQ`,
);

