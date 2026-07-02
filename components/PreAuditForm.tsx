"use client";

import { FormEvent, useState } from "react";
import { BotIcon, ChatIcon, ToothIcon } from "./icons";
import { site } from "@/data/site";

type FormState = "idle" | "submitting" | "success" | "error";

const improvementOptions = ["больше заявок", "карты", "сайт", "соцсети", "CRM", "автоматизация", "не знаю"] as const;
const contactOptions = ["Telegram", "WhatsApp", "MAX", "пока в боте"] as const;

export function PreAuditForm() {
  const [improvement, setImprovement] = useState<(typeof improvementOptions)[number]>("больше заявок");
  const [contact, setContact] = useState<(typeof contactOptions)[number]>("Telegram");
  const [formState, setFormState] = useState<FormState>("idle");
  const [comment, setComment] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") || "").trim();
    const clinic = String(formData.get("clinic") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const website = String(formData.get("website") || "").trim();

    const payload = {
      name,
      clinic,
      city,
      improvement,
      contact,
      comment: comment.trim(),
      website,
      userAgent: window.navigator.userAgent,
      source: "site-preaudit-form",
      page: window.location.href,
    };

    setFormState("submitting");

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.ok) {
        setFormState("success");
      } else {
        setFormState("error");
      }
    } catch {
      setFormState("error");
    }
  }

  function resetForm() {
    setFormState("idle");
    setComment("");
  }

  // Success state
  if (formState === "success") {
    return (
      <section id="contact" className="section-pad bg-white/65">
        <div className="container-pad grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <div className="pill mb-5">Пред-аудит клиники</div>
            <h2 className="brand-title text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">
              Заявка отправлена
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[color:var(--muted)]">
              Мы получили данные и можем продолжить диагностику в Telegram.
            </p>
          </div>
          <div className="card p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="mb-2 text-lg font-semibold text-[color:var(--ink)]">
              Заявка отправлена
            </p>
            <p className="mb-6 text-sm text-[color:var(--muted)]">
              Мы получили данные и можем продолжить диагностику в Telegram.
            </p>
            <a
              href={site.links.audit}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--red)] px-8 py-3 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--red)]"
            >
              Продолжить в Telegram
            </a>
            <button
              type="button"
              onClick={resetForm}
              className="ml-3 inline-flex min-h-12 items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-6 py-3 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--red)]/50"
            >
              Заполнить заново
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (formState === "error") {
    return (
      <section id="contact" className="section-pad bg-white/65">
        <div className="container-pad grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <div className="pill mb-5">Пред-аудит клиники</div>
            <h2 className="brand-title text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">
              Не получилось отправить заявку
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[color:var(--muted)]">
              Попробуйте ещё раз или продолжите в Telegram.
            </p>
          </div>
          <div className="card p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="mb-2 text-lg font-semibold text-[color:var(--ink)]">
              Ошибка отправки
            </p>
            <p className="mb-6 text-sm text-[color:var(--muted)]">
              Не получилось отправить заявку. Попробуйте ещё раз или продолжите в Telegram.
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--red)] px-8 py-3 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--red)]"
            >
              Попробовать снова
            </button>
            <a
              href={site.links.audit}
              className="ml-3 inline-flex min-h-12 items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-6 py-3 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--red)]/50"
            >
              Продолжить в Telegram
            </a>
          </div>
        </div>
      </section>
    );
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

          {/* Honeypot field for anti-spam */}
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="sr-only"
            aria-hidden="true"
          />

          <div className="relative grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-[color:var(--ink)]">Имя</span>
              <input
                name="name"
                required
                disabled={formState === "submitting"}
                className="min-h-12 rounded-2xl border border-[color:var(--line)] bg-white px-4 text-[color:var(--ink)] outline-none transition focus:border-[color:var(--red)] disabled:opacity-50"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-[color:var(--ink)]">Название клиники</span>
              <input
                name="clinic"
                required
                disabled={formState === "submitting"}
                className="min-h-12 rounded-2xl border border-[color:var(--line)] bg-white px-4 text-[color:var(--ink)] outline-none transition focus:border-[color:var(--red)] disabled:opacity-50"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-[color:var(--ink)]">Город</span>
              <input
                name="city"
                required
                disabled={formState === "submitting"}
                className="min-h-12 rounded-2xl border border-[color:var(--line)] bg-white px-4 text-[color:var(--ink)] outline-none transition focus:border-[color:var(--red)] disabled:opacity-50"
              />
            </label>
            <fieldset className="grid gap-3">
              <legend className="text-sm font-bold text-[color:var(--ink)]">Что хотите улучшить?</legend>
              <div className="flex flex-wrap gap-2">
                {improvementOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    disabled={formState === "submitting"}
                    onClick={() => setImprovement(option)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
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
                    <input
                      type="radio"
                      name="contact"
                      checked={contact === option}
                      onChange={() => setContact(option)}
                      disabled={formState === "submitting"}
                      className="accent-[color:var(--red)]"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-[color:var(--ink)]">
                Коротко опишите, что хотите разобрать
              </span>
              <textarea
                name="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={formState === "submitting"}
                placeholder="Мало заявок, плохо работают карты, нужен сайт, хотим автоматизировать обработку..."
                rows={3}
                className="min-h-[80px] resize-y rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-[color:var(--ink)] outline-none transition focus:border-[color:var(--red)] disabled:opacity-50"
              />
            </label>
            <button
              type="submit"
              disabled={formState === "submitting"}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--red)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--red)] disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {formState === "submitting" ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Отправка...
                </span>
              ) : (
                "Продолжить в Telegram"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}