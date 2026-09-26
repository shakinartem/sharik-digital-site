import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionTitle } from "@/components/ui";

export const metadata = {
  title: "Индекс пациентопотока",
  description: "Как измерять управляемость маршрута пациента и понимать, готова ли клиника к масштабированию.",
};

export default function FlowIndexArticle() {
  return (
    <main>
      <SiteHeader solidBg />
      <article className="section-pad">
        <div className="container-wide max-w-3xl">
          <SectionTitle kicker="Блог" title="Индекс пациентопотока" />
          <div className="mt-8 space-y-6 text-muted-foreground leading-8">
            <p>
              Индекс пациентопотока — это числовая модель управляемости маршрута. 
              Он показывает, какие контуры работают, где слабые места и насколько клиника готова принимать трафик.
            </p>
            <h2 className="text-xl font-bold text-foreground">Как считается</h2>
            <p>
              Каждый контур оценивается по шкале от 0 до 100 баллов. 
              Мы проверяем готовность каналов, скорость обработки и процент конверсий.
            </p>
            <h2 className="text-xl font-bold text-foreground">Диапазоны</h2>
            <p><strong>0–30 баллов</strong> — критический диапазон. Контур требует немедленного исправления.</p>
            <p><strong>31–60 баллов</strong> — зона риска. Есть утечки, но система работает.</p>
            <p><strong>61–100 баллов</strong> — стабильный поток. Контур готов к масштабированию.</p>
            <h2 className="text-xl font-bold text-foreground">Почему это важно</h2>
            <p>
              Без индекса клиника не видит, где растягивать трафик без риска для результата. 
              Мы закрываем критические потери, связываем контуры и повышаем общий индекс.
            </p>
          </div>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}