"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ButtonLink, SectionTitle, NumberBadge } from "@/components/ui";
import { PotentialCalculator } from "@/components/PotentialCalculator";
import {
  sellerLinks,
  sellerProducts,
  sellerNotFit,
  sellerObjections,
  sellerFaq,
  sellerProcess,
  sellerAnchors,
  sellerModel,
  trafficChannels,
} from "@/data/sellers";
import { site } from "@/data/site";
import {
  TrendingUp,
  Database,
  Search,
  Repeat,
  ArrowDown,
  ShieldCheck,
  Layers,
  Package,
  Megaphone,
  Plus,
  Minus,
} from "lucide-react";

const channelIcons = {
  direct: Megaphone,
  product: Package,
  seo: Search,
  crm: Repeat,
} as const;

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("show");
        });
      },
      { threshold: 0.08 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function SellersPage() {
  useScrollReveal();

  return (
    <main id="top" className="overflow-x-hidden">
      <SiteHeader ctaLabel="Рассчитать потенциал" ctaHref="#potential" solidBg />
      <Hero />
      <Anchors />
      <Model />
      <NotASite />
      <Channels />
      <Potential />
      <Products />
      <Process />
      <Objections />
      <NotFit />
      <Faq />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-12 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
      <div
        className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full opacity-15 blur-3xl"
        style={{ background: "var(--primary)" }}
        aria-hidden="true"
      />
      <div className="container-wide">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14">
          <div className="reveal">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-black text-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Направление для продавцов маркетплейсов
            </div>

            <h1
              className="mt-6 font-black leading-[0.95] text-foreground"
              style={{ fontSize: "clamp(2rem, 6cqi, 4rem)" }}
            >
              Собственный канал
              <br />
              продаж <span className="text-primary">поверх</span> маркетплейсов
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Вы уже продаёте на Wildberries, Ozon или Яндекс Маркете. У вас есть товары, отзывы,
              рейтинг и бренд. Мы поможем превратить это в собственный интернет-магазин — с
              расчётом экономики, трафиком и повторными продажами.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#potential" className="w-full sm:w-auto">
                Рассчитать потенциал
              </ButtonLink>
              <ButtonLink href={sellerLinks.launch} variant="outline" className="w-full sm:w-auto">
                Запустить KIT
              </ButtonLink>
            </div>

            <p className="mt-5 text-xs text-muted-foreground">
              Без обещаний конкретной выручки. Сначала считаем, потом запускаем.
            </p>
          </div>

          <div className="reveal reveal-delay-2">
            <div className="card-base p-6 sm:p-7">
              <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                Что вы получаете
              </p>
              <ul className="mt-5 space-y-4">
                {[
                  { icon: Database, text: "Свою клиентскую базу вместо аренды чужой" },
                  { icon: Search, text: "Спрос из поиска Яндекса, а не только из рекламы" },
                  { icon: Repeat, text: "Повторные продажи без оплаты каждого заказа" },
                  { icon: TrendingUp, text: "Канал, который растёт вместе с ассортиментом" },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="pt-1.5 text-sm text-foreground">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Anchors() {
  return (
    <section className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Узнаёте себя?"
            title="Семь ситуаций, из-за которых селлеры застревают"
            text="Если хотя бы три пункта про вас — это уже повод считать потенциал, а не просто работать."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sellerAnchors.map((a, i) => (
            <article
              key={a.title}
              className="card-base card-lift reveal p-6"
              style={{ transitionDelay: `${(i % 3) * 100}ms` }}
            >
              <NumberBadge>{String(i + 1).padStart(2, "0")}</NumberBadge>
              <h3 className="mt-4 text-base font-black leading-snug text-foreground">
                {a.title}
              </h3>
              <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{a.detail}</p>
            </article>
          ))}

          <article className="reveal flex flex-col justify-center rounded-[1.75rem] bg-primary p-6 text-white sm:col-span-2 lg:col-span-1">
            <p className="text-sm font-black leading-snug">
              Каждая из этих ситуаций — это не приговор, а точку роста
            </p>
            <p className="mt-2 text-sm leading-6 text-white/80">
              Начните с расчёта: покажем, что можно улучшить в первую очередь.
            </p>
            <div className="mt-5">
              <a
                href="#potential"
                className="inline-flex items-center gap-2 text-sm font-black text-white underline underline-offset-4 transition hover:text-white/75"
              >
                Посчитать потенциал
                <ArrowDown className="h-4 w-4" />
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function Model() {
  return (
    <section id="model" className="section-pad">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Модель"
            title="Как устроен путь от маркетплейса до повторных продаж"
            text="Маркетплейс остаётся витриной. Собственный канал добавляет то, чего площадка не даёт: базу, спрос из поиска и повторные продажи."
          />
        </div>

        <ol className="mx-auto mt-4 max-w-3xl">
          {sellerModel.map((step, i) => {
            const isLast = i === sellerModel.length - 1;
            return (
              <li key={step.id} className="reveal relative" style={{ transitionDelay: `${i * 90}ms` }}>
                <div
                  className={`flex items-start gap-4 rounded-2xl border p-5 ${
                    step.primary ? "border-primary/25 bg-primary-soft" : "border-border bg-white"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                      step.primary ? "bg-primary text-white" : "bg-muted text-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-foreground">{step.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.detail}</p>
                  </div>
                </div>
                {!isLast && (
                  <div className="flex justify-center py-2" aria-hidden="true">
                    <ArrowDown className="h-4 w-4 text-primary/50" />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function NotASite() {
  const items = [
    {
      wrong: "«Сделаем вам сайт на Яндекс KIT»",
      right:
        "Мы не делаем сайты. Мы запускаем канал продаж и отвечаем за его экономику. Сайт — только один из элементов.",
    },
    {
      wrong: "«Запустим рекламу в Директе»",
      right:
        "Реклама — один из четырёх каналов. Без поисковой оптимизации, товарных каналов и CRM реклама просто сжигает бюджет.",
    },
    {
      wrong: "«Обещаем рост выручки в 3 раза»",
      right:
        "Мы считаем три сценария по вашим цифрам и показываем допущения. Потенциал зависит от ассортимента, спроса и конкуренции.",
    },
  ];

  return (
    <section className="section-pad" style={{ background: "var(--premium)" }}>
      <div className="container-wide">
        <div className="reveal">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-black text-white/80">
              Позиционирование
            </div>
            <h2
              className="font-black leading-[0.95] text-white"
              style={{ fontSize: "clamp(1.4rem, 5cqi, 3rem)" }}
            >
              Чего мы сознательно не продаём
            </h2>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={item.wrong}
              className="reveal rounded-[1.75rem] border border-white/10 bg-white/5 p-6"
              style={{ transitionDelay: `${i * 110}ms` }}
            >
              <p className="text-sm font-black text-white/45 line-through">{item.wrong}</p>
              <p className="mt-4 text-sm leading-6 text-white/90">{item.right}</p>
            </div>
          ))}
        </div>

        <div className="reveal mt-10 rounded-[1.75rem] border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-white" />
            <div>
              <p className="text-base font-black text-white">
                Вы получаете расчёт до того, как платите за запуск
              </p>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75">
                На старте мы считаем потенциал, срок окупаемости и риски. Если экономика не
                сходится — говорим об этом прямо и не берём деньги за запуск. Считаем, а не
                убеждаем.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Channels() {
  return (
    <section id="channels" className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Каналы"
            title="Яндекс KIT — это инфраструктура, а не результат"
            text="Магазин сам по себе не продаёт. Продаёт связка: платный спрос, бесплатный спрос из поиска и возврат покупателя."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trafficChannels.map((c, i) => {
            const Icon = channelIcons[c.id as keyof typeof channelIcons];
            return (
              <article
                key={c.id}
                className="card-base card-lift reveal p-6"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-black text-foreground">{c.title}</h3>
                <p className="mt-1 text-xs font-black text-primary">{c.role}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{c.detail}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Potential() {
  return (
    <section id="potential" className="section-pad">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Расчёт"
            title="Посчитайте потенциал своего канала"
            text="Подставьте свои цифры. Калькулятор покажет три сценария и напомнит, что это оценка, а не обещание."
          />
        </div>
        <PotentialCalculator />
      </div>
    </section>
  );
}

function Products() {
  const toneClass: Record<string, string> = {
    blue: "border-border bg-white",
    red: "border-primary/25 bg-primary-soft",
    dark: "border-transparent bg-premium",
  };

  return (
    <section id="products" className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Продукты"
            title="Лестница: от расчёта до внешнего e-commerce отдела"
            text="Каждый следующий шаг — это надстройка над предыдущим. Начинаем с расчёта, а не с развёрнутого внедрения."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {sellerProducts.map((p, i) => {
            const isDark = p.tone === "dark";
            return (
              <article
                key={p.id}
                className={`reveal flex flex-col rounded-[1.75rem] border p-6 sm:p-7 ${toneClass[p.tone]}`}
                style={{ transitionDelay: `${(i % 2) * 120}ms` }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`pill-sm ${isDark ? "bg-white/10 text-white/80" : ""}`}>
                    {p.step}
                  </span>
                  <span
                    className={`pill-sm ${isDark ? "bg-primary text-white" : "bg-primary-soft text-primary"}`}
                  >
                    {p.badge}
                  </span>
                </div>

                <h3
                  className={`mt-4 font-black leading-tight ${isDark ? "text-white" : "text-foreground"}`}
                  style={{ fontSize: "clamp(1.2rem, 2.4vw, 1.6rem)" }}
                >
                  {p.title}
                </h3>
                <p className={`mt-2 text-sm font-black ${isDark ? "text-white/90" : "text-primary"}`}>
                  {p.price} · {p.period}
                </p>
                <p
                  className={`mt-3 text-sm leading-6 ${isDark ? "text-white/75" : "text-muted-foreground"}`}
                >
                  {p.goal}
                </p>

                <ul className="mt-5 space-y-2.5">
                  {p.includes.map((inc) => (
                    <li
                      key={inc}
                      className={`flex items-start gap-2.5 text-sm ${isDark ? "text-white/85" : "text-foreground"}`}
                    >
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${isDark ? "bg-white/70" : "bg-primary"}`}
                      />
                      {inc}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section id="process" className="section-pad">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Процесс"
            title="Семь шагов от расчёта до повторных продаж"
            text="Каждый этап заканчивается результатом, который можно проверить. Переходим дальше только после проверки гипотез."
          />
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sellerProcess.map((step, i) => (
            <li
              key={step.step}
              className="card-base card-lift reveal p-5"
              style={{ transitionDelay: `${(i % 4) * 90}ms` }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-black text-primary" style={{ fontSize: "1.5rem" }}>
                  {step.step}
                </span>
                <span className="pill-sm whitespace-nowrap">{step.duration}</span>
              </div>
              <h3 className="mt-3 text-sm font-black text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.detail}</p>
            </li>
          ))}

          <li className="reveal flex items-center justify-center rounded-[1.75rem] border border-border bg-white p-5 text-center sm:col-span-2 lg:col-span-4">
            <p className="text-sm font-black text-foreground">
              Первые два шага — это расчёт. Если потенциала нет, вы получаете отчёт, а не потраченный
              бюджет на запуск
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}

function Accordion({ items }: { items: ReadonlyArray<{ q: string; a: string }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl">
      {items.map((item, i) => (
        <div
          key={item.q}
          className={`border-t border-border/60 transition-all duration-300 ${openIndex === i ? "bg-primary/5" : ""}`}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-black text-foreground transition hover:text-primary"
            aria-expanded={openIndex === i}
          >
            {item.q}
            <span className="shrink-0 text-primary">
              {openIndex === i ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </span>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${openIndex === i ? "max-h-96 pb-4" : "max-h-0"}`}
          >
            <p className="text-base leading-7 text-muted-foreground">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Objections() {
  return (
    <section id="objections" className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Возражения"
            title="Что обычно говорят продавцы — и что на это отвечаем"
            text="Если вашего вопроса нет здесь, задайте его напрямую — ответим без презентации."
          />
        </div>
        <Accordion items={sellerObjections} />
      </div>
    </section>
  );
}

function NotFit() {
  return (
    <section id="not-fit" className="section-pad">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Честно"
            title="Когда Яндекс KIT вам не нужен"
            text="Мы не заинтересованы в клиентах, которым направление не подходит. Лучше отказаться сейчас, чем потратить ваши деньги."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {sellerNotFit.map((item, i) => (
            <div
              key={item.title}
              className="reveal flex items-start gap-4 rounded-2xl border border-border bg-white p-5"
              style={{ transitionDelay: `${(i % 2) * 100}ms` }}
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-black text-muted-foreground">
                ✕
              </span>
              <div>
                <p className="text-sm font-black text-foreground">{item.title}</p>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle kicker="FAQ" title="Частые вопросы по направлению" />
        </div>
        <Accordion items={sellerFaq} />
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section id="contact" className="section-pad" style={{ background: "var(--premium)" }}>
      <div className="container-wide">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
          <div className="reveal">
            <h2
              className="font-black leading-[0.95] text-white"
              style={{ fontSize: "clamp(1.6rem, 5cqi, 3rem)" }}
            >
              Посчитаем потенциал вашего канала
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/80">
              Оставьте цифры по обороту и марже — покажем, сколько заказов канал может дать в
              осторожном, базовом и оптимистичном сценариях. Без презентации и давления.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={sellerLinks.potential} className="w-full sm:w-auto">
                Рассчитать потенциал
              </ButtonLink>
              <a
                href={sellerLinks.question}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-black text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
              >
                Задать вопрос
              </a>
            </div>

            <p className="mt-5 text-xs text-white/60">
              Или напишите напрямую:{" "}
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="font-black text-white underline"
              >
                {site.phone}
              </a>
            </p>
          </div>

          <div className="reveal reveal-delay-2">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 sm:p-7">
              <p className="text-sm font-black text-white">Что вы получите на расчёте</p>
              <ul className="mt-5 space-y-3">
                {[
                  "Разбор ассортимента и юнит-экономики",
                  "Три сценария по вашим реальным цифрам",
                  "Проверку спроса в поиске Яндекса",
                  "Прогноз срока окупаемости",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <Layers className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                    <span className="text-sm leading-6 text-white/80">{t}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-5 text-white/60">
                Яндекс KIT — инфраструктура, а не причина работать. Если завтра появится другой
                конструктор, ценность направления сохранится: диагностика, расчёт, запуск, трафик и
                рост.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
