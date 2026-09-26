"use client";

import { useConsent } from "@/lib/consent";

/**
 * Счётчик Яндекс.Метрики, который ждёт согласия.
 *
 * Счётчик нельзя грузить до того, как человек его разрешил: Метрика
 * ставит собственные cookie и пишет вебвизор, то есть обрабатывает
 * персональные данные. Без согласия её запуск — нарушение, поэтому
 * здесь не «скрываем, если запрещено», а вообще не создаём скрипт.
 *
 * Пока решение не принято (ready === false) счётчик не рендерится
 * вовсе. Это осознанно: решать «по умолчанию» нельзя ни в какую
 * сторону — молчаливый отказ блокирует нормальную работу сайта,
 * молчаливое согласие нарушает закон.
 *
 * Разметка Яндекса в статическом экспорте кладётся в поток RSC и
 * выполняется только после гидрации, поэтому нужен обычный <script>:
 * он попадает в HTML как есть и не зависит от порядка гидрации.
 *
 * Своя аналитика в lib/analytics.ts работает всегда: она хранит
 * идентификатор сессии в sessionStorage, не использует cookie и
 * нужна, чтобы заявка была привязана к источнику.
 */
export function MetricaCounter({ id }: { id: number }) {
  const { consent, ready } = useConsent();

  if (!ready || !consent?.analytics) return null;

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