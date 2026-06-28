"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { ButtonLink } from "./ui";
import { site } from "@/data/site";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setPending(false);
    setStatus("success");
    event.currentTarget.reset();
  }

  return (
    <form id="contact-form" onSubmit={onSubmit} className="card grid gap-4 p-6 md:p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-[color:var(--ink)]">
          Имя
          <input name="name" required className="h-12 rounded-2xl border border-[color:var(--line)] bg-white px-4 outline-none focus:border-[color:var(--red)]" placeholder="Введите имя" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[color:var(--ink)]">
          Телефон
          <input name="phone" required className="h-12 rounded-2xl border border-[color:var(--line)] bg-white px-4 outline-none focus:border-[color:var(--red)]" placeholder="+7 (___) ___-__-__" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-[color:var(--ink)]">
          Название клиники
          <input name="clinic" className="h-12 rounded-2xl border border-[color:var(--line)] bg-white px-4 outline-none focus:border-[color:var(--red)]" placeholder="Опционально" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[color:var(--ink)]">
          Комментарий
          <input name="comment" className="h-12 rounded-2xl border border-[color:var(--line)] bg-white px-4 outline-none focus:border-[color:var(--red)]" placeholder="Что нужно улучшить" />
        </label>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--red)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Отправляем..." : "Оставить заявку на консультацию"}
        </button>
        <p className="text-sm text-[color:var(--muted)]">Ответ придёт в Telegram-бот {site.botUsername}.</p>
      </div>
      {status === "success" && <p className="text-sm font-semibold text-[color:var(--red)]">Заявка отправлена. Мы свяжемся с вами в ближайшее время.</p>}
    </form>
  );
}
