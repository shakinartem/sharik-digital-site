// Postbuild: копирует sitemap.xml в out/ и создаёт .nojekyll
// Нужно для GitHub Pages и Cloudflare Pages
import { copyFileSync, writeFileSync, readFileSync, existsSync } from "node:fs";
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
//    Поэтому оставляем только настоящие 3xx-редиректы, а правила с
//    кодом 200 (rewrites) вырезаем.
const redirectsPath = join(out, "_redirects");
if (existsSync(redirectsPath)) {
  const lines = readFileSync(redirectsPath, "utf8").split("\n");
  const kept = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return true;
    return !/\s200\s*$/.test(trimmed);
  });
  const removed = lines.length - kept.length;
  writeFileSync(redirectsPath, kept.join("\n"), "utf8");
  console.log(
    removed > 0
      ? `✓ out/_redirects: убрано ${removed} правил с кодом 200 (вызывали цикл 308)`
      : "✓ out/_redirects: только 3xx-редиректы",
  );
}

// 3. .nojekyll (для GitHub Pages)
writeFileSync(join(out, ".nojekyll"), "", "utf8");
console.log("✓ out/.nojekyll создан");

// 3. _headers должен быть в out (Next копирует public/ автоматически)
const headersPath = join(out, "_headers");
console.log(existsSync(headersPath) ? "✓ out/_headers на месте" : "⚠ out/_headers отсутствует");
