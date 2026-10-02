import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ChecklistCta } from "@/components/ChecklistCta";
import { articles, getReadingTime, CATEGORY_LABELS } from "@/data/articles";
import { ArrowRight, Clock, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Полезное о Яндекс KIT и пациентопотоке",
  description:
    "Практические статьи о запуске интернет-магазина на Яндекс KIT, переносе товаров, SEO и о пациентопотоке клиник. Без воды и общих слов.",
  alternates: { canonical: "/blog" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const kitCount = articles.filter((a) => a.category === "yandex-kit").length;
const clinicCount = articles.filter((a) => a.category === "patients").length;

export default function BlogPage() {
  const sorted = [...articles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <main>
      <SiteHeader />
      <section className="section-pad pt-8 sm:pt-10">
        <div className="container-wide">
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Полезное" }]} />

          <div className="mx-auto max-w-3xl text-center">
            <h1
              className="font-display font-bold leading-[0.98] text-foreground"
              style={{ fontSize: "clamp(1.9rem, 5cqi, 3.4rem)" }}
            >
              Полезное о Яндекс KIT и пациентопотоке
            </h1>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              Практические материалы: что делать, где спотыкаются и когда это имеет
              экономический смысл. Без пересказа справки и без обещаний процентов.
            </p>
          </div>

          {/* Хабы ведут вглубь темы. Блог — не новостная лента, а вход
              в два кластера знаний, поэтому он вынесен наверх. */}
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            <Link
              href="/blog/yandex-kit"
              className="card-base card-lift group p-6"
            >
              <p className="text-xs font-bold text-primary">
                База знаний · {kitCount} материалов
              </p>
              <p className="mt-2 font-display text-lg font-bold text-foreground">
                Яндекс KIT: от первого шага до запуска
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Что умеет платформа, как перенести каталог, какие у неё ограничения и
                когда магазин не окупится.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                Открыть базу знаний
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>

            <Link href="/clinics" className="card-base card-lift group p-6">
              <p className="text-xs font-bold text-primary">
                Направление для клиник · {clinicCount} материала
              </p>
              <p className="mt-2 font-display text-lg font-bold text-foreground">
                Пациентопоток и методология 7К
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Где теряются пациенты, как считать индекс пациентопотока и что делать с
                картой потерь.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                Перейти в направление
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          </div>

          <div className="mx-auto mt-14 max-w-3xl">
            <h2 className="font-display text-xl font-bold text-foreground">Все материалы</h2>
            <div className="mt-6 space-y-3">
              {sorted.map((article) => (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className="card-base card-lift group block p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="pill-sm bg-primary-soft text-primary">
                      {CATEGORY_LABELS[article.category]}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(article.date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {getReadingTime(article)} мин
                    </span>
                  </div>
                  <p className="mt-3 font-display text-lg font-bold leading-tight text-foreground">
                    {article.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {article.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                    Читать
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      <ChecklistCta />
      <SiteFooter />
    </main>
  );
}