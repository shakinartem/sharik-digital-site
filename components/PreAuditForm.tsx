"use client";

import { ButtonLink } from "./ui";
import { site } from "@/data/site";

export function PreAuditForm() {
  return (
    <section id="contact" className="section-pad" style={{ background: "var(--premium)" }}>
      <div className="container-wide">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="reveal reveal-delay-2 rounded-[2.25rem] overflow-hidden bg-white shadow-xl lg:order-1">
            <div className="bg-white p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-primary" />
                  <div className="max-w-[80%] rounded-[16px] rounded-tl-sm bg-primary/5 px-4 py-3">
                    <p className="text-sm font-black text-foreground">Давайте запустим пред-аудит 7К</p>
                    <p className="mt-1 text-xs text-muted-foreground">Ответьте на 7 вопросов</p>
                  </div>
                </div>

                <div className="flex items-start justify-end gap-3">
                  <div className="max-w-[80%] rounded-[16px] rounded-tr-sm bg-muted px-4 py-3">
                    <p className="text-sm font-black text-foreground">Готов приступить</p>
                  </div>
                  <div className="h-8 w-8 shrink-0 rounded-full bg-muted-foreground/30" />
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-primary" />
                  <div className="max-w-[80%] rounded-[16px] rounded-tl-sm bg-primary/5 px-4 py-3">
                    <p className="mb-2 text-sm font-black text-foreground">Где ваша клиника ставит первую цель?</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-primary px-3 py-1.5 text-xs font-black text-primary-foreground">Больше заявок</span>
                      <span className="inline-flex items-center rounded-full border border-border bg-white px-3 py-1.5 text-xs font-black text-foreground">Лучше карты</span>
                      <span className="inline-flex items-center rounded-full border border-border bg-white px-3 py-1.5 text-xs font-black text-foreground">Новый сайт</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="reveal lg:order-2">
            <h2
              className="font-black leading-[0.95] text-white"
              style={{ fontSize: "clamp(1.4rem, min(5cqi, 5rem), 3.6rem)" }}
            >
              Пройдите пред-аудит 7К
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/85">
              Через несколько вопросов бот покажет, где клиника теряет пациентов, и выдаст Карту потерь с ИПП.
            </p>

            <div className="mt-6">
              <ButtonLink href={site.links.audit}>Начать пред-аудит</ButtonLink>
            </div>
            <p className="mt-3 text-xs text-white/60">
              Или <a href={site.links.audit} className="font-black text-white underline hover:text-primary/80">пройти диагностику напрямую в Telegram</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}