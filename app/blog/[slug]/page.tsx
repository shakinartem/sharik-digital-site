import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ArticleBody, SourceNote } from "@/components/ArticleBody";
import { ButtonLink } from "@/components/ui";
import { getCase } from "@/data/cases";
import { articles, getArticle, getRelated, getHeadings, getReadingTime, CATEGORY_LABELS } from "@/data/articles";
import { ArrowRight, Briefcase, Clock, Calendar } from "lucide-react";

/**
 * Один маршрут на все статьи.
 *
 * Статьи лежат в data/articles.ts, а страницы под каждую тему больше
 * не создаются: generateStaticParams разворачивает их на этапе сборки.
 * Раньше на каждую статью был отдельный файл с копией разметки — при
 * добавлении материала это означало дублирование кода.
 *
 * Статический экспорт (output: "export") требует, чтобы все параметры
 * были известны заранее, поэтому generateStaticParams обязателен.
 */
export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);
  if (!article) return {};
  // Своя обложка статьи вместо общего og-default: в ленте материалы
  // должны различаться, иначе сниппеты выглядят одинаково.
  const ogImage = article.image ?? "/og-default.png";
  const ogAlt = article.imageAlt ?? article.title;
  return {
    title: article.seoTitle,
    description: article.description,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title: article.seoTitle,
      description: article.description,
      url: `/blog/${article.slug}`,
      type: "article",
      publishedTime: article.date,
      modifiedTime: article.updatedAt ?? article.date,
      images: [{ url: ogImage, alt: ogAlt, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.seoTitle,
      description: article.description,
      images: [{ url: ogImage, alt: ogAlt }],
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);
  if (!article) notFound();

  const related = getRelated(article.related);
  const headings = getHeadings(article);
  const readingTime = getReadingTime(article);
  const isHub = article.category === "yandex-kit";
  // Кейс, по которому написана статья. Может отсутствовать, если статья
  // обычная или кейс удалили из контента.
  const caseItem = article.caseId ? getCase(article.caseId) : undefined;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.updatedAt ?? article.date,
    author: { "@type": "Organization", name: "ШАРиК digital" },
    publisher: { "@type": "Organization", name: "ШАРиК digital" },
    mainEntityOfPage: `https://sharik-digital.ru/blog/${article.slug}`,
    keywords: article.tags.join(", "),
    // Обложка в разметке: поиск берёт изображение из схемы,
    // а og:image учитывает не везде.
    ...(article.image
      ? {
          image: {
            "@type": "ImageObject",
            url: `https://sharik-digital.ru${article.image}`,
            width: 1200,
            height: 630,
            caption: article.imageAlt ?? article.title,
          },
        }
      : {}),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <SiteHeader />

      <article className="section-pad pt-8 sm:pt-10">
        <div className="container-wide">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              ...(isHub
                ? [
                    { label: "Полезное", href: "/blog" },
                    { label: "Яндекс KIT", href: "/blog/yandex-kit" },
                  ]
                : [{ label: "Полезное", href: "/blog" }]),
              { label: article.title },
            ]}
          />

          <div className="grid gap-10 lg:grid-cols-[1fr_260px] lg:gap-14">
            <div className="min-w-0">
              <span className="pill-sm bg-primary-soft text-primary">
                {CATEGORY_LABELS[article.category]}
              </span>
              <h1
                className="mt-4 font-display font-bold leading-[1.05] text-foreground"
                style={{ fontSize: "clamp(1.75rem, 4.5cqi, 3rem)" }}
              >
                {article.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                {article.description}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Опубликовано {formatDate(article.date)}
                </span>
                {article.updatedAt && (
                  <span className="inline-flex items-center gap-1.5 font-bold text-primary">
                    Обновлено {formatDate(article.updatedAt)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {readingTime} мин чтения
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span key={tag} className="pill-sm">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Обложка материала. Та же картинка уходит в og:image,
                  поэтому alt обязателен: без него изображение
                  недоступно и для скринридера, и для поиска. */}
              {article.image && (
                <figure className="mt-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.image}
                    alt={article.imageAlt ?? article.title}
                    width={1200}
                    height={630}
                    className="w-full rounded-card border border-border"
                  />
                </figure>
              )}

              <hr className="my-10 border-border" />

              {/* Статья по кейсу: показываем, из какого проекта она
                  выросла. Ссылка ведёт на /cases — отдельной страницы
                  кейса пока нет, а сам кейс открывается в модалке. */}
              {caseItem && (
                <Link
                  href="/cases"
                  className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-border bg-muted p-5 transition hover:border-primary/40"
                >
                  <span className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 shrink-0 text-primary" />
                    <span>
                      <span className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Материал по кейсу
                      </span>
                      <span className="block font-display text-base font-bold text-foreground">
                        {caseItem.title}
                      </span>
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {caseItem.mainResult}
                  </span>
                </Link>
              )}

              <ArticleBody blocks={article.blocks} />

              {article.sourceUrl && article.sourceLabel && (
                <SourceNote url={article.sourceUrl} label={article.sourceLabel} />
              )}

              {/* Коммерческий CTA. Текст под каждую статью свой: одна
                  кнопка «Получить расчёт» на всех страницах не работает —
                  человеку нужна следующая подсказка по его вопросу. */}
              <div className="mt-12 rounded-[1.75rem] bg-premium p-6 sm:p-8">
                <h2 className="font-display text-xl font-bold text-white">
                  {article.cta.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/80">{article.cta.text}</p>
                <div className="mt-5">
                  <ButtonLink href={article.cta.href}>{article.cta.label}</ButtonLink>
                </div>
                <p className="mt-4 text-xs text-white/60">
                  Сначала посмотрим на вашу ситуацию — без обязательств запускать проект.
                </p>
              </div>

              {related.length > 0 && (
                <section className="mt-14">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Читайте также
                  </h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {related.map((r) => (
                      <Link
                        key={r.slug}
                        href={`/blog/${r.slug}`}
                        className="card-base card-lift group flex flex-col p-5"
                      >
                        <span className="text-xs font-bold text-primary">
                          {CATEGORY_LABELS[r.category]}
                        </span>
                        <span className="mt-2 flex-1 text-sm font-bold leading-6 text-foreground">
                          {r.title}
                        </span>
                        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                          Читать
                          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Оглавление. Собирается из H2, поэтому не расходится с текстом. */}
            {headings.length > 2 && (
              <aside className="hidden lg:block">
                <div className="sticky top-28">
                  <p className="font-display text-sm font-bold text-foreground">
                    В этой статье
                  </p>
                  <nav className="mt-4">
                    <ul className="space-y-2.5 border-l border-border pl-4">
                      {headings.map((h) => (
                        <li key={h.id}>
                          <a
                            href={`#${h.id}`}
                            className="text-sm leading-5 text-muted-foreground transition hover:text-primary"
                          >
                            {h.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </aside>
            )}
          </div>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}