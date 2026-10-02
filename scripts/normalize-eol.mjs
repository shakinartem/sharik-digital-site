/**
 * Нормализует переносы строк в markdown: CRLF -> LF.
 *
 * Зачем: правки через редактор и через скрипты оставляли файлы со
 * смешанными окончаниями строк. Git такие файлы показывает как
 * изменённые целиком при любой содержательной правке, а diff
 * становится нечитаемым. Репозиторий хранит текст с LF.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

let fixed = 0;
for (const dir of ["content/articles", "content/cases", "content/reviews", "content/faq"]) {
  let n = 0;
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const path = join(dir, file);
    const raw = readFileSync(path, "utf8");
    const norm = raw.replace(/\r\n/g, "\n");
    if (norm !== raw) {
      writeFileSync(path, norm, "utf8");
      n++;
    }
  }
  if (n) console.log(`${dir}: ${n}`);
  fixed += n;
}
console.log(`нормализовано всего: ${fixed}`);
