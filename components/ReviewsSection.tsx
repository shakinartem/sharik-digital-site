"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { reviews, type ReviewItem } from "@/data/reviews";
import { ReviewCard } from "./ReviewCard";

/**
 * Порядок отзывов в слайдере.
 *
 * Задан явно, а не «как попало»: сначала клиенты, чьи кейсы уже
 * показаны на главной, — отзыв должен подтверждать то, что человек
 * только что увидел. Ниже — остальные, до конца списка.
 */
const SLIDER_ORDER = [
  "eurodent",
  "dental-pro",
  "ibradent",
  "interdent",
  "biomed",
  "divina-podology",
  "kerala",
  "arximed-security",
  "po-pyatam",
];

const ordered = SLIDER_ORDER.map((id) => reviews.find((r) => r.id === id)).filter(
  (r): r is ReviewItem => Boolean(r),
);

/**
 * Блок отзывов на главной — слайдер.
 *
 * Раньше здесь была сетка из девяти карточек: она занимала три экрана
 * прокрутки, и ни одна цитата не читалась целиком. Теперь видны три
 * отзыва, остальные листаются стрелками или точками, полный список
 * живёт на /reviews.
 */
export function ReviewsSection() {
  if (reviews.length === 0) return null;

  // Сколько карточек помещается: на телефоне одна, дальше по ширине.
  const [perView, setPerView] = useState(1);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const measure = () => {
      const w = window.innerWidth;
      setPerView(w >= 1024 ? 3 : w >= 640 ? 2 : 1);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // При смене ширины меняется число видимых карточек, и индекс мог
  // выйти за границу — прижимаем его к допустимому.
  const maxIndex = Math.max(0, ordered.length - perView);
  const safeIndex = Math.min(index, maxIndex);
  const pages = Math.max(1, Math.ceil(ordered.length / perView));

  const go = useCallback(
    (next: number) => setIndex(Math.max(0, Math.min(next, maxIndex))),
    [maxIndex],
  );

  return (
    <section id="reviews" className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Отзывы</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Что говорят клиенты
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Письменные отзывы тех, кто уже работал с нами. У каждого — имя,
              должность и измеримый результат.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(safeIndex - 1)}
              disabled={safeIndex === 0}
              aria-label="Предыдущий отзыв"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-foreground transition hover:border-primary/40 disabled:opacity-40 disabled:hover:border-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(safeIndex + 1)}
              disabled={safeIndex >= maxIndex}
              aria-label="Следующий отзыв"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-foreground transition hover:border-primary/40 disabled:opacity-40 disabled:hover:border-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Лента. Все карточки лежат в одной строке и уезжают
            сдвигом: grid с несколькими колонками разложил бы девять
            карточек в три ряда, и overflow-hidden не спрятал бы
            лишние ряды — все отзывы остались бы видны сразу.
            Ширина слайда = 100/perView, поэтому сдвиг на единицу
            ровно переезжает на один отзыв. */}
        <div className="reveal mt-8 -mx-2 overflow-hidden px-2">
          <ul
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${safeIndex * (100 / perView)}%)` }}
          >
            {ordered.map((review) => (
              <li
                key={review.id}
                className="shrink-0 px-2"
                style={{ width: `${100 / perView}%` }}
              >
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal mt-8 flex flex-wrap items-center justify-between gap-6">
          {/* Точка — на страницу, а не на отзыв: при трёх видимых
              карточках и девяти отзывах страниц всего три. */}
          <div className="flex items-center gap-2">
            {Array.from({ length: pages }).map((_, page) => (
              <button
                key={page}
                type="button"
                onClick={() => go(page * perView)}
                aria-label={`Отзывы ${page + 1} из ${pages}`}
                aria-current={page === Math.floor(safeIndex / perView)}
                className={`h-2.5 rounded-full transition-all ${
                  page === Math.floor(safeIndex / perView)
                    ? "w-7 bg-primary"
                    : "w-2.5 bg-border hover:bg-primary/40"
                }`}
              />
            ))}
            <span className="ml-2 text-xs font-semibold text-muted-foreground">
              {safeIndex + 1}–{Math.min(safeIndex + perView, ordered.length)} из{" "}
              {ordered.length}
            </span>
          </div>

          <Link href="/reviews" className="btn-outline">
            <Quote className="h-4 w-4" />
            Все отзывы
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
