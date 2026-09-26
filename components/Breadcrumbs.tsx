import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

/**
 * Хлебные крошки: видимые, кликабельные и с разметкой BreadcrumbList.
 *
 * Разметка нужна поисковику, чтобы показать структуру сайта в выдаче,
 * а читателю — чтобы вернуться на уровень выше. Последняя крошка — текущая
 * страница, поэтому ссылку не делаем: клик по ней бессмыслен.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `https://sharik-digital.ru${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Хлебные крошки" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={item.label} className="flex items-center gap-1.5">
                {item.href && !isLast ? (
                  <Link href={item.href} className="transition hover:text-primary">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "font-bold text-foreground" : undefined}>
                    {item.label}
                  </span>
                )}
                {!isLast && <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}