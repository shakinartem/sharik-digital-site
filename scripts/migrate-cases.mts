/**
 * Разовый скрипт: выгружает кейсы и отзывы из data/*.ts в content/*.
 * Статьи переведены ранее скриптом migrate-content.mts.
 *
 *   node --experimental-strip-types scripts/migrate-cases.mts
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { serializeCase, parseCase } from "./lib/content.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "content", "cases");
mkdirSync(outDir, { recursive: true });

/** Достаёт литерал массива из TS-файла, не запуская TypeScript. */
function extractArray(file: string, marker: string) {
  const source = readFileSync(join(root, file), "utf8");
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Маркер не найден в ${file}: ${marker}`);
  const arrayText = source.slice(start + marker.length);
  // Отрезаем хвост массива по последней закрывающей скобке-объекту.
  // Именно поиск последнего "}," надёжнее, чем regex по "];": в данных
  // встречаются строковые значения с точкой с запятой.
  const lastItem = arrayText.lastIndexOf("},");
  if (lastItem < 0) throw new Error(`В ${file} не найдено ни одного элемента массива`);
  // Конкатенация вместо шаблонной строки: в тексте кейсов встречаются
  // обратные кавычки, которые закрыли бы template literal.
  return new Function("return [" + arrayText.slice(0, lastItem + 1) + "]")();
}

const cases = extractArray("data/cases.ts", "export const cases: CaseItem[] = [");
console.log(`Найдено кейсов: ${cases.length}`);

let ok = 0;
for (const item of cases) {
  const markdown = serializeCase(item);
  writeFileSync(join(outDir, `${item.id}.md`), markdown, "utf8");

  const back = parseCase(markdown, item.id);
  const issues: string[] = [];
  for (const key of Object.keys(item) as (keyof typeof item)[]) {
    const before = JSON.stringify(item[key]);
    const after = JSON.stringify((back as Record<string, unknown>)[key]);
    if (before !== after) issues.push(`${key}: ${before} → ${after}`);
  }
  console.log(issues.length ? `✗ ${item.id}: ${issues.join("; ")}` : `✓ ${item.id}`);
  if (!issues.length) ok++;
}

console.log(`\nГотово без расхождений: ${ok} из ${cases.length}`);
console.log(`Файлов в content/cases: ${readdirSync(outDir).length}`);
