/**
 * Карта пути клиента с местами потерь.
 *
 * Фирменная визуальная метафора ШАРиК digital: данные → система →
 * действие → результат. Главная идея схемы — показать не «как
 * должно быть», а где именно бизнес теряет деньги: каждый этап
 * сужается, а потери уходят вбок отдельным элементом.
 *
 * Числа намеренно не выдумываются: `share` — доля от предыдущего
 * этапа в процентах. Если её не передать, этап рисуется без процента,
 * и это честнее, чем рисовать правдоподобную воронку из воздуха.
 */

export type JourneyStage = {
  /** Название этапа: «Трафик», «Визит», «Обращение». */
  label: string;
  /** Доля от предыдущего этапа в процентах. */
  share?: number;
  /** Что именно теряется на этом переходе. */
  loss?: string;
  /** Короткий комментарий, что делаем с этапом. */
  hint?: string;
};

export function JourneyMap({
  stages,
  legend = "Типовой путь: где обычно теряются клиенты",
}: {
  stages: ReadonlyArray<JourneyStage>;
  legend?: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-border bg-white p-5 shadow-xl shadow-black/5 sm:p-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <p className="text-sm font-bold text-foreground">Путь клиента и точки потерь</p>
        <p className="text-xs text-muted-foreground">{legend}</p>
      </div>

      <ol className="space-y-3">
        {stages.map((stage, i) => (
          <li key={stage.label} className="relative">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft font-display text-xs font-bold text-primary">
                {i + 1}
              </span>

              <span className="font-display text-sm font-bold text-foreground sm:text-base">
                {stage.label}
              </span>

              {stage.share !== undefined && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  {stage.share} %
                </span>
              )}

              <span
                className="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-muted sm:block"
                aria-hidden="true"
              >
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: stage.share === undefined ? 100 : Math.max(stage.share, 4) + "%" }}
                />
              </span>
            </div>

            {stage.hint && <p className="mt-1 pl-11 text-xs text-muted-foreground">{stage.hint}</p>}

            {stage.loss && (
              <p className="mt-2 flex items-start gap-2 rounded-xl border-l-4 border-destructive bg-destructive/5 px-3 py-2 pl-11 text-xs text-foreground">
                <span
                  className="mt-0.5 shrink-0 rounded bg-destructive px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                  aria-hidden="true"
                >
                  потеря
                </span>
                <span>{stage.loss}</span>
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
