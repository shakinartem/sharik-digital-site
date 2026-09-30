/**
 * Генерация sitemap.xml из контента.
 *
 * Зачем: sitemap держался руками, и каждая новая статья, опубликованная
 * из админки, в него не попадала. Поисковик узнаёт о странице только
 * из внутренних ссылок, а на новую статью до первого обхода никто не
 * ссылается. Генерируем на сборке — тогда цикл замкнут: опубликовали
 * в админке, страница сразу в карте.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArticle } from "./lib/content.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://sharik-digital.ru";
const TODAY = new Date().toISOString().slice(0, 10);

/**
 * Главная в карте пишется без завершающего слеша — ровно так, как её
 * отдаёт <link rel="canonical"> в разметке. Расхождение в один символ
 * не выглядит страшным, но Яндекс сверяет адреса буквально: при разнице
 * он считает, что в карте указана другая страница, и помечает её как
 * «исключена». Каноническая форма одна: https://sharik-digital.ru
 */
const HOMEPAGE = SITE;

/** Статические страницы: путь, приоритет, частота обновления. */
const STATIC = [
  ["/", "1.0", "weekly"],
  ["/sellers", "0.9", "weekly"],
  ["/clinics", "0.9", "weekly"],
  ["/yandex-kit", "0.9", "weekly"],
  ["/cases", "0.8", "weekly"],
  ["/blog", "0.8", "weekly"],
  ["/blog/yandex-kit", "0.8", "monthly"],
  ["/about", "0.5", "monthly"],
  ["/contacts", "0.5", "monthly"],
  ["/privacy", "0.3", "yearly"],
];

const articlesDir = join(root, "content", "articles");
const files = readdirSync(articlesDir).filter((f) => f.endsWith(".md"));
const articles = files.map((f) =>
  parseArticle(readFileSync(join(articlesDir, f), "utf8"), f.replace(/\.md$/, "")),
);

const urls = STATIC.map(
  ([path, priority, freq]) =>
    `  <url>\n    <loc>${path === "/" ? HOMEPAGE : `${SITE}${path}`}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
);

for (const article of articles) {
  urls.push(
    `  <url>\n    <loc>${SITE}/blog/${article.slug}</loc>\n    <lastmod>${article.updatedAt || article.date || TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
  );
}

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<!-- Файл генерируется scripts/generate-sitemap.mjs. Правьте контент, а не его. -->\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  `${urls.join("\n")}\n</urlset>\n`;

writeFileSync(join(root, "sitemap.xml"), xml, "utf8");
console.log(`✓ sitemap.xml: ${urls.length} URL (статей: ${articles.length})`);