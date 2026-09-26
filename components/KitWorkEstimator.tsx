"use client";

import { useMemo, useState } from "react";
import { ButtonLink } from "./ui";
import { sellerLinks } from "@/data/sellers";
import { Package, Check } from "lucide-react";
import { track } from "@/lib/analytics";

type KitInputs = {
  skus: number;
  hasMarketplace: boolean;
  hasPhotos: boolean;
  hasDescriptions: boolean;
  needTransfer: boolean;
  needDesign: boolean;
  needSeo: boolean;
  needAnalytics: boolean;
};

const DEFAULT_INPUTS: KitInputs = {
  skus: 200,
  hasMarketplace: true,
  hasPhotos: true,
  hasDescriptions: false,
  needTransfer: true,
  needDesign: false,
  needSeo: true,
  needAnalytics: true,
};

/**
 * Оценка объёма работ, а не смета.
 *
 * Сумму в рублях не показываем намеренно: цена зависит от состояния
 * каталога, объёма и того, что уже сделано. Вместо этого считается объём
 * в условных единицах работы — так честнее, потому что показывает, из
 * чего складывается сумма, и даёт повод обсудить детали, а не просто
 * получить прайс.
 *
 * Единица условная и не переводится в рубли автоматически: иначе
 * получится псевдоточная цифра, которую потом невозможно объяснить.
 */
function estimate(inputs: KitInputs) {
  let units = 4; // база: настройка магазина и витрины

  // Объём каталога: 1 единица на 25 товаров, с прогрессией после 1000,
  // потому что большие каталоги требуют нелинейно больше правок.
  const catalogUnits =
    inputs.skus <= 1000
      ? Math.ceil(inputs.skus / 25)
      : 40 + Math.ceil((inputs.skus - 1000) / 50);
  units += catalogUnits;

  if (inputs.needTransfer) units += 3;
  if (!inputs.hasPhotos) units += Math.ceil(catalogUnits * 0.6);
  if (!inputs.hasDescriptions) units += Math.ceil(catalogUnits * 0.8);
  if (inputs.needDesign) units += 4;
  if (inputs.needSeo) units += 3;
  if (inputs.needAnalytics) units += 2;
  units += 4; // домен, оплата, доставка, тестовый заказ, публикация

  return { units, catalogUnits, weeks: Math.max(1, Math.round(units / 9)) };
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-white p-4 transition hover:border-primary/30">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
          checked ? "border-primary bg-primary text-white" : "border-border bg-white"
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm font-bold text-foreground">{label}</span>
    </label>
  );
}

export function KitWorkEstimator() {
  const [inputs, setInputs] = useState<KitInputs>(DEFAULT_INPUTS);
  const [started, setStarted] = useState(false);

  // Событие «калькулятор запущен» шлём один раз — при первом изменении
  // любого параметра. Пустая форма сама по себе ещё не интерес.
  const markStarted = () => {
    if (started) return;
    setStarted(true);
    track("calculator_start", { tool: "kit_estimate" });
  };

  const set = <K extends keyof KitInputs>(key: K, value: KitInputs[K]) => {
    markStarted();
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(() => estimate(inputs), [inputs]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:gap-8">
      <div className="card-base reveal p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Оценка объёма работ</p>
            <p className="text-xs text-muted-foreground">
              Отметьте, что уже есть и что нужно сделать
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-bold text-foreground">Количество товаров</span>
            <span className="font-display text-base font-bold tabular-nums text-primary">
              {inputs.skus}
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={5000}
            step={10}
            value={inputs.skus}
            onChange={(e) => set("skus", Number(e.target.value))}
            className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[#760229]"
            aria-label="Количество товаров"
          />
          <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            <span>10</span>
            <span>5 000</span>
          </div>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Toggle
            label="Есть каталог на маркетплейсе"
            checked={inputs.hasMarketplace}
            onChange={(v) => set("hasMarketplace", v)}
          />
          <Toggle
            label="Есть фотографии товаров"
            checked={inputs.hasPhotos}
            onChange={(v) => set("hasPhotos", v)}
          />
          <Toggle
            label="Есть готовые описания"
            checked={inputs.hasDescriptions}
            onChange={(v) => set("hasDescriptions", v)}
          />
          <Toggle
            label="Нужен перенос каталога"
            checked={inputs.needTransfer}
            onChange={(v) => set("needTransfer", v)}
          />
          <Toggle
            label="Нужен дизайн"
            checked={inputs.needDesign}
            onChange={(v) => set("needDesign", v)}
          />
          <Toggle
            label="Нужно SEO"
            checked={inputs.needSeo}
            onChange={(v) => set("needSeo", v)}
          />
          <Toggle
            label="Нужна аналитика"
            checked={inputs.needAnalytics}
            onChange={(v) => set("needAnalytics", v)}
          />
        </div>
      </div>

      <div className="card-base reveal reveal-delay-1 overflow-hidden">
        <div className="border-b border-border p-6 sm:p-8">
          <p className="font-display text-lg font-bold text-foreground">
            Предварительная оценка
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Объём работ, а не смета: точную сумму считаем после разбора каталога
          </p>
        </div>

        <div className="space-y-4 p-6 sm:p-8">
          <div className="rounded-2xl bg-primary-soft p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Объём работ
            </p>
            <p
              className="mt-1 font-display font-bold leading-none text-foreground"
              style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}
            >
              ≈ {result.units} условных единиц
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Из них {result.catalogUnits} — работа с каталогом ({inputs.skus} товаров)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted p-4">
              <p className="text-xs font-bold text-muted-foreground">Ориентир по сроку</p>
              <p className="mt-1 font-display text-base font-bold text-foreground">
                ~{result.weeks} нед.
              </p>
            </div>
            <div className="rounded-2xl bg-muted p-4">
              <p className="text-xs font-bold text-muted-foreground">Масштаб</p>
              <p className="mt-1 font-display text-base font-bold text-foreground">
                {inputs.skus > 1000 ? "Большой каталог" : "Стандартный объём"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-xs font-bold text-foreground">Почему не точная сумма</p>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
              Оценка в условных единицах показывает состав работ. Реальная стоимость
              зависит от состояния каталога, объёма описаний, необходимости дизайна и
              того, какие интеграции нужно подключить. Эту оценку обсуждаем с вами до
              начала работ, а не после.
            </p>
          </div>

          <div className="rounded-2xl bg-premium p-5 text-white">
            <p className="font-display text-base font-bold">Хотите точный расчёт?</p>
            <p className="mt-1.5 text-xs leading-5 text-white/75">
              Пришлите ссылку на каталог — посмотрим, что можно перенести и что придётся
              делать заново.
            </p>
            {/* Событие «калькулятор завершён» ловим на обёртке: ButtonLink
                рендерит внешний <a>, и подменять его разметку ради
                аналитики не нужно. */}
            <div
              className="mt-4"
              onClick={() =>
                track("calculator_complete", {
                  tool: "kit_estimate",
                  skus: inputs.skus,
                  units: result.units,
                })
              }
            >
              <ButtonLink href={sellerLinks.potential} className="w-full">
                Получить точный расчёт
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
