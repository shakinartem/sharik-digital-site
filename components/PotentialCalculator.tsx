"use client";

import { useEffect, useMemo, useState } from "react";
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

/**
 * Поле ввода числа рядом со слайдером.
 *
 * NN/G и USWDS сходятся в одном: слайдер годится там, где точность
 * не важна. Оборот в 1 800 000 ₽ поставить точно невозможно — палец
 * на телефоне закрывает дорожку, а шаг 50 000 не даёт попасть в
 * нужное значение. Поэтому рядом всегда есть поле, куда цифры
 * можно вписать.
 *
 * Поле доступно и с клавиатуры, и со скринридера: label связан с
 * input через id, а не просто лежит рядом.
 */
function NumberField({
  id,
  value,
  onCommit,
  ariaLabel,
}: {
  id: string;
  value: number;
  onCommit: (v: number) => void;
  ariaLabel: string;
}) {
  // Текст живёт отдельно от value: пока пользователь печатает,
  // значение в состоянии ещё старое, и сброс поля на каждом
  // нажатии клавиши стирал бы ввод на полуслове.
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  return (
    <input
      id={id}
      type="number"
      inputMode="numeric"
      value={draft}
      aria-label={ariaLabel}
      onChange={(e) => {
        setDraft(e.target.value);
        const parsed = Number(e.target.value);
        if (Number.isFinite(parsed) && parsed > 0) onCommit(parsed);
      }}
      onBlur={() => setDraft(String(value))}
      className="w-24 shrink-0 rounded-xl border border-border bg-white px-3 py-1.5 text-right text-sm font-bold tabular-nums text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-28"
    />
  );
}

function Slider({
  index,
  label,
  hint,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  /** Позиция поля. Только для идентификаторов: label и hint не годятся. */
  index: number;
  label: string;
  /** Подсказка под полем: нужна и глазу, и скринридеру (USWDS). */
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  // Идентификаторы — латиницей и на основе индекса, а не из текста
  // подписи: кириллица в id ломает CSS-селекторы и выглядит
  // ошибкой в разметке, хотя формально допустима в HTML5.
  const id = `calc-range-${index}`;
  const hintId = `${id}-hint`;
  // Процент заполнения дорожки. Считаем от реального min/max, иначе
  // при min ≠ 0 шкала показывала бы неверную долю.
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <div>
      {/* Значение и поле — над дорожкой. Подписи снизу на сенсорном
          экране закрывает палец (NN/G). */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          {/* label связан с полем ввода, а не со слайдером: подпись
              «Оборот сейчас» описывает то, что человек вводит.
              У самого слайдера имя задаётся через aria-label —
              иначе он остался бы безымянным для скринридера. */}
          <label
            htmlFor={id}
            className="block text-sm font-bold leading-tight text-foreground"
          >
            {label}
          </label>
          {hint && (
            <p id={hintId} className="mt-0.5 text-xs leading-snug text-muted-foreground">
              {hint}
            </p>
          )}
        </div>
        <NumberField
          id={id}
          value={value}
          onCommit={onChange}
          ariaLabel={`${label}, числом`}
        />
      </div>

      <input
        type="range"
        className="range mt-1"
        style={{
          // Заполненная часть дорожки. Без неё ползунок висит на
          // пустой шкале и не показывает, насколько далеко от края
          // стоит значение — приходится считать шаги глазами.
          background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${pct}%, transparent ${pct}%, transparent 100%)`,
          backgroundSize: "100% 0.5rem",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label}, ползунком`}
        aria-describedby={hint ? hintId : undefined}
        aria-valuetext={`${fmt(value)} ${suffix}`.trim()}
      />

      {/* Границы диапазона — мелко и приглушённо: это справочная
          информация, а не то, за чем пришёл человек. */}
      <div className="mt-0.5 flex justify-between text-[11px] font-medium tabular-nums text-muted-foreground/70">
        <span>
          {fmt(min)} {suffix}
        </span>
        <span>
          {fmt(max)} {suffix}
        </span>
      </div>
    </div>
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
            <p className="text-sm font-bold text-foreground">Цифры вашего магазина</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              Подставьте реальные значения магазина — или близкие к ним
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Slider
            index={0}
            label="Оборот сейчас"
            hint="Сколько продаж магазин делает сейчас в месяц"
            value={inputs.turnover}
            min={100000}
            max={10000000}
            step={50000}
            suffix="₽/мес"
            onChange={(v) => set("turnover", v)}
          />
          <Slider
            index={1}
            label="Средний чек"
            hint="Средняя сумма одного заказа"
            value={inputs.avgCheck}
            min={500}
            max={10000}
            step={100}
            suffix="₽"
            onChange={(v) => set("avgCheck", v)}
          />
          <Slider
            index={2}
            label="Маржа"
            hint="Сколько от цены остаётся после закупки и доставки"
            value={inputs.margin}
            min={10}
            max={80}
            step={1}
            suffix="%"
            onChange={(v) => set("margin", v)}
          />
          <Slider
            index={3}
            label="Количество SKU"
            hint="Сколько разных товаров в каталоге"
            value={inputs.sku}
            min={1}
            max={2000}
            step={1}
            suffix=""
            onChange={(v) => set("sku", v)}
          />
          <Slider
            index={4}
            label="Доля повторных покупок"
            hint="Какая часть покупателей возвращается"
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
                  <p className="mt-0.5 text-xs text-muted-foreground">заказов/мес</p>
                  <p className="mt-1.5 text-sm font-semibold tabular-nums text-primary">
                    {fmt(r.ownRevenue)} ₽ выручка
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{s.note}</p>
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
