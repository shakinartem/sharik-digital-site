/**
 * Визуальная панель для Hero главной.
 *
 * Это схема digital-системы, а не фотография: покупатель видит, как
 * трафик превращается в деньги. Все числа — демонстрационные, поэтому
 * блок подписан: чужие результаты выдавать за свои нельзя.
 *
 * Панель собрана на обычных div, без тяжёлых библиотек и картинок:
 * она весит меньше скриншота и остаётся читаемой на любом фоне.
 */
export function SystemDashboard() {
  const stages = [
    { label: "Трафик", value: "24 800", hint: "переходов в месяц", tone: "plain" as const },
    { label: "Система", value: "7 из 7", hint: "контуров настроено", tone: "accent" as const },
    { label: "Конверсия", value: "2,4 %", hint: "из перехода в заказ", tone: "plain" as const },
    { label: "Продажа", value: "595", hint: "заказов в месяц", tone: "plain" as const },
    { label: "Повтор", value: "31 %", hint: "доля повторных", tone: "good" as const },
  ];

  return (
    <div className="w-full" aria-hidden="true">
      <div className="rounded-[1.75rem] border border-border bg-white p-5 shadow-xl shadow-black/5 sm:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-xs font-bold text-foreground">Схема digital-системы</span>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
            Пример
          </span>
        </div>

        <ol className="mt-4 space-y-1.5">
          {stages.map((stage, i) => (
            <li key={stage.label}>
              <div
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors ${
                  stage.tone === "accent"
                    ? "bg-primary text-white"
                    : stage.tone === "good"
                      ? "bg-primary-soft"
                      : "bg-muted"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    stage.tone === "accent" ? "bg-white/20 text-white" : "bg-white text-primary"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`w-24 shrink-0 text-sm font-bold ${
                    stage.tone === "accent" ? "text-white" : "text-foreground"
                  }`}
                >
                  {stage.label}
                </span>
                <span
                  className={`font-display text-lg font-bold tabular-nums ${
                    stage.tone === "accent" ? "text-white" : "text-primary"
                  }`}
                >
                  {stage.value}
                </span>
              </div>
              <p
                className={`pl-11 pt-1 text-[11px] ${
                  stage.tone === "accent" ? "text-white/70" : "text-muted-foreground"
                }`}
              >
                {stage.hint}
              </p>
            </li>
          ))}
        </ol>

        {/* Столбики иллюстрируют повторные продажи. Это схема, а не график
            реальных данных, поэтому подписана отдельно. */}
        <div className="mt-5 rounded-2xl bg-muted p-4">
          <p className="text-[11px] font-bold text-muted-foreground">
            Повторные продажи — модель расчёта
          </p>
          <div className="mt-3 flex items-end gap-2">
            {[38, 52, 66, 82, 100].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md bg-primary/20"
                  style={{ height: `${h * 0.42}px` }}
                >
                  <div
                    className="w-full rounded-t-md bg-primary"
                    style={{ height: `${h * 0.22}px` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">м{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}