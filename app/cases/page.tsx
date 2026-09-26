"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionTitle } from "@/components/ui";
import { cases } from "@/data/cases";
import { site } from "@/data/site";

/**
 * Страница кейсов. Фильтр ведётся по направлению (Селлерам / Клиникам),
 * а не по нише. Категория «Селлерам» намеренно пустая: направление новое,
 * и вместо выдуманных кейсов показывается честная плашка с переходом
 * к расчёту потенциала.
 */
type Filter = "all" | "sellers" | "clinic" | "other";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "sellers", label: "Селлерам" },
  { key: "clinic", label: "Клиникам" },
  { key: "other", label: "Другое" },
];

export default function CasesPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    if (filter === "all") return cases;
    if (filter === "sellers") return [];
    return cases.filter((item) => item.direction === filter);
  }, [filter]);

  return (
    <main className="overflow-x-hidden">
      <SiteHeader ctaLabel="Обсудить задачу" ctaHref="/contacts" />

      <section className="section-pad pt-12 sm:pt-16">
        <div className="container-wide">
          <SectionTitle
            kicker="Кейсы"
            title="Что получилось у клиник"
            text="Каждый кейс — это конкретная задача, конкретные действия и измеримый результат. Мы не приписываем кейсам то, чего не делали."
          />

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                aria-pressed={filter === item.key}
                className={`rounded-full border px-5 py-2 text-sm font-bold transition ${
                  filter === item.key
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-foreground hover:border-primary/40"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-muted-foreground">
            Показано {visible.length} из {cases.length}. Кейсов по продавцам маркетплейсов
            пока нет — мы не публикуем выдуманные истории ради красивого портфолио.
          </p>

          {filter === "sellers" ? (
            <div className="mx-auto mt-10 max-w-3xl rounded-[1.75rem] border border-primary/25 bg-primary-soft p-8 text-center">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Новое направление
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                Развиваем собственный канал продаж для селлеров. Первые проекты
                формируются — кейсов на эту вертикаль пока нет. Как только появятся
                первые клиенты и подтверждённая экономика, опубликуем их здесь.
              </p>
              <Link href="/sellers#potential" className="btn-primary mt-6">
                Посмотреть, как считаем потенциал
              </Link>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((item) => (
              <article key={item.id} className="card-base card-lift flex flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">
                      {item.niche}
                    </p>
                    <h2 className="mt-1 font-display text-xl font-bold leading-tight text-foreground">
                      {item.title}
                    </h2>
                  </div>
                  {item.direction === "other" && (
                    <span className="pill-sm shrink-0 bg-muted text-muted-foreground">Другое</span>
                  )}
                </div>

                <p className="mt-4 text-sm font-semibold leading-6 text-foreground">
                  {item.mainResult}
                </p>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
                  {item.shortDescription}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="pill-sm">
                      {tag}
                    </span>
                  ))}
                </div>

                <a
                  href={site.links.caseLink(item.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="cta-link mt-6 text-sm"
                >
                  Хочу похожий результат
                  <ArrowRight className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
          )}
        </div>
      </section>

      <section className="section-pad bg-muted">
        <div className="container-wide">
          <div className="card-base p-8 text-center sm:p-12">
            <h2 className="font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl">
              Не нашли похожую задачу?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              Разберём вашу ситуацию так же, как разбирали эти: посчитаем, где теряются деньги, и
              покажем, с чего начать.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/clinics" className="btn-primary w-full sm:w-auto">
                Клиникам
              </Link>
              <Link href="/sellers" className="btn-outline w-full sm:w-auto">
                Продавцам
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
