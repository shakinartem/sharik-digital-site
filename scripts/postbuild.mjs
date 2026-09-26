// Postbuild: копирует sitemap.xml в out/ и создаёт .nojekyll
// Нужно для GitHub Pages и Cloudflare Pages
import { copyFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "out");

// 1. sitemap.xml -> out/sitemap.xml
const sitemapSrc = join(root, "sitemap.xml");
if (existsSync(sitemapSrc)) {
  copyFileSync(sitemapSrc, join(out, "sitemap.xml"));
  console.log("✓ sitemap.xml -> out/sitemap.xml");
} else {
  console.warn("⚠ sitemap.xml не найден в корне");
}

// 2. ВАЖНО: правила вида `/x /x.html 200` в _redirects вызывают
//    бесконечный редирект 308 на Cloudflare Pages: нормализация .html
//    возвращает на исходный URL, правило срабатывает снова по кругу.
//    Pages и так отдаёт .html по чистому URL — такие правила не нужны.
const redirectsPath = join(out, "_redirects");
if (existsSync(redirectsPath)) {
  rmSync(redirectsPath);
  console.log("✓ out/_redirects удалён (вызывал цикл редиректов 308)");
}

// 3. .nojekyll (для GitHub Pages)
writeFileSync(join(out, ".nojekyll"), "", "utf8");
console.log("✓ out/.nojekyll создан");

// 3. _headers должен быть в out (Next копирует public/ автоматически)
const headersPath = join(out, "_headers");
console.log(existsSync(headersPath) ? "✓ out/_headers на месте" : "⚠ out/_headers отсутствует");
