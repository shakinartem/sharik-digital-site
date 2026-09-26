/**
 * Счётчик Яндекс.Метрики.
 *
 * Здесь намеренно обычный <script>, а не next/script. Разметка
 * Яндекса в статическом экспорте попадает в поток RSC и выполняется
 * только после гидрации: если JS не загрузился или страницу открыли
 * с отключённым скриптом, счётчик молча не стартует. Обычный тег
 * попадает в HTML как есть и работает всегда. На скорость это почти
 * не влияет — загрузчик сам ставит k.async = 1 и не блокирует разбор.
 *
 * Своя аналитика в lib/analytics.ts при этом остаётся: она отвечает на
 * вопрос «какая статья привела заявку» и не зависит от внешнего сервиса.
 * Метрика даёт вебвизор, кликовую карту и сводку по источникам.
 *
 * Идентификатор счётчика хранится в data/site.ts.
 */
export function MetricaCounter({ id }: { id: number }) {
  const loader = `(function(m,e,t,r,i,k,a){
  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {
    if (document.scripts[j].src === r) { return; }
  }
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${id}', 'ym');

ym(${id}, 'init', {
  ssr: true,
  webvisor: true,
  clickmap: true,
  ecommerce: 'dataLayer',
  referrer: document.referrer,
  url: location.href,
  accurateTrackBounce: true,
  trackLinks: true
});`;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: loader }} />
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${id}`}
            style={{ position: "absolute", left: "-9999px;" }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}