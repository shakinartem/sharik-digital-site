// Postbuild: копирует sitemap.xml в out/ и создаёт .nojekyll
// Нужно для GitHub Pages и Cloudflare Pages
import { copyFileSync, writeFileSync, existsSync, readFileSync, writeFileSync as _w } from "node:fs";
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

// 2. .nojekyll (для GitHub Pages)
writeFileSync(join(out, ".nojekyll"), "", "utf8");
console.log("✓ out/.nojekyll создан");

// 3. _headers и _redirects должны быть в out (Next копирует public/ автоматически,
//    но подтверждаем наличие)
for (const f of ["_headers", "_redirects"]) {
  const p = join(out, f);
  console.log(existsSync(p) ? `✓ out/${f} на месте` : `⚠ out/${f} отсутствует`);
}
