"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Дашборд аналитики и заявок.
 *
 * Все числа приходят из /api/admin/stats, который считает их по
 * фактически накопленным событиям. Заглушек и демо-цифр здесь нет:
 * если данных мало, это видно по пустым графикам, и это честнее,
 * чем правдоподобные проценты из воздуха.
 */

type Lead = {
  name?: string;
  clinic?: string;
  city?: string;
  contact?: string;
  comment?: string;
  source?: string;
  page?: string;
  direction?: string;
  ts?: number;
};

type Stats = {
  totals: {
    visitors: number;
    views: number;
    leads: number;
    conversion: number;
    organicShare: number;
    kitViews: number;
  };
  sources: Record<string, number>;
  topPages: { page: string; count: number }[];
  topCtas: { label: string; count: number }[];
  byDay: { day: string; count: number }[];
  funnel: { step: string; value: number }[];
  leads: Lead[];
};

const PERIODS = [
  { days: 1, label: "Сегодня" },
  { days: 7, label: "7 дней" },
  { days: 30, label: "30 дней" },
  { days: 90, label: "90 дней" },
];

/** Русские названия источников вместо внутренних кодов. */
const SOURCE_LABELS: Record<string, string> = {
  yandex: "Яндекс",
  google: "Google",
  telegram: "Telegram",
  vk: "ВКонтакте",
  dzen: "Дзен",
  direct: "Прямые заходы",
  other: "Другие сайты",
};

const DIRECTION_LABELS: Record<string, string> = {
  sellers: "Селлерам",
  clinics: "Клиникам",
  other: "Другое",
};

/** Выгрузка в CSV: разделитель «;» — чтобы открывалось в Excel. */
function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const text = String(cell ?? "");
          return /[";\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
        })
        .join(";"),
    )
    .join("\n");
}

function download(filename: string, content: string) {
  // BOM нужен, чтобы Excel правильно открыл кириллицу.
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
export default function Dashboard({
  token,
  onError,
}: {
  token: string;
  onError: (message: string) => void;
}) {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (period: number) => {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/stats?days=" + period, {
          headers: { Authorization: "Bearer " + token },
        });
        if (!response.ok) throw new Error("Не удалось загрузить статистику");
        setStats((await response.json()) as Stats);
      } catch (error) {
        onError((error as Error).message);
        setStats(null);
      } finally {
        setLoading(false);
      }
    },
    [token, onError],
  );

  useEffect(() => {
    load(days);
  }, [days, load]);

  const card = "rounded-xl border border-neutral-200 bg-white p-5";
  const cardLabel = "text-sm text-neutral-500";
  const cardValue = "mt-1 text-3xl font-bold tabular-nums";

  if (loading && !stats) {
    return <p className="py-10 text-center text-sm text-neutral-500">Загружаю данные…</p>;
  }

  if (!stats) {
    return (
      <p className="rounded-xl bg-red-50 p-6 text-sm text-red-800">
        Статистика недоступна. Проверьте биндинги ANALYTICS и CONTENT — это видно на странице
        /health.
      </p>
    );
  }

  const totals = stats.totals;
  // Ноль вместо деления на ноль и вместо процентов «из воздуха»
  const maxDay = Math.max(...stats.byDay.map((d) => d.count), 1);
  const maxSource = Math.max(...Object.values(stats.sources), 1);
  const sourceEntries = Object.entries(stats.sources).sort((a, b) => b[1] - a[1]);
  const firstStep = stats.funnel[0] ? stats.funnel[0].value : 0;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {PERIODS.map((period) => (
          <button
            key={period.days}
            onClick={() => setDays(period.days)}
            className={
              "rounded-lg px-3 py-1.5 text-sm font-medium " +
              (days === period.days
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-700")
            }
          >
            {period.label}
          </button>
        ))}
        {loading && <span className="text-xs text-neutral-400">обновляю…</span>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className={card}>
          <p className={cardLabel}>Посетители</p>
          <p className={cardValue}>{totals.visitors}</p>
        </div>
        <div className={card}>
          <p className={cardLabel}>Просмотры</p>
          <p className={cardValue}>{totals.views}</p>
        </div>
        <div className={card}>
          <p className={cardLabel}>Заявки</p>
          <p className={cardValue}>{totals.leads}</p>
        </div>
        <div className={card}>
          <p className={cardLabel}>Конверсия</p>
          <p className={cardValue}>{totals.conversion}%</p>
        </div>
        <div className={card}>
          <p className={cardLabel}>Органика</p>
          <p className={cardValue}>{totals.organicShare}%</p>
        </div>
        <div className={card}>
          <p className={cardLabel}>Просмотры KIT</p>
          <p className={cardValue}>{totals.kitViews}</p>
        </div>
      </div>

      {totals.views === 0 && (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          За выбранный период событий ещё нет. Данные появятся, как только на сайт зайдёт первый
          посетитель. Показать нечего — лучше пусто, чем выдуманные цифры.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={card}>
          <h2 className="mb-4 font-semibold">Посещаемость</h2>
          {stats.byDay.length === 0 ? (
            <p className="text-sm text-neutral-400">Нет данных</p>
          ) : (
            <div className="flex h-40 items-end gap-1">
              {stats.byDay.slice(-45).map((d) => (
                <div
                  key={d.day}
                  title={d.day + ": " + d.count}
                  className="flex-1 rounded-t bg-primary/70"
                  // Высота пропорциональна максимуму: столбики
                  // остаются сравнимыми между собой.
                  style={{ height: Math.max((d.count / maxDay) * 100, 3) + "%" }}
                />
              ))}
            </div>
          )}
        </section>

        <section className={card}>
          <h2 className="mb-4 font-semibold">Источники трафика</h2>
          {sourceEntries.length === 0 ? (
            <p className="text-sm text-neutral-400">Нет данных</p>
          ) : (
            <ul className="space-y-2">
              {sourceEntries.map(([source, count]) => (
                <li key={source} className="flex items-center gap-3 text-sm">
                  <span className="w-32 shrink-0 truncate">
                    {SOURCE_LABELS[source] || source}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: (count / maxSource) * 100 + "%" }}
                    />
                  </span>
                  <span className="w-10 shrink-0 text-right tabular-nums">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className={card}>
          <h2 className="mb-4 font-semibold">Воронка сайта</h2>
          <ul className="space-y-1.5">
            {stats.funnel.map((step) => {
              const width = firstStep ? Math.max((step.value / firstStep) * 100, 2) : 2;
              return (
                <li key={step.step}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-neutral-600">{step.step}</span>
                    <span className="font-medium tabular-nums">{step.value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full bg-primary" style={{ width: width + "%" }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={card}>
          <h2 className="mb-4 font-semibold">Нажатия CTA</h2>
          {stats.topCtas.length === 0 ? (
            <p className="text-sm text-neutral-400">Нет данных</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {stats.topCtas.map((cta) => (
                <li key={cta.label} className="flex justify-between gap-3">
                  <span className="truncate text-neutral-600">{cta.label}</span>
                  <span className="font-medium tabular-nums">{cta.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className={card}>
        <h2 className="mb-4 font-semibold">Популярные страницы</h2>
        {stats.topPages.length === 0 ? (
          <p className="text-sm text-neutral-400">Нет данных</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-neutral-500">
                <th className="pb-2 font-normal">Страница</th>
                <th className="pb-2 text-right font-normal">Просмотры</th>
              </tr>
            </thead>
            <tbody>
              {stats.topPages.map((row) => (
                <tr key={row.page} className="border-b last:border-0">
                  <td className="py-1.5 pr-3">
                    <a href={row.page} className="hover:underline">
                      {row.page}
                    </a>
                  </td>
                  <td className="py-1.5 text-right tabular-nums">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section className={card}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Последние заявки</h2>
          {stats.leads.length > 0 && (
            <button
              onClick={() =>
                download(
                  "zayavki-" + new Date().toISOString().slice(0, 10) + ".csv",
                  toCsv([
                    ["Дата", "Имя", "Клиника", "Город", "Контакт", "Направление", "Страница"],
                    ...stats.leads.map((lead) => [
                      lead.ts
                        ? new Date(lead.ts).toISOString().slice(0, 16).replace("T", " ")
                        : "",
                      lead.name || "",
                      lead.clinic || "",
                      lead.city || "",
                      lead.contact || "",
                      DIRECTION_LABELS[lead.direction || "other"] || lead.direction || "",
                      lead.page || "",
                    ]),
                  ]),
                )
              }
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
            >
              Экспорт CSV
            </button>
          )}
        </div>

        {stats.leads.length === 0 ? (
          <p className="text-sm text-neutral-400">Заявок пока нет</p>
        ) : (
          <ul className="divide-y">
            {stats.leads.map((lead, index) => (
              <li key={index} className="py-3">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                  <span className="font-medium">{lead.name || "Без имени"}</span>
                  {lead.clinic && <span className="text-neutral-600">{lead.clinic}</span>}
                  {lead.city && <span className="text-neutral-500">{lead.city}</span>}
                  {lead.direction && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs">
                      {DIRECTION_LABELS[lead.direction] || lead.direction}
                    </span>
                  )}
                  {lead.ts && (
                    <span className="ml-auto text-xs text-neutral-400">
                      {new Date(lead.ts).toISOString().slice(0, 16).replace("T", " ")}
                    </span>
                  )}
                </div>
                {lead.contact && <p className="mt-1 text-sm text-neutral-600">{lead.contact}</p>}
                {lead.comment && <p className="mt-1 text-sm text-neutral-500">{lead.comment}</p>}
                {lead.page && <p className="mt-1 text-xs text-neutral-400">Страница: {lead.page}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}