/**
 * Коммерческий маршрут: как человек попадает на заявку.
 *
 * Показываем два входа — из поиска и с главной — и то, что они сходятся
 * в одном месте. Это честнее, чем «воронка» с процентами: путь
 * показан целиком, включая точку, где клиент принимает решение.
 */

type Step = { label: string; note?: string };

export function CommercialRoute() {
  const organic: Step[] = [
    { label: "Поиск", note: "Яндекс или Google" },
    { label: "Статья", note: "отвечает на вопрос" },
    { label: "Яндекс KIT", note: "показываем решение" },
    { label: "Расчёт", note: "собственный калькулятор" },
    { label: "Заявка", note: "попадает к нам" },
  ];

  const direct: Step[] = [
    { label: "Главная", note: "по рекламе или из закладок" },
    { label: "Селлерам", note: "своё направление" },
    { label: "Яндекс KIT", note: "коммерческая страница" },
    { label: "Расчёт", note: "собственный калькулятор" },
    { label: "Заявка", note: "попадает к нам" },
  ];

  const row = (route: Step[]) => (
    <ol className="flex flex-wrap items-stretch gap-2">
      {route.map((step, i) => (
        <li key={step.label} className="flex min-w-[7.5rem] flex-1 items-center gap-2">
          <div
            className={
              "w-full rounded-xl border px-3 py-2.5 " +
              (i === route.length - 1
                ? "border-primary bg-primary-soft"
                : "border-border bg-white")
            }
          >
            <p className="font-display text-sm font-bold text-foreground">{step.label}</p>
            {step.note && <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{step.note}</p>}
          </div>
          {i < route.length - 1 && (
            <span className="shrink-0 text-muted-foreground" aria-hidden="true">
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );

  return (
    <div className="rounded-[1.75rem] border border-border bg-white p-5 shadow-xl shadow-black/5 sm:p-7">
      <div className="mb-6 border-b border-border pb-4">
        <p className="text-sm font-bold text-foreground">Как устроен путь до заявки</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Два входа — из поиска и с главной. Оба заканчиваются калькулятором и заявкой.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Из поиска
          </p>
          {row(organic)}
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            С главной
          </p>
          {row(direct)}
        </div>
      </div>
    </div>
  );
}
