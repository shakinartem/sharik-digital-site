"use client";

import { FormEvent, useState } from "react";
import { BotIcon, ChatIcon, ToothIcon } from "./icons";
import { site } from "@/data/site";

const improvementOptions = ["больше заявок", "карты", "сайт", "соцсети", "CRM", "автоматизация", "не знаю"] as const;
const contactOptions = ["Telegram", "WhatsApp", "MAX", "пока в боте"] as const;

export function PreAuditForm() {
  const [improvement, setImprovement] = useState<(typeof improvementOptions)[number]>("больше заявок");
  const [contact, setContact] = useState<(typeof contactOptions)[number]>("Telegram");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || ""),
      clinic: String(formData.get("clinic") || ""),
      city: String(formData.get("city") || ""),
      improvement,
      contact,
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem("sharik-preaudit", JSON.stringify(payload));
    window.location.href = site.links.audit;
  }

  return (
    <section id="contact" className="section-pad bg-white/65">
      <div className="container-pad grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <div className="pill mb-5">Пред-аудит клиники</div>
          <h2 className="brand-title text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">Пройдите пред-аудит в Telegram</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[color:var(--muted)]">
            Ответьте на несколько вопросов в боте, и мы увидим, где клиника может терять пациентов ещё до консультации.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] border border-white/80 bg-white/90 p-5">
              <BotIcon className="mb-4 h-7 w-7 text-[color:var(--red)]" />
              <p className="font-semibold text-[color:var(--ink)]">Бот продолжит диагностику и сохранит Telegram-профиль.</p>
            </div>
            <div className="rounded-[20px] border border-white/80 bg-white/90 p-5">
              <ToothIcon className="mb-4 h-7 w-7 text-[color:var(--red)]" />
              <p className="font-semibold text-[color:var(--ink)]">Сначала смотрим маршрут пациента, точки потерь и приоритет запуска.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card relative overflow-hidden p-6 shadow-[var(--node-shadow)] md:p-8">
          <ChatIcon className="pointer-events-none absolute -right-5 -top-5 h-28 w-28 text-[color:var(--red)] opacity-10" />
          <div className="relative grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-[color:var(--ink)]">Имя</span>
              <input name="name" required className="min-h-12 rounded-2xl border border-[color:var(--line)] bg-white px-4 text-[color:var(--ink)] outline-none transition focus:border-[color:var(--red)]" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-[color:var(--ink)]">Название клиники</span>
              <input name="clinic" required className="min-h-12 rounded-2xl border border-[color:var(--line)] bg-white px-4 text-[color:var(--ink)] outline-none transition focus:border-[color:var(--red)]" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-[color:var(--ink)]">Город</span>
              <input name="city" required className="min-h-12 rounded-2xl border border-[color:var(--line)] bg-white px-4 text-[color:var(--ink)] outline-none transition focus:border-[color:var(--red)]" />
            </label>
            <fieldset className="grid gap-3">
              <legend className="text-sm font-bold text-[color:var(--ink)]">Что хотите улучшить?</legend>
              <div className="flex flex-wrap gap-2">
                {improvementOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setImprovement(option)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      improvement === option
                        ? "border-[color:var(--red)] bg-[color:var(--red)] text-white"
                        : "border-[color:var(--line)] bg-white text-[color:var(--ink)] hover:border-[color:var(--red)]/50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="grid gap-3">
              <legend className="text-sm font-bold text-[color:var(--ink)]">Куда удобнее продолжить?</legend>
              <div className="grid gap-2 sm:grid-cols-4">
                {contactOptions.map((option) => (
                  <label key={option} className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[color:var(--line)] bg-white px-3 py-3 text-sm font-semibold text-[color:var(--ink)]">
                    <input type="radio" name="contact" checked={contact === option} onChange={() => setContact(option)} className="accent-[color:var(--red)]" />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--red)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--red)]"
            >
              Продолжить в Telegram
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
