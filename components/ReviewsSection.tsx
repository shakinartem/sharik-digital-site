import { reviews } from "@/data/reviews";

/**
 * Отзывы клиентов.
 *
 * Пока отзывов нет, блок не выводится вообще. Это осознанно: пустая
 * секция с заголовком «Отзывы» и нулём карточек выглядит как
 * недоделка, а придуманные цитаты — как враньё. Отзывы добавляются
 * через админку (/admin → Отзывы) и появляются здесь сразу.
 */
export function ReviewsSection() {
  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Отзывы</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Что говорят клиенты
          </h2>
        </div>

        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <li
              key={review.id}
              className="reveal flex h-full flex-col rounded-[1.75rem] border border-border bg-white p-6 shadow-card"
              style={{ transitionDelay: `${Math.min(i, 5) * 60}ms` }}
            >
              <p className="flex-1 text-sm leading-6 text-foreground">«{review.text}»</p>
              {review.result && (
                <p className="mt-4 rounded-xl bg-primary-soft px-3 py-2 text-sm font-semibold text-primary">
                  {review.result}
                </p>
              )}
              <div className="mt-5 border-t border-border pt-4">
                <p className="font-display text-sm font-bold text-foreground">{review.author}</p>
                {review.role && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{review.role}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
