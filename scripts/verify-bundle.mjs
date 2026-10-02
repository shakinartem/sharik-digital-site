// Разовая проверка: попал ли текст кнопки в собранный бандл.
//
// Нужна потому, что EnvCheck — клиентский компонент: в out/admin.html
// его текста нет, он лежит в JS-чанке. Сборка может пройти успешно и
// при этом не включить компонент, если он не импортирован.
//
// Запуск: node scripts/verify-bundle.mjs "Проверить окружение"

import fs from "node:fs";
import path from "node:path";

const needle = process.argv[2];
if (!needle) {
  console.error("Укажите искомую строку аргументом.");
  process.exit(2);
}

const root = path.resolve("out");
const found = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name.endsWith(".js") && fs.readFileSync(full, "utf8").includes(needle)) {
      found.push(path.relative(root, full));
    }
  }
}

walk(root);

if (found.length) {
  console.log("Найдено в бандле:");
  for (const file of found) console.log("  " + file);
} else {
  console.log(`Не найдено: «${needle}»`);
  process.exit(1);
}