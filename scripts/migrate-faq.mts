import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { serializeFaq, parseFaq } from "./lib/content.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "content", "faq");
mkdirSync(outDir, { recursive: true });

const source = readFileSync(join(root, "data", "agency.ts"), "utf8");
const start = source.indexOf("export const agencyFaq = [");
const tail = source.slice(start + "export const agencyFaq = ".length);
// Массив объявлен как "as const" — убираем аннотацию перед вычислением.
const raw = tail.replace(/\s+as const;?\s*$/, ";");
const items = new Function("return " + raw)();

let ok = 0;
items.forEach((item, i) => {
  const id = "faq-" + (i + 1);
  const md = serializeFaq({ id, order: i, q: item.q, a: item.a });
  writeFileSync(join(outDir, id + ".md"), md, "utf8");
  const back = parseFaq(md, id);
  const norm = (v) => String(v).replace(/\s+/g, " ").trim();
  const same = back.a === norm(item.a) && back.q === norm(item.q);
  console.log(same ? "ok " : "DIFF", id, JSON.stringify(item.q.slice(0, 40)));
  if (same) ok++;
});
console.log("\nЭкспортировано:", ok, "из", items.length);