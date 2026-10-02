"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, Quote } from "lucide-react";
import { reviews } from "@/data/reviews";
import { getCase } from "@/data/cases";
import { ReviewCard } from "@/components/ReviewCard";

/**
 * Тело страницы отзывов: фильтр по нише и сетка карточек.
 *
 * Вынесено в отдельный клиентский компонент, потому что фильтр требует
 * состояния, а сама страница с метаданными должна оставаться серверной.
 */
export function ReviewsPageClient() {
  // «Все» плюс ниши, которые реально встречаются в отзывах. Порядок
  // берётся из данных, а не из ручного списка: добавили отзыв с новой
  // нишей — фильтр её сам подхватит.
  const niches = useMemo(() => {
    const unique = new Set(
      reviews.map((r) => r.niche).filter((n): n is string => Boolean(n)),
    );
    return ["", ...Array.from(unique).sort((a, b) => a.localeCompare(b, "ru"))];
  }, []);

  const [niche, setNiche] = useState("");
  const visible = niche ? reviews.filter((r) => r.niche === niche) : reviews;

  return (
    <>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {niches.map((value) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => setNiche(value)}
            aria-pressed={niche === value}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              niche === value
                ? "border-primary bg-primary text-white"
                : "border-border bg-white text-foreground hover:border-primary/40"
            }`}
          >
            {value || "Все"}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Показано {visible.length} из {reviews.length}
      </p>

      <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((review) => {
          // Ссылка на кейс есть не у каждого отзыва: показываем её
          // только когда кейс реально заведён, иначе получился бы
          // битый переход.
          const caseItem = review.caseId ? getCase(review.caseId) : undefined;
          return (
            <li key={review.id} className="flex flex-col">
              <ReviewCard review={review} />
              {caseItem && (
                <Link
                  href="/cases"
                  className="cta-link mt-3 inline-flex items-center gap-2 self-start text-sm font-semibold"
                >
                  <Briefcase className="h-4 w-4" />
                  Кейс: {caseItem.title}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-12 rounded-[1.75rem] border border-primary/25 bg-primary-soft p-8 text-center">
        <Quote className="mx-auto h-7 w-7 text-primary" />
        <h2 className="mt-4 font-display text-2xl font-bold text-foreground">
          Хотите такой же результат?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Разберём вашу ситуацию так же, как разбирали эти проекты: посчитаем,
          где теряются обращения, и покажем, с чего начать.
        </p>
        <Link href="/contacts" className="btn-primary mt-6">
          Обсудить задачу
        </Link>
      </div>
    </>
  );
}