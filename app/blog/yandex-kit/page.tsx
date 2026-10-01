import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ButtonLink } from "@/components/ui";
import { getByCategory, getReadingTime } from "@/data/articles";
import { sellerLinks } from "@/data/sellers";
import { ArrowRight, Clock, ExternalLink } from "lucide-react";
import { KIT_DOC_URL } from "@/data/yandexKit";

export const metadata: Metadata = {
  title: "Яндекс KIT: база знаний для продавцов",
  description:
    "Практическая база знаний по Яндекс KIT: что умеет платформа, как перенести каталог, настроить SEO и запустить магазин. С ограничениями и подводными камнями.",
  alternates: { canonical: "/blog/yandex-kit" },
  openGraph: {
    title: "Яндекс KIT: база знаний для продавцов",
    description:
      "Что умеет платформа, как перенести каталог с маркетплейса, какие у неё ограничения и когда магазин не окупится.",
    url: "/blog/yandex-kit",
    // Своя обложка хаба: без неё сниппет в ленте остаётся без
    // картинки, хотя у отдельных статей обложки уже есть.
    images: [
      {
        url: "/blog/yandex-kit-hub.webp",
        alt: "База знаний по Яндекс KIT для продавцов маркетплейсов",
        width: 1200,
        height: 630,
      },
    ],
  },
};

const GROUPS = [
  { title: "Начало работы", question: "Что это и с чего начать", slugs: ["chto-takoe-yandex-kit", "kak-sozdat-magazin"] },
  { title: "Каталог и товары", question: "Как перенести и настроить", slugs: ["perenos-tovarov"] },
  { title: "Продвижение", question: "Как привести покупателей", slugs: ["seo-dlya-yandex-kit"] },
  { title: "Отзывы и доверие", question: "Как перенести отзывы с маркетплейса", slugs: ["otzyvy-iz-yandex-marketa"] },
  { title: "Экономика", question: "Сколько стоит и когда окупится", slugs: ["skolko-stoit-i-skolko-vremeni", "dlya-sellerov-wildberries"] },
  { title: "Проверка", question: "Что проверить перед публикацией", slugs: ["checklist-zapuska"] },
] as const;
export default function YandexKitHub() {
  const kitArticles = getByCategory("yandex-kit");

  return (
    <main>
      <SiteHeader ctaLabel="Рассчитать потенциал" ctaHref="/yandex-kit#estimate" />
      <section className="section-pad pt-8 sm:pt-10">
        <div className="container-wide">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Полезное", href: "/blog" },
              { label: "Яндекс KIT" },
            ]}
          />

          <div className="mx-auto max-w-3xl text-center">
            <span className="pill-sm bg-primary-soft text-primary">База знаний</span>
            <h1
              className="mt-4 font-display font-bold leading-[0.98] text-foreground"
              style={{ fontSize: "clamp(1.9rem, 5cqi, 3.4rem)" }}
            >
              Яндекс KIT: от первого шага до запуска
            </h1>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              Что умеет платформа, как перенести каталог с маркетплейса, какие у неё
              ограничения и в каком случае магазин не окупится. Материалы опираются на
              официальную справку Яндекса, но отвечают на вопрос «зачем это продавцу», а
              не «где нажать кнопку».
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <ButtonLink href={sellerLinks.potential}>Рассчитать потенциал</ButtonLink>
              <a
                href={KIT_DOC_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground underline underline-offset-4 hover:text-primary"
              >
                Официальная справка Яндекса
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Группы выстроены в реальном порядке работы продавца,
              а не по алфавиту. */}
          <div className="mx-auto mt-14 max-w-4xl space-y-10">
            {GROUPS.map((group) => {
              const items = group.slugs
                .map((slug) => kitArticles.find((a) => a.slug === slug))
                .filter((a): a is (typeof kitArticles)[number] => Boolean(a));
              if (items.length === 0) return null;
              return (
                <div key={group.title}>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h2 className="font-display text-xl font-bold text-foreground">
                      {group.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">{group.question}</p>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {items.map((article) => (
                      <Link
                        key={article.slug}
                        href={`/blog/${article.slug}`}
                        className="card-base card-lift group flex flex-col p-5"
                      >
                        <p className="font-display text-base font-bold leading-snug text-foreground">
                          {article.title}
                        </p>
                        <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                          {article.description}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {getReadingTime(article)} мин
                          <ArrowRight className="h-3.5 w-3.5 text-primary transition group-hover:translate-x-1" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Маршрут из чтения в заявку: без него база знаний остаётся
              справочником, и человек уходит, ничего не купив. */}
          <div className="mx-auto mt-14 max-w-4xl">
            <div className="rounded-[1.75rem] bg-premium p-6 text-center sm:p-8">
              <h2 className="font-display text-xl font-bold text-white">
                Разобрались — посчитаем ваш запуск
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/80">
                Оценим объём работ по вашему каталогу: что переносится напрямую, что
                придётся переделывать и что имеет смысл делать в первую очередь.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <ButtonLink href="/yandex-kit#estimate" className="w-full sm:w-auto">
                  Посчитать стоимость
                </ButtonLink>
                <Link
                  href="/yandex-kit"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto"
                >
                  Всё о запуске магазина
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}