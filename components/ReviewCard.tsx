import { type ReviewItem } from "@/data/reviews";

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

/** Аватар: фото, если есть, иначе инициалы. */
export function ReviewAvatar({ review }: { review: ReviewItem }) {
  return (
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
  );
}

/**
 * Карточка отзыва. Одна вёрстка на всех экранах: слайдер на главной,
 * сетка на /reviews, блок внутри кейса и статьи.
 */
export function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <article className="flex h-full flex-col rounded-[1.75rem] border border-border bg-white p-6 shadow-card">
      <p className="flex-1 text-sm leading-6 text-foreground">«{review.text}»</p>
      {review.result && (
        <p className="mt-4 rounded-xl bg-primary-soft px-3 py-2 text-sm font-semibold text-primary">
          {review.result}
        </p>
      )}
      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        <ReviewAvatar review={review} />
        <div className="min-w-0">
          <p className="font-display text-sm font-bold text-foreground">
            {review.author}
          </p>
          {review.role && (
            <p className="mt-0.5 text-xs text-muted-foreground">{review.role}</p>
          )}
        </div>
      </div>
    </article>
  );
}