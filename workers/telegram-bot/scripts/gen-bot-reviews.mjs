import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Генерирует src/reviews.ts для воркера из данных сайта.
 *
 * Зачем генератор, а не ручной файл: бот уже хранит кейсы в
 * src/cases.ts, и тексты там рано или поздно разойдутся с сайтом —
 * это уже случалось с именем автора отзыва. Отзывы берём из того же
 * data/reviews.generated.ts, из которого собрана страница /reviews,
 * поэтому «поправили на сайте» означает «поправилось везде».
 *
 * Запуск: node workers/telegram-bot/scripts/gen-bot-reviews.mjs
 */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SOURCE = join(ROOT, "data", "reviews.generated.ts");
const TARGET = join(ROOT, "workers", "telegram-bot", "src", "reviews.ts");

const raw = readFileSync(SOURCE, "utf8");

/** Записи из сгенерированного TS. Порядок в файле и есть порядок на сайте. */
const items = [];
for (const m of raw.matchAll(
  /\{\s*"id":\s*"([^"]+)",\s*"author":\s*"((?:[^"\\]|\\.)*)",\s*"role":\s*"((?:[^"\\]|\\.)*)",\s*"text":\s*"((?:[^"\\]|\\.)*)",\s*"result":\s*"((?:[^"\\]|\\.)*)",([\s\S]*?)\n  \}/g,
)) {
  const rest = m[6];
  const pick = (key) => {
    const r = new RegExp(`"${key}":\\s*"((?:[^"\\\\]|\\\\.)*)"`).exec(rest);
    return r ? r[1] : "";
  };
  items.push({
    id: m[1],
    author: m[2],
    role: m[3],
    text: m[4],
    result: m[5],
    niche: pick("niche"),
  });
}

if (!items.length) {
  console.error("✗ Не удалось прочитать отзывы из data/reviews.generated.ts");
  process.exit(1);
}

/** Экранирование для строкового литерала TypeScript. */
const lit = (s) => `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

/**
 * Telegram не показывает длинные сообщения в превью, а читать
 * три тысячи букв в чате невозможно. Поэтому текст режется
 * по предложениям и приходит несколькими сообщениями.
 */
const MAX = 700;

function splitText(text) {
  const sentences = String(text).split(/(?<=[.!?…])\s+/);
  const chunks = [];
  let cur = "";
  for (const s of sentences) {
    if ((cur + " " + s).trim().length > MAX && cur) {
      chunks.push(cur.trim());
      cur = s;
    } else {
      cur = (cur + " " + s).trim();
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

const body = items
  .map((r) => {
    const lines = [
      `  "${r.id}": {`,
      `    author: ${lit(r.author)},`,
      `    role: ${lit(r.role)},`,
      `    niche: ${lit(r.niche)},`,
      `    result: ${lit(r.result)},`,
      "    // Части текста: длинное сообщение в Telegram не прочитать.",
      `    text: [${splitText(r.text).map(lit).join(", ")}],`,
      "  },",
    ];
    return lines.join("\n");
  })
  .join("\n");

const file = `/**
 * Отзывы клиентов для Telegram-бота.
 *
 * ФАЙЛ СОЗДАЁТСЯ АВТОМАТИЧЕСКИ — не редактируйте вручную.
 * Источник правды: data/reviews.generated.ts (он же — content/reviews).
 * Правьте отзыв в markdown через админку, затем:
 *   node workers/telegram-bot/scripts/gen-bot-reviews.mjs
 *
 * Тексты намеренно не дублируются вручную: бот и сайт читают один
 * источник. Раньше кейсы хранились отдельно, и расхождение уже
 * всплывало — в имени автора отзыва.
 */

export type BotReview = {
  author: string;
  role: string;
  niche: string;
  result: string;
  /** Текст отзыва, разбитый на части для отправки в Telegram. */
  text: string[];
};

export const REVIEWS: Record<string, BotReview> = {
${body}
};

export function getReview(id: string): BotReview | undefined {
  return REVIEWS[id];
}

/** Отзывы по нише. Пустая ниша — все отзывы. */
export function reviewsForNiche(niche?: string): [string, BotReview][] {
  const all = Object.entries(REVIEWS);
  if (!niche) return all;
  return all.filter(([, r]) => r.niche === niche);
}

/** Ниши, которые реально встречаются — для кнопок-фильтров. */
export function reviewNiches(): string[] {
  return Array.from(new Set(Object.values(REVIEWS).map((r) => r.niche)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "ru"));
}

/**
 * Текст одного отзыва для отправки.
 *
 * Части текста уходят отдельными сообщениями, подпись — последним:
 * так цитата читается целиком, а автор виден сразу под ней.
 */
export function buildReviewText(id: string): string[] {
  const r = REVIEWS[id];
  if (!r) {
    return [
      "Отзыв не найден.",
      "",
      "Посмотрите все отзывы на сайте: sharik-digital.ru/reviews",
    ];
  }
  const parts: string[] = [];
  for (const [i, chunk] of r.text.entries()) {
    const head = r.text.length > 1 ? \`(\${i + 1}/\${r.text.length}) \` : "";
    parts.push(\`\${head}\${chunk}\`);
  }
  parts.push(\`— \${r.author}\\n\${r.role}\`);
  parts.push(\`Результат: \${r.result}\`);
  return parts;
}

/** Заголовок списка отзывов. */
export function buildReviewsMenuText(filtered?: string): string {
  if (filtered) {
    const count = reviewsForNiche(filtered).length;
    if (!count) {
      return [
        \`По нише «\${filtered}» отзывов пока нет.\`,
        "",
        "Мы не выдумываем отзывы: пишем только то, что прислали клиенты.",
        "",
        "Все отзывы собраны на сайте: sharik-digital.ru/reviews",
      ].join("\\n");
    }
    return [
      \`Отзывы по нише «\${filtered}» — \${count}.\`,
      "",
      "Выберите отзыв, чтобы прочитать целиком.",
      "Все они от реальных клиентов, с именем и должностью.",
    ].join("\\n");
  }

  return [
    \`Здесь \${Object.keys(REVIEWS).length} отзывов клиентов.\`,
    "",
    "Все они от реальных людей: имя, должность и измеримый результат.",
    "Выберите отзыв из списка или отфильтруйте по нише.",
  ].join("\\n");
}
`;

writeFileSync(TARGET, file, "utf8");
console.log(`записано ${items.length} отзывов → ${TARGET}`);
