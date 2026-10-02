// Проверка, что на боевом сайте обслуживается нужный бандл.
//
// Запуск: node scripts/verify-bundle-live.mjs
//
// Зачем: деплой рапортует об успехе по загрузке файлов, но не по тому,
// что страница отдаётся. Панель EnvCheck — клиентский компонент, её
// текст лежит в JS-чанке, а не в HTML. Если чанк не обновился, кнопки
// «Проверить окружение» просто не будет — и это заметно только в браузере.
//
// Шаги: берём /admin, находим подключённый чанк админки и ищем в нём
// строку. Кэш Cloudflare мог бы отдать старый чанк, поэтому проверяем
// и сам chunk-файл с сайта.

const SITE = "https://sharik-digital.ru";
const NEEDLE = "Проверить окружение";

const page = await fetch(`${SITE}/admin`, {
  headers: { "User-Agent": "sharik-cms", "Cache-Control": "no-cache" },
});
const html = await page.text();
console.log(`/admin => HTTP ${page.status}`);

// Чанки админки узнаём по имени файла: Next.js кладёт их в
// /_next/static/chunks/app/admin/page-<hash>.js.
const chunk = html.match(/\/_next\/static\/chunks\/app\/admin\/page-[^"']+\.js/);
if (!chunk) {
  console.log("Чанк админки не найден в HTML — проверка невозможна.");
  process.exit(1);
}

const url = SITE + chunk[0];
const response = await fetch(url, {
  headers: { "User-Agent": "sharik-cms", "Cache-Control": "no-cache" },
});
const body = await response.text();

console.log(`чанк ${chunk[0]} => HTTP ${response.status}, ${body.length} байт`);

if (body.includes(NEEDLE)) {
  console.log(`OK: «${NEEDLE}» есть на боевом сайте.`);
} else {
  console.log(`НЕТ: «${NEEDLE}» на сайте не найден — бандл ещё старый.`);
  process.exit(1);
}