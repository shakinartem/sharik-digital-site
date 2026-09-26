/**
 * Уведомление поисковиков о новых страницах.
 *
 * Яндекс принимает sitemap по прямой ссылке без кабинета и
 * отвечает rs_weight — это работает, поэтому зовём его всегда.
 *
 * Google такой приём отключил в 2023 году: ping возвращает 404
 * с пометкой deprecated. Единственный путь — добавить sitemap
 * в Search Console, и это нужно сделать руками, от имени
 * владельца домена. Скрипт честно говорит об этом, а не
 * делает вид, что отправил.
 *
 * Запуск: node scripts/ping-indexing.mjs
 */
const SITE = "https://sharik-digital.ru";
const SITEMAP = `${SITE}/sitemap.xml`;

async function pingYandex() {
  try {
    const res = await fetch(
      `https://webmaster.yandex.ru/ping?sitemap=${encodeURIComponent(SITEMAP)}`,
      { signal: AbortSignal.timeout(20000) },
    );
    const body = (await res.text()).trim();
    if (res.ok && body.includes("rs_weight")) {
      console.log(`✓ Яндекс: sitemap принят (${body})`);
      return true;
    }
    console.log(`✗ Яндекс: HTTP ${res.status} ${body.slice(0, 120)}`);
    return false;
  } catch (error) {
    console.log(`✗ Яндекс: не удалось отправить — ${error.message}`);
    return false;
  }
}

async function checkGoogle() {
  try {
    const res = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`,
      { signal: AbortSignal.timeout(20000) },
    );
    if (res.status === 404) {
      console.log("— Google: ping отключён Google с 2023 года.");
      console.log("  Добавьте sitemap вручную: Search Console → Sitemaps →");
      console.log(`  ${SITEMAP}`);
      return;
    }
    console.log(`— Google: неожиданный ответ HTTP ${res.status}`);
  } catch (error) {
    console.log(`— Google: не удалось проверить — ${error.message}`);
  }
}

console.log(`Карта: ${SITEMAP}`);
await pingYandex();
await checkGoogle();