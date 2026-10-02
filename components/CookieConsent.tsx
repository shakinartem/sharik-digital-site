"use client";

import Link from "next/link";
import { useState } from "react";
import { saveConsent, useConsent } from "@/lib/consent";

/**
 * Баннер согласия на файлы cookie.
 *
 * Требование 152-ФЗ: собирать данные, связанные с человеком, можно
 * только после явного согласия. Поэтому баннер — не украшение, а
 * условие работы счётчика: пока его не приняли, Метрика не грузится
 * (см. components/MetricaCounter.tsx).
 *
 * Намеренно нет кнопки «принять всё и закрыть без вопросов» как
 * единственной: выбор должен быть осознанным, поэтому варианта два.
 * Отказ не наказывается — сайт продолжает работать, просто без
 * внешней аналитики.
 */
export function CookieConsent() {
  const { consent, ready } = useConsent();
  const [details, setDetails] = useState(false);

  // Пока решение неизвестно, не рендерим ничего: иначе баннер моргнёт
  // у пользователей, которые согласие уже давали.
  if (!ready || consent) return null;

  const decide = (analytics: boolean) => saveConsent(analytics);

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      <div className="container-wide">
        <div className="rounded-3xl border border-border bg-white p-5 shadow-[0_8px_40px_rgba(15,23,42,0.16)] sm:p-6">
          <h2
            id="cookie-consent-title"
            className="font-display text-base font-bold text-foreground"
          >
            Файлы cookie
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Мы используем файлы cookie и данные о посещении, чтобы сайт работал
            правильно и чтобы понимать, какие страницы полезны.
          </p>

          {details && (
            <div className="mt-4 space-y-3 rounded-2xl bg-muted p-4 text-sm leading-6">
              <div>
                <div className="font-bold text-foreground">Необходимые — всегда включены</div>
                <p className="text-muted-foreground">
                  Нужны для работы форм и сохранения выбора. Без них заявка может
                  не отправиться. Хранятся только на этом устройстве.
                </p>
              </div>
              <div>
                <div className="font-bold text-foreground">
                  Аналитика — можно отключить
                </div>
                <p className="text-muted-foreground">
                  Счётчик Яндекс.Метрики: источники трафика, вебвизор, кликовая
                  карта. Он записывает поведение посетителя, поэтому включается
                  только с вашего согласия.
                </p>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => decide(true)}
              className="btn-primary inline-flex items-center justify-center text-sm"
            >
              Разрешить всё
            </button>
            <button
              type="button"
              onClick={() => decide(false)}
              className="btn-outline inline-flex items-center justify-center text-sm"
            >
              Только необходимые
            </button>
            <button
              type="button"
              onClick={() => setDetails((value) => !value)}
              className="text-sm font-bold text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
              aria-expanded={details}
            >
              {details ? "Скрыть детали" : "Подробнее о cookie"}
            </button>
          </div>

          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Решение можно изменить в любой момент — очистите данные сайта в
            настройках браузера, и вопрос появится снова. Подробности в{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              политике конфиденциальности
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Кнопка для повторного выбора. Без неё отказ от cookie оказывается
 * необратимым: человек не может вернуться и включить аналитику, не
 * чистя кэш браузера.
 */
export function CookieSettingsButton({ className = "" }: { className?: string }) {
  const { consent, ready } = useConsent();
  const [open, setOpen] = useState(false);

  if (!ready || !consent) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`text-xs font-bold text-muted-foreground underline underline-offset-4 transition hover:text-foreground ${className}`}
      >
        Настройки cookie
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-3 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-white p-6 shadow-[0_8px_40px_rgba(15,23,42,0.2)]">
            <h2 className="font-display text-lg font-bold text-foreground">
              Настройки cookie
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Сейчас аналитика{" "}
              <span className="font-bold text-foreground">
                {consent.analytics ? "включена" : "выключена"}
              </span>
              .
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  saveConsent(true);
                  setOpen(false);
                }}
                className="btn-primary inline-flex items-center justify-center text-sm"
              >
                Включить аналитику
              </button>
              <button
                type="button"
                onClick={() => {
                  saveConsent(false);
                  setOpen(false);
                }}
                className="btn-outline inline-flex items-center justify-center text-sm"
              >
                Отключить
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm font-bold text-muted-foreground underline underline-offset-4 transition hover:text-foreground sm:self-center"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}