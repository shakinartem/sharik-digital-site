"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowIcon, BotIcon, CalendarIcon, ChartIcon, MapPinIcon } from "./icons";
import { NumberBadge, SectionTitle } from "./ui";

const processSteps = [
  {
    title: "Чек-лист",
    icon: MapPinIcon,
    points: ["пользователь получает 25 точек проверки", "быстро видит слабые места", "понимает, что стоит проверить первым"],
  },
  {
    title: "Мини-диагностика",
    icon: BotIcon,
    points: ["бот задаёт вопросы", "собирает контекст по картам, сайту, соцсетям и заявкам", "телефон не обязателен"],
  },
  {
    title: "Разбор клиники",
    icon: CalendarIcon,
    points: ["смотрим digital-точки", "оцениваем путь пациента", "выделяем 3–5 приоритетов"],
  },
  {
    title: "Карта роста",
    icon: ChartIcon,
    points: ["формируем план действий", "определяем быстрые улучшения", "выбираем формат работы"],
  },
  {
    title: "Внедрение",
    icon: ArrowIcon,
    points: ["подключаем нужные инструменты", "усиливаем маршрут пациента", "отслеживаем результат"],
  },
] as const;

export function ProcessSection() {
  const [active, setActive] = useState<(typeof processSteps)[number] | null>(null);

  return (
    <section id="process" className="section-pad">
      <div className="container-pad">
        <SectionTitle kicker="Процесс" title="От чек-листа до системы" text="Сначала находим точки потерь, потом усиливаем маршрут пациента и закрепляем результат." />
        <div className="relative grid gap-5 md:grid-cols-5">
          <div className="dashed-route pointer-events-none absolute left-[7%] right-[7%] top-12 hidden h-px md:block" />
          {processSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <button
                key={step.title}
                type="button"
                onClick={() => setActive(step)}
                className="card-lift relative z-10 flex min-h-52 flex-col items-start rounded-[20px] border border-white/80 bg-white/90 p-5 text-left shadow-[var(--node-shadow)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--red)] md:even:mt-8"
              >
                <div className="flex w-full items-center justify-between gap-3">
                  <NumberBadge>{index + 1}</NumberBadge>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--blue-soft)] text-[color:var(--red)]">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="brand-title mt-5 text-xl font-semibold text-[color:var(--ink)]">{step.title}</h3>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-[color:var(--red)]">
                  Подробнее
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-[color:var(--line)]">+</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {active && <ProcessModal step={active} onClose={() => setActive(null)} />}
    </section>
  );
}

function ProcessModal({ step, onClose }: { step: (typeof processSteps)[number]; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const Icon = step.icon;

  useEffect(() => {
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[color:var(--modal-overlay)] p-4 backdrop-blur" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="process-modal-title"
        className="modal-pop mx-auto mt-16 max-w-xl rounded-[28px] bg-white p-6 shadow-2xl md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--blue-soft)] text-[color:var(--red)]">
              <Icon className="h-6 w-6" />
            </span>
            <h3 id="process-modal-title" className="brand-title text-3xl font-semibold text-[color:var(--ink)]">{step.title}</h3>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[color:var(--line)] text-xl text-[color:var(--ink)] transition hover:border-[color:var(--red)]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--red)]"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <ul className="mt-6 space-y-3">
          {step.points.map((point) => (
            <li key={point} className="rounded-2xl bg-[color:var(--blue-soft)] px-4 py-3 text-[color:var(--muted)]">
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
