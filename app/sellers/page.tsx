"use client";

import { useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ButtonLink, SectionTitle, NumberBadge } from "@/components/ui";
import { JourneyMap } from "@/components/JourneyMap";
import { PotentialCalculator } from "@/components/PotentialCalculator";
import { GroupedFaq } from "@/components/GroupedFaq";
import {
  sellerLinks,
  sellerProducts,
  sellerNotFit,
  sellerFaq,
  sellerProcess,
  sellerAnchors,
  sellerModel,
  trafficChannels,
  parallelSalesSteps,
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

/**
 * Страница продавцов сокращена примерно на четверть.
 *
 * Порядок блоков и что изменилось:
 *  - Objections удалён как отдельная секция: пять вопросов дублировали
 *    FAQ. Самые сильные из них перенесены в FAQ ниже.
 *  - На его месте появился блок «Новое направление» — он честно
 *    показывает, что seller-кейсов ещё нет.
 *  - Anchors сокращён до пяти пунктов, процесс до четырёх шагов,
 *    продукты до трёх ступеней без жёстких цен.
 *  - Схема «Модель» осталась единственной: раньше она дублировалась
 *    полем «Процесс» из семи микро-этапов.
 */
export default function SellersPage() {
  useScrollReveal();

  return (
    <main id="top" className="overflow-x-hidden">
      {/* Кнопка в шапке возвращает наверх страницы, а не ведёт на
          форму: человек нажал её, потому что хочет разобраться в
          подходе, а не потому что уже решил оставить заявку.
          К форме ведут блоки внизу — там, где решение принято. */}
      <SiteHeader ctaLabel="В начало страницы" ctaHref="#top" solidBg />
      <Hero />
      <HowTo />
      <Anchors />
      <Model />
      <NotASite />
      <LossMap />
      <Channels />
      <Potential />
      <Products />
      <Process />
      <NewDirection />
      <NotFit />
      <Faq />
      <NextStep />
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
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-bold text-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Направление для продавцов маркетплейсов
            </div>

            <h1
              className="mt-6 font-display font-bold leading-[0.95] text-foreground"
              style={{ fontSize: "clamp(2rem, 6cqi, 4rem)" }}
            >
              У маркетплейса есть продажи.
              <br />
              У бренда может быть <span className="text-primary">собственный канал</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Помогаем продавцам WB, Ozon и Яндекс Маркета запускать собственный
              интернет-магазин и выстраивать вокруг него систему трафика, продаж и
              повторных покупок.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#how-to" className="w-full sm:w-auto">
                Как это устроено
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
                  { icon: Database, text: "Собственный канал коммуникации с покупателями" },
                  { icon: Search, text: "Спрос из поиска Яндекса, а не только из рекламы" },
                  { icon: Repeat, text: "Больше возможностей для повторных продаж" },
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

/**
 * Как построить параллельные продажи.
 *
 * Поставлен сразу после первого экрана: человек приходит с вопросом
 * «как это вообще устроено», и ответ должен быть до расчёта и формы,
 * а не после.
 */
function HowTo() {
  return (
    <section id="how-to" className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Как это устроено"
            title="Пять шагов к параллельным продажам"
            text="Маркетплейс остаётся и продолжает приносить продажи. Параллельно рядом с ним выстраивается канал, которым владеете вы — и он окупает вложения."
          />
        </div>

        <ol className="mt-12 space-y-4">
          {parallelSalesSteps.map((item, i) => (
            <li
              key={item.step}
              className="card-base card-lift reveal flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-6"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <span className="font-display text-2xl font-black leading-none text-primary sm:text-3xl">
                {item.step}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black leading-snug text-foreground sm:text-lg">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </div>
              <p className="flex shrink-0 items-start gap-2 rounded-2xl bg-primary-soft px-4 py-3 text-xs font-bold leading-5 text-primary sm:max-w-[220px]">
                {item.result}
              </p>
            </li>
          ))}
        </ol>
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
            title="Пять ситуаций, из-за которых селлеры застревают"
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

/**
 * Блок сжат с трёх карточек «чего не продаём» до одного сильного
 * блока. Смысл остался: KIT — инфраструктура, а не результат.
 */
function NotASite() {
  return (
    <section className="section-pad" style={{ background: "var(--premium)" }}>
      <div className="container-wide">
        <div className="reveal mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white/80">
            Позиционирование
          </div>
          <h2
            className="font-display font-bold leading-[0.95] text-white"
            style={{ fontSize: "clamp(1.5rem, 5cqi, 3rem)" }}
          >
            Мы не делаем «ещё один сайт»
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/80">
            KIT — инфраструктура. Наша задача — сделать так, чтобы собственный магазин
            получил трафик, заказы и повторные покупки.
          </p>
        </div>

        <div className="reveal mx-auto mt-10 max-w-3xl rounded-[1.75rem] border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-white" />
            <div>
              <p className="font-display text-base font-bold text-white">
                Вы получаете расчёт до того, как платите за запуск
              </p>
              <p className="mt-2 text-sm leading-6 text-white/75">
                На старте считаем потенциал, сценарии экономики и риски. Если экономика не
                сходится — говорим об этом прямо и не берём деньги за запуск. Считаем, а
                не убеждаем.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Где селлер теряет деньги.
 *
 * Схема намеренно показывает не «как надо», а типовые места утечек на
 * пути от маркетплейса к повторной покупке. Проценты — это не факты по
 * конкретному проекту: они служат масштабом и убраны из подписей, где
 * их приняли бы за обещание результата.
 */
function LossMap() {
  const stages = [
    { label: "Трафик на маркетплейс", share: 100, hint: "Платный и поисковый трафик площадки" },
    {
      label: "Карточка товара",
      share: 42,
      loss: "Низкая конверсия карточки: нет ответов на частые вопросы, слабые фото, нет гарантий",
      hint: "Здесь теряется больше всего — и это самая дешёвая точка для роста",
    },
    {
      label: "Заказ на площадке",
      share: 38,
      hint: "Покупка без контакта с продавцом",
    },
    {
      label: "Заказ в своём магазине",
      share: 12,
      loss: "Нет собственного канала: покупатель не может вернуться напрямую",
      hint: "Здесь появляется Яндекс KIT",
    },
    {
      label: "Повторная покупка",
      share: 30,
      loss: "Нет связи с покупателем: рассылки, бонусы и возврат недоступны",
      hint: "Средний чек растёт не за счёт цены, а за счёт частоты",
    },
  ];

  return (
    // Фон намеренно без заливки: соседние секции на этой странице уже
    // используют bg-muted, и третья подряд слилась бы в одну полосу.
    <section id="losses" className="section-pad">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Путь денег"
            title="Где теряются продажи"
            text="Разбираем путь от маркетплейса до повторной покупки и показываем типовые утечки. Проценты — масштаб для сравнения этапов, а не обещание результата."
          />
        </div>
        <div className="reveal reveal-delay-1 mt-8">
          <JourneyMap stages={stages} legend="Схема типовых потерь, а не данные по проекту" />
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
            title="Предварительный расчёт потенциала"
            text="Подставьте свои цифры. Покажем диапазон по трём сценариям и сразу скажем, что учесть: маржу, количество SKU, стоимость привлечения и долю повторных покупок."
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
            title="Три шага: от расчёта до развития канала"
            text="Начинаем с оценки потенциала. Стоимость следующих шагов подтверждаем после неё — она зависит от объёма и состояния вашей экономики."
          />
        </div>

        {/* Три карточки в две колонки: третья занимает вторую строку
            и по умолчанию прижималась бы влево, оставляя дыру справа.
            last:col-start-2 ставит её по центру относительно двух
            верхних — ряд из трёх читается как лестница, а не как
            таблица с дырой. На мобильном (одна колонка) правило
            не действует, и карточки идут друг за другом. */}
        <div className="grid gap-5 sm:grid-cols-2 [&>*:last-child]:sm:col-start-2">
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
                <p className={`mt-2 text-sm font-bold ${isDark ? "text-white/90" : "text-primary"}`}>
                  {p.price}
                  {p.period ? ` · ${p.period}` : ""}
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
            title="Четыре шага: от диагностики до роста канала"
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

/**
 * Блок «Новое направление» сознательно показывает пустоту seller-кейсов
 * вместо того, чтобы прятать её. Тактика из брифа: честное «направление
 * формируется» работает лучше выдуманных цифр и лишних вопросов.
 */
function NewDirection() {
  return (
    <section className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal mx-auto max-w-3xl rounded-[1.75rem] border border-primary/25 bg-white p-8 text-center sm:p-10">
          <div className="mb-4 inline-flex items-center rounded-full bg-primary-soft px-4 py-1.5 text-xs font-bold text-primary">
            Новое направление
          </div>
          <h2 className="font-display text-2xl font-bold leading-tight text-foreground">
            По продавцам кейсов пока нет — и мы не будем их выдумывать
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            Развиваем собственный канал продаж. Первые проекты формируются: нужны
            первые клиенты, кейсы и подтверждённая экономика, прежде чем мы сможем
            показать реальные цифры. До этого момента — считаем потенциал и объясняем
            логику.
          </p>
          <a href="#potential" className="cta-link mt-6">
            Посмотреть, как считаем потенциал
            <ArrowDown className="h-4 w-4" />
          </a>
        </div>
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
  return <GroupedFaq items={sellerFaq} title="Частые вопросы по направлению" />;
}

/**
 * Переход к заявке.
 *
 * Формы здесь намеренно нет: страница объясняет, как устроены
 * параллельные продажи, и человек приходит с вопросом, а не с
 * готовностью заполнить три поля. Заявка живёт на отдельной
 * странице /sellers/request — туда ведут и этот блок, и финальный
 * CTA. Так путь выглядит как чтение, а не как продажа с первого экрана.
 */
function NextStep() {
  return (
    <section id="next" className="section-pad" style={{ background: "var(--premium)" }}>
      <div className="container-wide">
        <div className="reveal mx-auto max-w-3xl text-center">
          <h2
            className="font-display font-bold leading-[0.98] text-white"
            style={{ fontSize: "clamp(1.5rem, 5cqi, 2.5rem)" }}
          >
            Посчитаем ваш канал
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/80">
            Оставьте ссылку на каталог и примерный оборот — покажем, сколько заказов
            канал может дать в осторожном, базовом и оптимистичном сценариях.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/sellers/request" className="w-full sm:w-auto">
              Оставить заявку на расчёт
            </ButtonLink>
            <a
              href={sellerLinks.question}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
            >
              Сначала задать вопрос
            </a>
          </div>
        </div>
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
              <ButtonLink href="/sellers/request" className="w-full sm:w-auto">
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
