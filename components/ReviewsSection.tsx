import { reviews } from "@/data/reviews";

/**
 * Инициалы для аватара-заглушки.
 *
 * Берём первые буквы слов: у «Елена Мария» получится «ЕМ», а не «Е» —
 * так заглушка узнаётся и не путается между авторами.
 */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

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
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                {/* Аватар всегда круглый: без фото показываем инициалы,
                    чтобы не оставлять пустое место. */}
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft font-display text-sm font-bold text-primary">
                  {review.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={review.photo}
                      alt={review.author}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    initials(review.author)
                  )}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-foreground">
                    {review.author}
                  </p>
                  {review.role && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{review.role}</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
