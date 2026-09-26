"use client";

import { useMemo, useState } from "react";
import { ButtonLink } from "./ui";
import { sellerLinks } from "@/data/sellers";
import { TrendingUp, Wallet, Repeat } from "lucide-react";

type ScenarioKey = "conservative" | "base" | "optimistic";

type Inputs = {
  turnover: number; // текущий оборот, ₽/мес
  avgCheck: number; // средний чек, ₽
  margin: number; // маржа, %
  sku: number; // количество SKU
  repeatShare: number; // доля покупателей с повторной покупкой, %
};

const DEFAULT_INPUTS: Inputs = {
  turnover: 1500000,
  avgCheck: 1800,
  margin: 45,
  sku: 120,
  repeatShare: 30,
};

/**
 * Три сценария показываются одновременно и как диапазон, а не по
 * одному переключаемому числу. Раньше калькулятор выдавал одну
 * псевдоточную цифру («58 заказов, 105 000 ₽, CAC 216 ₽»), которая
 * читалась как обещание. Теперь видно и консервативную, и
 * оптимистичную границу — это честнее и ближе к реальному расчёту.
 */
const SCENARIOS: Record<
  ScenarioKey,
  { label: string; share: number; cvr: number; note: string }
> = {
  conservative: {
    label: "Консервативный",
    share: 0.03,
    cvr: 0.012,
    note: "Нижняя граница: спрос есть, но отдаёт меньше всего",
  },
  base: {
    label: "Базовый",
    share: 0.07,
    cvr: 0.021,
    note: "Рабочий ориентир при нормальной марже",
  },
  optimistic: {
    label: "Оптимистичный",
    share: 0.12,
    cvr: 0.032,
    note: "Верхняя граница: нужен сильный спрос и высокая конверсия",
  },
};

const SCENARIO_ORDER: ScenarioKey[] = ["conservative", "base", "optimistic"];

const fmt = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(n));

/**
 * Расчёт сценарный, а не валидированная модель: доли берутся из
 * отраслевых ориентиров, а не из фактических внедрений, потому что
 * seller-кейсов у нас пока нет. Поэтому результат показывается
 * диапазоном и всегда сопровождается оговоркой.
 */
function calc(inputs: Inputs, s: (typeof SCENARIOS)[ScenarioKey]) {
  const monthlyOrders = inputs.turnover / inputs.avgCheck;
  // Собственный канал перехватывает часть спроса, который сейчас уходит на маркетплейс
  const ownOrders = monthlyOrders * s.share;
  const ownRevenue = ownOrders * inputs.avgCheck;
  const grossProfit = ownRevenue * (inputs.margin / 100);
  // Повторные покупки — то, что маркетплейс ограничивает
  const repeatOrders = ownOrders * (inputs.repeatShare / 100) * 12;
  const repeatRevenue = repeatOrders * inputs.avgCheck;
  const repeatGross = repeatRevenue * (inputs.margin / 100);
  // Ориентировочная стоимость заказа при рекламной доле 12% от выручки
  const monthlyCac = ownOrders > 0 ? (ownRevenue * 0.12) / ownOrders : 0;

  return {
    monthlyOrders,
    ownOrders,
    ownRevenue,
    grossProfit,
    repeatOrders,
    repeatGross,
    monthlyCac,
  };
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-black text-foreground">{label}</span>
        <span className="font-black tabular-nums text-primary">
          {fmt(value)} {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[#760229]"
        aria-label={label}
      />
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        <span>
          {fmt(min)} {suffix}
        </span>
        <span>
          {fmt(max)} {suffix}
        </span>
      </div>
    </label>
  );
}

export function PotentialCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);

  const set = <K extends keyof Inputs>(key: K, value: Inputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const results = useMemo(
    () => SCENARIO_ORDER.map((key) => ({ key, ...calc(inputs, SCENARIOS[key]) })),
    [inputs],
  );
  const conservative = results[0];
  const optimistic = results[2];

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
      <div className="card-base reveal p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Ваши цифры</p>
            <p className="text-xs text-muted-foreground">Подставьте реальные значения продавца</p>
          </div>
        </div>

        <div className="space-y-6">
          <Slider
            label="Оборот сейчас"
            value={inputs.turnover}
            min={100000}
            max={10000000}
            step={50000}
            suffix="₽/мес"
            onChange={(v) => set("turnover", v)}
          />
          <Slider
            label="Средний чек"
            value={inputs.avgCheck}
            min={500}
            max={10000}
            step={100}
            suffix="₽"
            onChange={(v) => set("avgCheck", v)}
          />
          <Slider
            label="Маржа"
            value={inputs.margin}
            min={10}
            max={80}
            step={1}
            suffix="%"
            onChange={(v) => set("margin", v)}
          />
          <Slider
            label="Количество SKU"
            value={inputs.sku}
            min={1}
            max={2000}
            step={1}
            suffix=""
            onChange={(v) => set("sku", v)}
          />
          <Slider
            label="Доля повторных покупок"
            value={inputs.repeatShare}
            min={0}
            max={70}
            step={5}
            suffix="%"
            onChange={(v) => set("repeatShare", v)}
          />
        </div>
      </div>

      <div className="card-base reveal reveal-delay-1 overflow-hidden">
        <div className="border-b border-border p-6 sm:p-8">
          <p className="font-display text-lg font-bold text-foreground">
            Предварительный расчёт потенциала
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Диапазон по трём сценариям, а не одна точная цифра
          </p>
        </div>

        <div className="space-y-5 p-6 sm:p-8">
          <div className="rounded-2xl bg-primary-soft p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Заказы в своём канале в месяц
            </p>
            <p
              className="mt-1 font-display font-bold leading-none text-foreground"
              style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}
            >
              {fmt(conservative.ownOrders)} — {fmt(optimistic.ownOrders)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Из {fmt(conservative.monthlyOrders)} заказов в месяц сейчас
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {results.map(({ key, ...r }) => {
              const s = SCENARIOS[key];
              const isBase = key === "base";
              return (
                <div
                  key={key}
                  className={`rounded-2xl border p-4 ${
                    isBase ? "border-primary/30 bg-primary-soft" : "border-border bg-muted"
                  }`}
                >
                  <p className="text-xs font-bold text-foreground">{s.label}</p>
                  <p className="mt-1 font-display text-xl font-bold text-foreground">
                    {fmt(r.ownOrders)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">заказов/мес</p>
                  <p className="mt-2 text-[11px] font-semibold text-primary">
                    {fmt(r.ownRevenue)} ₽ выручка
                  </p>
                  <p className="mt-2 text-[11px] leading-4 text-muted-foreground">{s.note}</p>
                </div>
              );
            })}
          </div>

          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted p-4">
              <dt className="text-xs font-bold text-muted-foreground">Валовая прибыль (база)</dt>
              <dd className="mt-1 font-display text-base font-bold text-foreground">
                {fmt(results[1].grossProfit)} ₽/мес
              </dd>
            </div>
            <div className="rounded-2xl bg-muted p-4">
              <dt className="text-xs font-bold text-muted-foreground">Ориентир стоимости заказа</dt>
              <dd className="mt-1 font-display text-base font-bold text-foreground">
                {fmt(results[1].monthlyCac)} ₽
              </dd>
            </div>
            <div className="rounded-2xl bg-muted p-4">
              <dt className="text-xs font-bold text-muted-foreground">Повторных заказов в год</dt>
              <dd className="mt-1 font-display text-base font-bold text-foreground">
                {fmt(conservative.repeatOrders)} — {fmt(optimistic.repeatOrders)}
              </dd>
            </div>
            <div className="rounded-2xl bg-muted p-4">
              <dt className="text-xs font-bold text-muted-foreground">Прибыль от повторов в год</dt>
              <dd className="mt-1 font-display text-base font-bold text-primary">
                {fmt(conservative.repeatGross)} — {fmt(optimistic.repeatGross)} ₽
              </dd>
            </div>
          </dl>

          <div className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4">
            <Repeat className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs leading-5 text-muted-foreground">
              Повторные продажи на маркетплейсе ограничены правилами и инфраструктурой
              площадки. Собственный канал даёт больше возможностей управлять ими.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-muted p-4">
            <p className="flex items-center gap-2 text-xs font-bold text-primary">
              <TrendingUp className="h-4 w-4" />
              Это сценарная оценка, а не гарантия
            </p>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
              Расчёт зависит от исходных данных, категории, маржинальности, стоимости
              привлечения и конверсии. Точный расчёт по вашим цифрам делаем в Seller Growth
              Report.
            </p>
          </div>

          <div className="rounded-2xl bg-premium p-5 text-white">
            <p className="font-display text-base font-bold">
              Хотите получить полноценный расчёт экономики?
            </p>
            <p className="mt-1.5 text-xs leading-5 text-white/75">
              Разберём ассортимент по SKU, проверим спрос в поиске и посчитаем сценарии по
              вашим реальным цифрам.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={sellerLinks.potential} className="w-full sm:w-auto">
                Получить Seller Growth Report
              </ButtonLink>
              <a
                href={sellerLinks.launch}
                className="inline-flex w-full items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto"
              >
                Запустить KIT
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
