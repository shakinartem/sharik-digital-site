/**
 * Компактная схема потока: маркетплейс → магазин → трафик → заказ → повтор.
 *
 * Раньше на странице продавцов было две почти одинаковые большие схемы
 * («Модель» и «Процесс»), которые дублировали друг друга. Теперь одна
 * минималистичная схема показывает логику системы, а этапы работы
 * живут отдельным коротким списком.
 *
 * На мобильных шаги выстраиваются вертикально, на десктопе — в строку
 * со стрелками. Схема помечена aria-hidden и дублируется текстом в HTML,
 * поэтому для скринридеров она не читается как «кириллица из картинки».
 */
export function FlowScheme({
  steps,
  compact = false,
}: {
  steps: ReadonlyArray<{ title: string; detail?: string }>;
  compact?: boolean;
}) {
  return (
    <ol className="mt-6 space-y-2 lg:flex lg:items-stretch lg:gap-2 lg:space-y-0">
      {steps.map((step, i) => (
        <li key={step.title} className="relative flex-1">
          <div className="flex items-center gap-3 lg:block">
            <span
              className={`flex shrink-0 items-center justify-center rounded-xl bg-primary-soft font-display font-bold text-primary ${
                compact ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"
              }`}
            >
              {i + 1}
            </span>
            <div
              className={`min-w-0 flex-1 rounded-2xl border border-border bg-muted ${
                compact ? "px-3 py-2.5" : "px-4 py-3"
              }`}
            >
              <p className="font-display text-sm font-bold text-foreground">{step.title}</p>
              {step.detail && (
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{step.detail}</p>
              )}
            </div>
          </div>
          {i < steps.length - 1 && (
            <span
              className="absolute left-5 top-full h-2 w-px bg-border lg:left-auto lg:right-[-0.5rem] lg:top-1/2 lg:h-px lg:w-2 lg:-translate-y-1/2"
              aria-hidden="true"
            />
          )}
        </li>
      ))}
    </ol>
  );
}