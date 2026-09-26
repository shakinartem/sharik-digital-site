"use client";

import { useState } from "react";
import { sellerLinks } from "@/data/sellers";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

/**
 * Заявка на расчёт для продавца.
 *
 * Четыре поля вместо пятнадцати — сознательно. Заявка уходит в Telegram-бот,
 * и длинная форма в этом сценарии отсекает именно тех, кому нужен быстрый
 * ответ. Просим только то, без чего расчёт невозможен: ссылку на каталог,
 * оборот и контакт.
 *
 * Поля разбиты на шаги с прогрессом: «Шаг 1 из 3» психологически легче,
 * чем длинная форма на одном экране, особенно на телефоне.
 *
 * Форма не отправляет данные сама: на последнем шаге собирает ответ в
 * сообщение и открывает бот. Бэкенда на проекте нет, и притворяться,
 * что он есть, не нужно.
 */
type StepId = "shop" | "turnover" | "contact";

const STEPS: { id: StepId; title: string; hint: string }[] = [
  { id: "shop", title: "Ссылка на каталог", hint: "Магазин на маркетплейсе или уже готовый сайт" },
  { id: "turnover", title: "Примерный оборот в месяц", hint: "Достаточно порядка: 300 000 ₽ или 1 500 000 ₽" },
  { id: "contact", title: "Как с вами связаться", hint: "Имя и телефон или Telegram" },
];

const TURNOVER_PRESETS = ["300 000 ₽", "1 000 000 ₽", "3 000 000 ₽", "10 000 000 ₽"];

export function SellerLeadForm() {
  const [step, setStep] = useState(0);
  const [shop, setShop] = useState("");
  const [turnover, setTurnover] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const canContinue =
    (current.id === "shop" && shop.trim().length > 2) ||
    (current.id === "turnover" && turnover.trim().length > 0) ||
    (current.id === "contact" && name.trim().length > 1 && contact.trim().length > 4);

  /** Собираем ответ в сообщение для бота. */
  function buildMessage() {
    return [
      "Расчёт потенциала канала",
      "",
      `Каталог: ${shop || "не указан"}`,
      `Оборот: ${turnover || "не указан"}`,
      `Имя: ${name}`,
      `Контакт: ${contact}`,
    ].join("\n");
  }

  function submit() {
    const url = `${sellerLinks.potential}&message=${encodeURIComponent(buildMessage())}`;
    window.open(url, "_blank", "noopener");
  }

  const inputClass =
    "w-full rounded-2xl border border-border bg-white px-4 py-3.5 text-sm text-foreground outline-none transition focus:border-primary";

  return (
    <section id="lead" className="section-pad" style={{ background: "var(--premium)" }}>
      <div className="container-wide">
        <div className="mx-auto max-w-2xl">
          <div className="reveal text-center">
            <h2
              className="font-display font-bold leading-[0.98] text-white"
              style={{ fontSize: "clamp(1.5rem, 5cqi, 2.5rem)" }}
            >
              Начнём с расчёта
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/80">
              Четыре поля — этого достаточно, чтобы посмотреть ваш каталог и сказать,
              есть ли смысл запускать свой магазин.
            </p>
          </div>

          {/* Прогресс: подсказывает, сколько осталось, и снимает
              ощущение «я застрял в форме». */}
          <div className="reveal mt-8">
            <div className="flex items-center justify-between text-xs font-bold text-white/70">
              <span>
                Шаг {step + 1} из {STEPS.length}
              </span>
              <span>{current.title}</span>
            </div>
            <div className="mt-2 flex gap-1.5" aria-hidden="true">
              {STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i <= step ? "bg-white" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="reveal mt-6 rounded-[1.75rem] bg-white p-6 sm:p-8">
            <p className="text-sm font-bold text-foreground">{current.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{current.hint}</p>

            <div className="mt-5">
              {current.id === "shop" && (
                <input
                  type="url"
                  inputMode="url"
                  value={shop}
                  onChange={(e) => setShop(e.target.value)}
                  placeholder="https://www.wildberries.ru/seller/..."
                  className={inputClass}
                  autoFocus
                />
              )}

              {current.id === "turnover" && (
                <div className="flex flex-wrap gap-2">
                  {TURNOVER_PRESETS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setTurnover(v)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                        turnover === v
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-white text-foreground hover:border-primary/40"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                  <input
                    type="text"
                    inputMode="numeric"
                    value={TURNOVER_PRESETS.includes(turnover) ? "" : turnover}
                    onChange={(e) => setTurnover(e.target.value)}
                    placeholder="Своя сумма"
                    className="min-w-[140px] flex-1 rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
                  />
                </div>
              )}

              {current.id === "contact" && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Имя"
                    className={inputClass}
                    autoFocus
                  />
                  <input
                    type="text"
                    inputMode="tel"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Телефон или @telegram"
                    className={inputClass}
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-full border border-border px-5 text-sm font-bold text-foreground transition hover:border-primary/40"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Назад
                </button>
              )}
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => (isLast ? submit() : setStep(step + 1))}
                className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLast ? (
                  <>
                    <Check className="h-4 w-4" />
                    Отправить заявку
                  </>
                ) : (
                  <>
                    Далее
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Ответим в рабочее время. Сначала посмотрим на вашу ситуацию — без
              обязательств запускать проект.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}