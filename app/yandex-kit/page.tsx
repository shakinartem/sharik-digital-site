"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionTitle, ButtonLink } from "@/components/ui";
import { KitWorkEstimator } from "@/components/KitWorkEstimator";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { site } from "@/data/site";
import { sellerLinks } from "@/data/sellers";
import { kitFaq } from "@/data/faq";
import {
  kitDefinition,
  kitCapabilities,
  kitReviewsLimit,
  kitAudience,
  kitNotFit,
  kitLaunchSteps,
  kitScope,
  kitEquation,
  kitAfterChain,
  KIT_DOC_URL,
  KIT_QUICKSTART_URL,
  KIT_REQUIREMENTS_URL,
} from "@/data/yandexKit";
import { ArrowRight, Check, X, ExternalLink, Info } from "lucide-react";

/**
 * Коммерческая страница по Яндекс KIT.
 *
 * Ключевое отличие от справочной статьи: здесь не пересказ интерфейса, а
 * ответ на вопрос продавца «стоит ли мне это и кто это сделает». Поэтому
 * структура такая: что это → кому подходит → как запускается → что делаем
 * мы → почему магазина недостаточно → сколько это займёт.
 *
 * Все утверждения о функциональности сопровождаются ссылкой на справку
 * Яндекса. Если платформа изменится, правки вносятся в data/yandexKit.ts.
 */
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

function DocLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs font-bold text-primary underline underline-offset-2 hover:opacity-70"
    >
      {children}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

/** Что такое Яндекс KIT + ограничения отзывов. */
function WhatIsKit() {
  return (
    <section id="what" className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Что это"
            title="Что такое Яндекс KIT?"
            text={kitDefinition.lead}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="card-base reveal p-6 sm:p-7">
            <p className="text-sm leading-7 text-muted-foreground">{kitDefinition.detail}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {kitCapabilities.map((c) => (
                <li key={c.title} className="rounded-2xl bg-muted p-4">
                  <p className="text-sm font-bold text-foreground">{c.title}</p>
                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{c.detail}</p>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-4">
              <DocLink href={KIT_DOC_URL}>Справка Яндекса</DocLink>
              <DocLink href={KIT_QUICKSTART_URL}>Быстрый старт</DocLink>
              <DocLink href={KIT_REQUIREMENTS_URL}>Требования к магазинам</DocLink>
            </div>
          </div>

          {/* Ограничение по отзывам — самый полезный практический факт,
              которого нет в большинстве статей о KIT. */}
          <div className="card-base reveal reveal-delay-1 border-l-4 border-l-primary p-6 sm:p-7">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <h3 className="font-display text-lg font-bold text-foreground">
                {kitReviewsLimit.title}
              </h3>
            </div>
            <ul className="mt-4 space-y-2.5">
              {kitReviewsLimit.points.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <DocLink href={kitReviewsLimit.sourceUrl}>Раздел «Отзывы» в справке</DocLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Audience() {
  return (
    <section id="audience" className="section-pad">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Кому подходит"
            title="Кому мы помогаем запустить магазин"
            text="Платформа рассчитана на физические товары. Ниже — кому она действительно подходит, а кому лучше не тратить на неё время."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kitAudience.map((a, i) => (
            <div
              key={a.title}
              className="card-base card-lift reveal p-6"
              style={{ transitionDelay: `${(i % 4) * 90}ms` }}
            >
              <Check className="h-5 w-5 text-primary" strokeWidth={2.5} />
              <h3 className="mt-4 font-display text-base font-bold text-foreground">
                {a.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{a.detail}</p>
              <p className="mt-4 text-xs font-bold text-primary">{a.meta}</p>
            </div>
          ))}
        </div>

        <div className="reveal mt-8 rounded-[1.75rem] border border-border bg-white p-6 sm:p-7">
          <h3 className="font-display text-lg font-bold text-foreground">
            Кому KIT может не подойти
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Лучше отказаться сейчас, чем потратить время и деньги на платформу, которая
            не решает вашу задачу.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {kitNotFit.map((n) => (
              <li
                key={n.title}
                className="flex items-start gap-3 rounded-2xl border border-border bg-muted p-4"
              >
                <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2.5} />
                <div>
                  <p className="text-sm font-bold text-foreground">{n.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{n.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Девять шагов запуска. Порядок совпадает с быстрым стартом Яндекса. */
function LaunchPipeline() {
  return (
    <section id="launch" className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Запуск"
            title="Как выглядит запуск магазина"
            text="Девять шагов в порядке, в котором они идут на практике. Порядок совпадает с официальным быстрым стартом Яндекса."
          />
        </div>

        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {kitLaunchSteps.map((s, i) => (
            <li
              key={s.step}
              className="card-base reveal flex items-start gap-4 p-5"
              style={{ transitionDelay: `${(i % 3) * 80}ms` }}
            >
              <span className="font-display text-xl font-bold leading-none text-primary">
                {s.step}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">{s.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="reveal mt-6 text-xs text-muted-foreground">
          Тестовый заказ — обязательный шаг, а не формальность: он проверяет оплату,
          формирование чека, резерв товара и передачу в доставку.{" "}
          <DocLink href={KIT_QUICKSTART_URL}>Шаг 6 в справке Яндекса</DocLink>
        </p>
      </div>
    </section>
  );
}

/** Что берём на себя. */
function WhatWeDo() {
  return (
    <section id="scope" className="section-pad">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Услуга"
            title="Что мы берём на себя"
            text="Настройку магазина можно сделать самостоятельно. Мы берём на себя тот объём, который обычно и съедает время: структуру, перенос, проверку и запуск."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kitScope.map((group, i) => (
            <div
              key={group.title}
              className="card-base card-lift reveal p-6"
              style={{ transitionDelay: `${(i % 3) * 90}ms` }}
            >
              <h3 className="font-display text-base font-bold text-foreground">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * «Интернет-магазин ≠ продажи» — центральная коммерческая мысль страницы.
 * Формула вместо списка аргументов: читатель видит, из чего складывается
 * канал продаж, и понимает, зачем ему всё, кроме магазина.
 */
function NotEnough() {
  return (
    <section id="equation" className="section-pad" style={{ background: "var(--premium)" }}>
      <div className="container-wide">
        <div className="reveal mx-auto max-w-3xl text-center">
          <h2
            className="font-display font-bold leading-[0.95] text-white"
            style={{ fontSize: "clamp(1.5rem, 5cqi, 3rem)" }}
          >
            Интернет-магазин ≠ продажи
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/80">
            Собранный и опубликованный магазин — это только верхняя строка. Канал продаж
            складывается из шести элементов, и каждый можно убрать — тогда остальные
            перестанут работать.
          </p>
        </div>

        <div className="reveal mx-auto mt-10 grid max-w-3xl gap-2 sm:grid-cols-3">
          {kitEquation.left.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-bold text-white"
            >
              {item}
            </div>
          ))}
        </div>

        <div className="reveal mx-auto mt-4 max-w-3xl rounded-[1.75rem] bg-primary px-6 py-6 text-center">
          <p className="font-display text-2xl font-bold text-white">{kitEquation.result}</p>
        </div>

        <p className="reveal mx-auto mt-6 max-w-2xl text-center text-sm leading-6 text-white/75">
          {kitEquation.note}
        </p>
      </div>
    </section>
  );
}

/** Что после KIT — наше коммерческое отличие. */
function AfterKit() {
  return (
    <section id="after" className="section-pad">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Что дальше"
            title="Мы не заканчиваем работу после публикации магазина"
            text="Магазин — это точка входа. Дальше начинается то, ради чего собственный канал вообще нужен."
          />
        </div>

        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {kitAfterChain.map((s, i) => (
            <li
              key={s.title}
              className="card-base reveal p-5"
              style={{ transitionDelay: `${(i % 3) * 80}ms` }}
            >
              <p className="text-sm font-bold text-foreground">{s.title}</p>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{s.detail}</p>
            </li>
          ))}
        </ol>

        <div className="reveal mt-8 rounded-[1.75rem] border border-border bg-white p-6 sm:p-7">
          <p className="text-sm leading-7 text-foreground">
            <span className="font-bold">
              Именно это отличает нас от специалиста, который настраивает KIT и уходит.
            </span>{" "}
            Настройка магазина — понятная задача с понятным результатом. Продажи — задача
            про экономику, спрос и повторные покупки, и она не заканчивается публикацией
            страницы.
          </p>
        </div>
      </div>
    </section>
  );
}

function Estimate() {
  return (
    <section id="estimate" className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Оценка"
            title="Сколько стоит запуск собственного магазина?"
            text="Посчитайте объём работ по своему каталогу. Точную сумму считаем после разбора — она зависит от состояния товаров, а не от названия платформы."
          />
        </div>
        <KitWorkEstimator />
      </div>
    </section>
  );
}

function FaqBlock({ items }: { items: ReadonlyArray<{ q: string; a: string }> }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="section-pad">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle kicker="FAQ" title="Частые вопросы про Яндекс KIT" />
        </div>
        <div className="mx-auto max-w-3xl">
          {items.map((item, i) => (
            <div key={item.q} className="border-t border-border/60">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-bold text-foreground transition hover:text-primary"
              >
                {item.q}
                <span className="shrink-0 text-primary">{open === i ? "−" : "+"}</span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  open === i ? "max-h-64 pb-4" : "max-h-0"
                }`}
              >
                <p className="text-base leading-7 text-muted-foreground">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section id="contact" className="section-pad" style={{ background: "var(--premium)" }}>
      <div className="container-wide">
        <div className="reveal mx-auto max-w-3xl text-center">
          <h2
            className="font-display font-bold leading-[0.95] text-white"
            style={{ fontSize: "clamp(1.5rem, 5cqi, 2.75rem)" }}
          >
            Помочь с запуском?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/80">
            Пришлите ссылку на каталог на маркетплейсе — посмотрим, что можно перенести, что
            придётся переделывать и имеет ли смысл запускать KIT именно вам.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href={sellerLinks.potential} className="w-full sm:w-auto">
              Получить расчёт
            </ButtonLink>
            <Link
              href="/sellers"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Узнать про собственный канал
            </Link>
          </div>
          <p className="mt-5 text-xs text-white/60">
            Сначала посмотрим на вашу ситуацию — без обязательств запускать проект.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function YandexKitPage() {
  useScrollReveal();

  const faq = kitFaq;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main id="top" className="overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SiteHeader ctaLabel="Рассчитать потенциал" ctaHref="#estimate" />

      <section className="section-pad pt-8 sm:pt-10">
        <div className="container-wide">
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Яндекс KIT" }]} />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="reveal">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-bold text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                Для селлеров и производителей
              </div>
              <h1
                className="mt-6 font-display font-bold leading-[0.95] text-foreground"
                style={{ fontSize: "clamp(1.9rem, 5.4cqi, 3.6rem)" }}
              >
                Яндекс KIT — запуск и настройка интернет-магазина
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Помогаем продавцам запустить собственный интернет-магазин на Яндекс KIT:
                переносим товары, настраиваем витрину, домен, оплату, доставку, SEO и
                аналитику, а затем помогаем привлечь покупателей.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={sellerLinks.potential}>Помочь с запуском</ButtonLink>
                <ButtonLink href="#estimate" variant="outline">
                  Оценить объём работ
                </ButtonLink>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Ответим в рабочее время. Сначала посмотрим на ваш каталог — без обязательств
                запускать проект.
              </p>
            </div>

            <div className="reveal reveal-delay-2">
              <div className="rounded-[1.75rem] border border-border bg-white p-6 shadow-xl shadow-black/5">
                <p className="text-xs font-bold text-foreground">Коротко о платформе</p>
                <ul className="mt-4 space-y-2.5">
                  {kitDefinition.modules.map((m) => (
                    <li key={m} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
                      {m}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
                  {kitDefinition.audience}
                </p>
                <div className="mt-3">
                  <DocLink href={KIT_DOC_URL}>Официальная справка Яндекса</DocLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WhatIsKit />
      <Audience />
      <LaunchPipeline />
      <WhatWeDo />
      <NotEnough />
      <AfterKit />
      <Estimate />
      <FaqBlock items={faq} />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}