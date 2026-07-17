"use client";

import { site } from "@/data/site";
import { ButtonLink } from "./ui";

export function PreAuditForm() {
  return (
    <section id="contact" className="section-pad" style={{ background: 'var(--premium)' }}>
      <div className="container-wide">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1.2fr_0.9fr] lg:items-center">
          <div className="reveal">
            <h2
              className="font-black leading-[0.95] text-white"
              style={{ fontSize: 'clamp(1.4rem, min(5cqi, 5rem), 3.6rem)' }}
            >
              Пройдите пред-аудит 7К в Telegram
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/85">
              Через несколько вопросов бот покажет, где клиника теряет пациентов, и выдаст Карту потерь с ИПП.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.45rem] border border-white/10 bg-white/8 p-5">
                <div className="text-sm font-black text-white">Что проверяем:</div>
                <ul className="mt-2 space-y-1.5 text-sm text-white/70">
                  <li>• 25 точек пациентопотока</li>
                  <li>• Красные и зелёные зоны</li>
                  <li>• Приоритеты развития</li>
                </ul>
              </div>
              <div className="rounded-[1.45rem] border border-white/10 bg-white/8 p-5">
                <div className="text-sm font-black text-white">Что получите:</div>
                <ul className="mt-2 space-y-1.5 text-sm text-white/70">
                  <li>• Индекс пациентопотока</li>
                  <li>• Карту потерь</li>
                  <li>• PDF-отчёт на email</li>
                </ul>
              </div>
            </div>
            <div className="mt-6">
              <ButtonLink href={site.links.audit}>Начать пред-аудит в Telegram</ButtonLink>
            </div>
          </div>

          <div className="reveal reveal-delay-2 rounded-[2.25rem] overflow-hidden bg-white shadow-xl">
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
                    <p className="mb-3 text-sm font-black text-foreground">Где ваша клиника ставит первую цель?</p>
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
        </div>
      </div>
    </section>
  );
}