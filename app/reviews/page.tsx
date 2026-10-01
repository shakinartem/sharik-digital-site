import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionTitle } from "@/components/ui";
import { ReviewsPageClient } from "./ReviewsPageClient";

/**
 * Все отзывы клиентов.
 *
 * Отдельная страница нужна, потому что на главной блок отзывов —
 * слайдер: он показывает три цитаты, а не портфолио. Полный список
 * открывается сюда по кнопке «Все отзывы».
 *
 * Разметка Review собирается из того же массива отзывов, что и блок на
 * главной, — разойтись они не могут.
 */
export const metadata: Metadata = {
  title: "Отзывы клиентов",
  description:
    "Письменные отзывы клиник и компаний, которые работали с ШАРиК digital: задача, результат и что именно делали.",
  alternates: { canonical: "/reviews" },
  openGraph: {
    title: "Отзывы клиентов",
    description:
      "Письменные отзывы клиник и компаний, которые работали с ШАРиК digital.",
    url: "/reviews",
    images: ["/og-default.png"],
  },
};

export default function ReviewsPage() {
  return (
    <main className="overflow-x-hidden">
      <SiteHeader />

      <section className="section-pad pt-12 sm:pt-16">
        <div className="container-wide">
          <SectionTitle
            as="h1"
            kicker="Отзывы"
            title="Что говорят клиенты"
            text="Каждый отзыв — это конкретный проект: задача, сделанная работа и измеримый результат. Мы не публикуем отзывы, которых не было."
          />

          <ReviewsPageClient />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}