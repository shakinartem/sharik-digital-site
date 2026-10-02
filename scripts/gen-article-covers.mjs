/**
 * Обложки статей для SEO и соцсетей.
 *
 * Зачем: у каждой статьи должен быть свой og:image. Сейчас все 21 статья
 * отдают один og-default.png — в ленте Telegram, VK и Дзена они
 * выглядят одинаково, и по сниппету нельзя отличить материалы друг
 * от друга. Поиск тоже учитывает og:image в расширенном сниппете.
 *
 * Что делает скрипт:
 *  1. Берёт список статей из data/articles.generated.ts — обложки
 *     заводятся вместе с контентом, а не отдельно: добавили статью,
 *     запустили скрипт, обложка готова.
 *  2. Рисует 1200x630 (стандарт og:image) в фирменных цветах.
 *  3. Пишет поля image и imageAlt в frontmatter статьи, если их там
 *     ещё нет: alt обязателен, без него изображение недоступно.
 *
 * Шрифт берём системный Montserrat/Arial — кириллица в SVG-тексте
 * рендерится libvips через fontconfig, и без установленного шрифта
 * вместо букв будут квадраты. Проверяем это на первом файле.
 */
import sharp from "sharp";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = "public/blog";
const W = 1200;
const H = 630;
mkdirSync(OUT, { recursive: true });

const BRAND = {
  bg: "#0A1F44",
  accent: "#9B002F",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.62)",
};

const CATEGORY_KICKER = {
  "yandex-kit": "Яндекс KIT",
  patients: "Пациентопоток",
  economy: "Экономика канала",
  cases: "Кейсы",
};

/** Экранирование для XML: амперсанд ломает весь документ. */
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Разбивает текст на строки по ширине, чтобы не вылезал за край. */
function wrap(text, perLine) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > perLine) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

function svg({ kicker, title, accentWord }) {
  const lines = wrap(title, 26).slice(0, 3);
  const startY = H / 2 - (lines.length - 1) * 34 + 14;

  const titleSpans = lines
    .map((line, i) => {
      // Акцентным делаем первое слово заголовка: в ленте именно оно
      // цепляет взгляд, остальное читается как продолжение.
      const isFirst = i === 0;
      const words = line.split(" ");
      const [first, ...rest] = words;
      const content = isFirst
        ? `<tspan fill="${BRAND.accent}">${esc(first)}</tspan>` +
          (rest.length ? ` ${esc(rest.join(" "))}` : "")
        : esc(line);
      return `<text x="80" y="${startY + i * 68}" font-size="54" font-weight="700" fill="${BRAND.text}" font-family="Montserrat, Arial, sans-serif">${content}</text>`;
    })
    .join("");

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${BRAND.bg}"/>
    <circle cx="${W - 120}" cy="120" r="220" fill="${BRAND.accent}" opacity="0.18"/>
    <circle cx="${W - 40}" cy="${H - 40}" r="150" fill="${BRAND.accent}" opacity="0.12"/>
    <rect x="0" y="0" width="14" height="${H}" fill="${BRAND.accent}"/>
    <text x="80" y="130" font-size="30" font-weight="700" fill="${BRAND.muted}" font-family="Montserrat, Arial, sans-serif" letter-spacing="2">${esc(
      (kicker || "").toUpperCase(),
    )}</text>
    ${titleSpans}
    <text x="80" y="${H - 70}" font-size="26" font-weight="600" fill="${BRAND.muted}" font-family="Montserrat, Arial, sans-serif">ШАРиК digital</text>
  </svg>`;
}

// Статьи читаем из сгенерированных данных: там уже разобран frontmatter.
const generated = readFileSync("data/articles.generated.ts", "utf8");
const entries = [...generated.matchAll(/"slug":\s*"([^"]+)"[\s\S]*?"title":\s*"([^"]+)"[\s\S]*?"description":\s*"([^"]*)"[\s\S]*?"category":\s*"([^"]+)"/g)].map(
  (m) => ({ slug: m[1], title: m[2], description: m[3], category: m[4] }),
);

if (!entries.length) {
  console.error("✗ Не удалось прочитать статьи из data/articles.generated.ts");
  process.exit(1);
}

/** alt берём из description: он уже написан под сниппет. */
function altFor(a) {
  return a.description.length > 110 ? `${a.description.slice(0, 107).trimEnd()}…` : a.description;
}

let made = 0;
let patched = 0;

for (const a of entries) {
  // Webp вместо png: сниппет — это фоновая картинка в ленте, полный
  // размер никто не смотрит, а вес влияет на скорость загрузки.
  // 21 png давали почти мегабайт, webp-версии — в разы меньше.
  const png = Buffer.from(
    svg({ kicker: CATEGORY_KICKER[a.category] || a.category, title: a.title }),
  );
  const file = join(OUT, `${a.slug}.webp`);
  await sharp(png).webp({ quality: 86 }).toFile(file);
  made++;

  // Прописываем image/imageAlt в markdown. Значения обновляем всегда:
  // alt мог быть записан с обрезанным текстом или без кавычек, из-за
  // чего YAML принял бы его за другой ключ.
  const mdPath = join("content/articles", `${a.slug}.md`);
  if (!existsSync(mdPath)) continue;
  let md = readFileSync(mdPath, "utf8");

  const rel = `/blog/${a.slug}.webp`;
  const alt = altFor(a);
  // Кавычки ставим ВСЕГДА. Без них YAML обрезает значение по «»,
  // двоеточию и другим спецсимволам, и alt молча теряет слова.
  const altLine = `"${alt.replace(/"/g, '\\"')}"`;

  if (/^image:\s*\S+/m.test(md)) {
    md = md.replace(/^image:\s*.*$/m, `image: ${rel}`);
    md = md.replace(/^imageAlt:.*$/m, `imageAlt: ${altLine}`);
  } else {
    // Ставим сразу после description — она первая по смыслу.
    md = md.replace(/^(description:.*)$/m, `$1\nimage: ${rel}\nimageAlt: ${altLine}`);
  }
  writeFileSync(mdPath, md, "utf8");
  patched++;
}

console.log(`обложек: ${made} → ${OUT}`);
console.log(`frontmatter дополнен (image/imageAlt): ${patched}`);

// Обложка хаба «Яндекс KIT» — это страница-категория, статьи из
// articles.generated.ts её не покрывают, а сниппет без картинки
// выглядит беднее соседних материалов.
await sharp(
  Buffer.from(
    svg({
      kicker: "База знаний",
      title: "Яндекс KIT: от первого шага до запуска",
    }),
  ),
)
  .webp({ quality: 86 })
  .toFile(`${OUT}/yandex-kit-hub.webp`);
console.log(`обложка хаба: ${OUT}/yandex-kit-hub.webp`);
