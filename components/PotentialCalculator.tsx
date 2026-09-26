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
  repeatShare: number; // доля покупателей с повторной покупкой, %
};

const DEFAULT_INPUTS: Inputs = {
  turnover: 1500000,
  avgCheck: 1800,
  margin: 45,
  repeatShare: 30,
};

const SCENARIOS: Record<ScenarioKey, { label: string; share: number; cvr: number }> = {
  conservative: { label: "Осторожный", share: 0.03, cvr: 0.012 },
  base: { label: "Базовый", share: 0.07, cvr: 0.021 },
  optimistic: { label: "Оптимистичный", share: 0.12, cvr: 0.032 },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(n));

function calc(inputs: Inputs, s: (typeof SCENARIOS)[ScenarioKey]) {
  const monthlyOrders = inputs.turnover / inputs.avgCheck;
  // Собственный канал перехватывает часть спроса, который сейчас уходит на маркетплейс
  const ownOrders = monthlyOrders * s.share;
  const ownRevenue = ownOrders * inputs.avgCheck;
  const grossProfit = ownRevenue * (inputs.margin / 100);
  // Повторные покупки — то, что маркетплейс забрать не даёт
  const repeatOrders = ownOrders * (inputs.repeatShare / 100) * 12;
  const repeatRevenue = repeatOrders * inputs.avgCheck;
  const repeatGross = repeatRevenue * (inputs.margin / 100);
  // Ориентировочная стоимость заказа при рекламной доле 12% от выручки
  const monthlyCac = ownOrders > 0 ? (ownRevenue * 0.12) / ownOrders : 0;

  return { monthlyOrders, ownOrders, ownRevenue, grossProfit, repeatOrders, repeatGross, monthlyCac };
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
  const [scenario, setScenario] = useState<ScenarioKey>("base");

  const set = <K extends keyof Inputs>(key: K, value: Inputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(() => calc(inputs, SCENARIOS[scenario]), [inputs, scenario]);
  const barWidth = Math.min(
    100,
    (result.ownOrders / Math.max(1, result.monthlyOrders)) * 100 * 8.5,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
      <div className="card-base reveal p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black text-foreground">Ваши цифры</p>
            <p className="text-xs text-muted-foreground">Подставьте реальные значения продавца</p>
          </div>
        </div>

        <div className="space-y-6">
          <Slider label="Оборот сейчас" value={inputs.turnover} min={100000} max={10000000} step={50000} suffix="₽/мес" onChange={(v) => set("turnover", v)} />
          <Slider label="Средний чек" value={inputs.avgCheck} min={500} max={10000} step={100} suffix="₽" onChange={(v) => set("avgCheck", v)} />
          <Slider label="Маржа" value={inputs.margin} min={10} max={80} step={1} suffix="%" onChange={(v) => set("margin", v)} />
          <Slider label="Доля повторных покупок" value={inputs.repeatShare} min={0} max={70} step={5} suffix="%" onChange={(v) => set("repeatShare", v)} />
        </div>
      </div>

      <div className="card-base reveal reveal-delay-1 overflow-hidden">
        <div className="border-b border-border p-6 sm:p-8">
          <p className="text-sm font-black text-foreground">Сценарная оценка</p>
          <p className="mt-1 text-xs text-muted-foreground">Три варианта, а не одна магическая цифра</p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => {
              const active = scenario === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setScenario(key)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    active ? "border-primary bg-primary text-white" : "border-border bg-white text-foreground hover:border-primary/40"
                  }`}
                  aria-pressed={active}
                >
                  {SCENARIOS[key].label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-5 p-6 sm:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
              Заказы в своём канале в месяц
            </p>
            <p className="mt-1 font-black leading-none text-foreground" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
              {fmt(result.ownOrders)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              из {fmt(result.monthlyOrders)} заказов в месяц сейчас
            </p>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${barWidth}%` }} />
          </div>

          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted p-4">
              <dt className="text-xs font-black text-muted-foreground">Выручка канала</dt>
              <dd className="mt-1 font-black text-foreground">{fmt(result.ownRevenue)} ₽/мес</dd>
            </div>
            <div className="rounded-2xl bg-muted p-4">
              <dt className="text-xs font-black text-muted-foreground">Валовая прибыль</dt>
              <dd className="mt-1 font-black text-foreground">{fmt(result.grossProfit)} ₽/мес</dd>
            </div>
            <div className="rounded-2xl bg-muted p-4">
              <dt className="text-xs font-black text-muted-foreground">Повторных заказов в год</dt>
              <dd className="mt-1 font-black text-foreground">{fmt(result.repeatOrders)}</dd>
            </div>
            <div className="rounded-2xl bg-muted p-4">
              <dt className="text-xs font-black text-muted-foreground">Прибыль от повторов в год</dt>
              <dd className="mt-1 font-black text-primary">{fmt(result.repeatGross)} ₽</dd>
            </div>
          </dl>

          <div className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4">
            <Repeat className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs leading-5 text-muted-foreground">
              Ориентировочная стоимость привлечения — {fmt(result.monthlyCac)} ₽ за заказ при
              рекламной доле 12%. На маркетплейсе повторную покупку оплатить нельзя: площадка
              забирает клиента после сделки.
            </p>
          </div>

          <div className="rounded-2xl bg-primary-soft p-4">
            <p className="flex items-center gap-2 text-xs font-black text-primary">
              <TrendingUp className="h-4 w-4" />
              Это сценарная оценка, а не гарантия
            </p>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
              Реальный результат зависит от спроса, ассортимента, конкуренции и скорости запуска.
              Точный расчёт по вашим цифрам делаем в Seller Growth Report.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={sellerLinks.potential} className="w-full sm:w-auto">Рассчитать мой потенциал</ButtonLink>
            <ButtonLink href={sellerLinks.launch} variant="outline" className="w-full sm:w-auto">Запустить KIT</ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
