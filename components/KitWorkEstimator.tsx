"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
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

/**
 * Прайс запуска магазина на Яндекс KIT.
 *
 * Все цифры в одном месте — их нужно менять здесь, а не искать по
 * компоненту. Значения ниже откалиброваны так, чтобы минимальный
 * запуск маленького каталога стоил около 60–70 тысяч: это нижняя
 * граница, от которой считается «от N ₽» на странице.
 */
const KIT_LAUNCH_BASE = 25_000; // настройка магазина и витрины
const KIT_PRICE_PER_CATALOG_UNIT = 1_200; // за 25 товаров
const KIT_PRICE_TRANSFER = 15_000; // перенос каталога с маркетплейса
const KIT_PRICE_PHOTO = 900; // фото на 25 товаров
const KIT_PRICE_DESCRIPTION = 1_100; // описание на 25 товаров
const KIT_PRICE_DESIGN = 20_000;
const KIT_PRICE_SEO = 18_000;
const KIT_PRICE_ANALYTICS = 12_000;
const KIT_PRICE_LAUNCH = 15_000; // домен, оплата, доставка, тестовый заказ, публикация

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
 * Оценка объёма работ в деньгах.
 *
 * Раньше калькулятор показывал «условные единицы» — число, которое
 * нельзя было ни проверить, ни сравнить с предложением конкурента.
 * Читатель видел цифру, не понимая, что она значит, и уходил.
 *
 * Теперь считаем деньгами и показываем «от N ₽». Слово «от» здесь
 * обязательно: это нижняя граница для выбранного объёма, а не
 * смета. Точную сумму считаем после разбора каталога — состояние
 * товаров меняет цену в разы, и обещать точную сумму до этого
 * момента было бы враньём.
 */
function estimate(inputs: KitInputs) {
  // Объём каталога: 1 единица на 25 товаров, с прогрессией после
  // 1000, потому что большие каталоги требуют нелинейно больше
  // правок. Единица внутренняя — наружу она не показывается.
  const catalogUnits =
    inputs.skus <= 1000
      ? Math.ceil(inputs.skus / 25)
      : 40 + Math.ceil((inputs.skus - 1000) / 50);

  // Каталог — самая объёмная часть, и читателю важно видеть её
  // отдельно: при 200 товарах это почти половина суммы.
  const catalogPrice = catalogUnits * KIT_PRICE_PER_CATALOG_UNIT;

  let price = KIT_LAUNCH_BASE + catalogPrice;
  if (inputs.needTransfer) price += KIT_PRICE_TRANSFER;
  if (!inputs.hasPhotos) price += Math.ceil(catalogUnits * 0.6) * KIT_PRICE_PHOTO;
  if (!inputs.hasDescriptions) price += Math.ceil(catalogUnits * 0.8) * KIT_PRICE_DESCRIPTION;
  if (inputs.needDesign) price += KIT_PRICE_DESIGN;
  if (inputs.needSeo) price += KIT_PRICE_SEO;
  if (inputs.needAnalytics) price += KIT_PRICE_ANALYTICS;
  price += KIT_PRICE_LAUNCH;

  // Срок считаем от той же базы, что и деньги: 60 000 ₽ — это
  // примерно неделя работы. Раньше неделя бралась из «единиц», и
  // после перехода на рубли формула осталась бы в старых терминах.
  const weeks = Math.max(1, Math.round(price / 60_000));

  return { price, catalogPrice, weeks };
}
/** 145000 -> «145 000 ₽». toLocaleString ставит неразрывные пробелы, иначе сумма рвётся переносом строки.
/** 145 000 -> «145 000 ₽». Пробел неразрывный, чтобы сумма не рвалась. */
function money(value: number) {
  return `${value.toLocaleString("ru-RU")} ₽`;
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
  // Черновик числа в поле ввода: пока печатают, значение в состоянии
  // может быть старым, и сброс поля на каждый символ стирал бы ввод.
  const [skusDraft, setSkusDraft] = useState(String(DEFAULT_INPUTS.skus));

  useEffect(() => {
    setSkusDraft(String(inputs.skus));
  }, [inputs.skus]);

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

  // Заполненная часть дорожки: показывает долю шкалы без необходимости
  // считать шаги глазами. Значение передаётся в CSS-переменную — сам
  // градиент описан в globals.css и рисуется на дорожке.
  const skusPct = ((inputs.skus - 10) / (5000 - 10)) * 100;
  const trackStyle = { "--range-pct": `${skusPct}%` } as CSSProperties;

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

        {/* Значение и поле ввода — над дорожкой: подписи снизу на
            телефоне закрывает палец (NN/G). Слайдер дополнен полем,
            потому что точное число SKU нужно поставить, а не угадать. */}
        <div>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <label
                htmlFor="kit-skus"
                className="block text-sm font-bold leading-tight text-foreground"
              >
                Количество товаров
              </label>
              <p id="kit-skus-hint" className="mt-0.5 text-xs leading-snug text-muted-foreground">
                Сколько позиций в каталоге магазина
              </p>
            </div>
            <input
              id="kit-skus"
              type="number"
              inputMode="numeric"
              min={10}
              max={5000}
              value={skusDraft}
              onChange={(e) => {
                setSkusDraft(e.target.value);
                const parsed = Number(e.target.value);
                if (Number.isFinite(parsed) && parsed >= 10 && parsed <= 5000) {
                  set("skus", Math.round(parsed));
                }
              }}
              onBlur={() => setSkusDraft(String(inputs.skus))}
              aria-label="Количество товаров, числом"
              className="w-24 shrink-0 rounded-xl border border-border bg-white px-3 py-1.5 text-right text-sm font-bold tabular-nums text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-28"
            />
          </div>
          <input
            type="range"
            className="range mt-1"
            style={trackStyle}
            min={10}
            max={5000}
            step={10}
            value={inputs.skus}
            onChange={(e) => set("skus", Number(e.target.value))}
            aria-describedby="kit-skus-hint"
            aria-valuetext={`${inputs.skus} товаров`}
          />
          <div className="mt-0.5 flex justify-between text-[11px] font-medium tabular-nums text-muted-foreground/70">
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
            Нижняя граница по вашим данным: точную сумму считаем после разбора каталога
          </p>
        </div>

        <div className="space-y-4 p-6 sm:p-8">
          <div className="rounded-2xl bg-primary-soft p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Стоимость запуска
            </p>
            <p
              className="mt-1 font-display font-bold leading-none text-foreground"
              style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}
            >
              от {money(result.price)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Из них {money(result.catalogPrice)} — работа с каталогом ({inputs.skus} товаров)
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
            <p className="text-xs font-bold text-foreground">Почему «от», а не «сколько»</p>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
              Это нижняя граница для выбранного объёма. Реальная стоимость зависит от
              состояния каталога, объёма описаний, необходимости дизайна и того, какие
              интеграции нужно подключить. Итоговую сумму фиксируем в договоре до начала
              работ, а не после.
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
                  price: result.price,
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
