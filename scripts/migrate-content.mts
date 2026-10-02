/**
 * Разовый скрипт: выгружает статьи из data/articles.ts в content/articles/*.md.
 *
 * Запускается вручную и нужен один раз — чтобы перевести контент на
 * формат, который правит админка. Node 22+ умеет снимать типы на лету,
 * поэтому TypeScript импортируется без сборки.
 *
 *   node --experimental-strip-types scripts/migrate-content.mts
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { serializeArticle, parseArticle } from "./lib/content.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "content", "articles");
mkdirSync(outDir, { recursive: true });

/**
 * Статьи читаем из сгенерированного файла: data/articles.ts содержит
 * только типы и хелперы, а сами объекты лежат в articles.generated.ts.
 */
const generated = readFileSync(join(root, "data", "articles.generated.ts"), "utf8");
// Маркер включает открывающую скобку: иначе в body попадёт лишняя "["
// и в new Function получится return [[...]] вместо массива статей.
const marker = "export const generatedArticles: Article[] = [";
const start = generated.indexOf(marker);
if (start < 0) throw new Error("Массив generatedArticles не найден");

const arrayText = generated.slice(start + marker.length);
// Шаблон генератора закрывает массив строкой "\n];". Ищем её с конца:
// внутри значений встречаются точки с запятой, поэтому искать "];" в тексте
// нельзя. Тело заканчивается последней "}," — с запятой, как и требует JS.
const end = arrayText.lastIndexOf("\n];");
if (end < 0) throw new Error("Не удалось найти конец массива generatedArticles");
const body = arrayText.slice(0, end + 1);

// Конкатенация строк, а не шаблонная строка: в тексте статей есть
// обратные кавычки (например, в примерах команд), и внутри
// template literal они закрыли бы строку и сломали разбор.
const articles = new Function("return [" + body + "]")();

let written = 0;
for (const article of articles) {
  const markdown = serializeArticle(article);
  const file = join(outDir, `${article.slug}.md`);
  writeFileSync(file, markdown, "utf8");

  // Проверка: разбор должен вернуть то же самое, что было на входе
  const roundTrip = parseArticle(markdown, article.slug);
  const issues = [];
  if (roundTrip.blocks.length !== article.blocks.length) {
    issues.push(
      `блоков: было ${article.blocks.length}, стало ${roundTrip.blocks.length}`,
    );
  }
  for (let i = 0; i < roundTrip.blocks.length; i++) {
    const a = article.blocks[i];
    const b = roundTrip.blocks[i];
    if (!a || !b) continue;
    if (a.t !== b.t) issues.push(`блок ${i}: тип ${a.t} → ${b.t}`);
    else if (a.text !== undefined && a.text !== b.text) {
      issues.push(`блок ${i} (${a.t}): текст отличается`);
    } else if (a.title !== undefined && a.title !== b.title) {
      issues.push(`блок ${i} (${a.t}): заголовок отличается`);
    } else if (a.kind !== undefined && a.kind !== b.kind) {
      issues.push(`блок ${i} (${a.t}): kind отличается`);
    }
  }
  if (roundTrip.title !== article.title) issues.push("title отличается");
  if (roundTrip.description !== article.description) issues.push("description отличается");

  console.log(issues.length ? `✗ ${article.slug}: ${issues.join("; ")}` : `✓ ${article.slug}`);
  if (!issues.length) written++;
}

console.log(`\nЗаписано файлов: ${written} из ${articles.length} в content/articles/`);
console.log(
  readdirSync(outDir).length === articles.length
    ? "Все статьи выгружены."
    : "⚠ Число файлов не совпадает с числом статей.",
);
