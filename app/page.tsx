"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Minus, Store, Stethoscope } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionTitle } from "@/components/ui";
import { CasesSection } from "@/components/CasesSection";
import { FlowScheme } from "@/components/FlowScheme";
import { SystemDashboard } from "@/components/SystemDashboard";
import { CommercialRoute } from "@/components/CommercialRoute";
import { ReviewsSection } from "@/components/ReviewsSection";
import {
  agencyHero,
  agencyDirections,
  agencyPersonas,
  agencyStages,
  agencyApproach,
  agencyFlows,
  agencyStats,
  agencyWhy,
  agencyFaq,
} from "@/data/agency";

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

const directionIcons = { sellers: Store, clinics: Stethoscope } as const;

/**
 * Главная перестроена так, чтобы за 5 секунд читалось, кто мы, за 10 —
 * для кого работаем, за 20 — что именно предлагаем, за 30 — куда нажать.
 *
 * Второй этап переработки, что изменилось:
 *  - Hero стал двухколоночным: слева обещание, справа схема digital-системы.
 *    Раньше это был текстовый блок с плашкой.
 *  - Карточки направления переформулированы на языке задачи: «Я селлер —
 *    хочу свой интернет-магазин» вместо «Селлерам — собственный канал».
 *    Владелец бизнеса узнаёт себя, а не читает название услуги.
 *  - Добавлена секция «Как это работает»: пять стадий с вопросом к каждой.
 *  - Блок основателя удалён полностью. Страница стала продуктовой:
 *    на её месте теперь система, кейсы и понятный маршрут.
 */
export default function Home() {
  useScrollReveal();

  return (
    <main id="top" className="overflow-x-hidden">
      <SiteHeader />
      <Hero />
      <HowWeWork />
      <TwoSystems />
      <Routes />
      <CasesSection limit={4} showAllLink />
      <ReviewsSection />
      <WhySharik />
      <FAQ />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-10 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--primary)" }}
        aria-hidden="true"
      />
      <div className="container-wide">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="reveal">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-bold text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              {agencyHero.name}
            </div>
            <h1
              className="mt-6 font-display font-bold leading-[0.95] tracking-[-0.02em] text-foreground"
              style={{ fontSize: "clamp(2rem, 5.6cqi, 4rem)" }}
            >
              Строим digital-системы,
              <br />
              которые <span className="text-primary">превращают трафик</span> в продажи
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Для селлеров — собственный канал продаж на базе Яндекс KIT.
              <br />
              Для клиник — система управления пациентопотоком.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              Сначала считаем, где теряются деньги. Потом собираем систему вокруг
              конкретного результата.
            </p>
          </div>

          <div className="reveal reveal-delay-2">
            <SystemDashboard />
          </div>
        </div>

        {/* Выбор направления — на языке задачи, а не услуги. Человек должен
            узнать себя: «я селлер, хочу магазин» или «я клиника, хочу записи». */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {agencyPersonas.map((p, i) => {
            const Icon = directionIcons[p.id];
            return (
              <Link
                key={p.id}
                href={p.href}
                className="group reveal flex flex-col rounded-[1.75rem] border border-border bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-black/5 sm:p-7"
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                    {p.eyebrow}
                  </span>
                </div>
                <h2 className="mt-5 font-display text-xl font-bold leading-tight text-foreground sm:text-2xl">
                  {p.want}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{p.stack}</p>
                <ul className="mt-4 space-y-1.5">
                  {p.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {point}
                    </li>
                  ))}
                </ul>
                <span className="mt-6 inline-flex items-center gap-2 font-display text-sm font-bold text-primary">
                  {p.cta}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * «От задачи до результата» — пять стадий. Прежний блок «Не начинаем с
 * набора услуг» объяснял принцип словами; этот показывает его как
 * маршрут, по которому проходит каждый проект.
 */
function HowWeWork() {
  return (
    <section id="how" className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Как это работает"
            title="От задачи до результата"
            text="Пять стадий одинаковых для обоих направлений. Каждая заканчивается результатом, который можно проверить."
          />
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {agencyStages.map((stage, i) => (
            <li
              key={stage.step}
              className="card-base card-lift reveal flex flex-col p-5"
              style={{ transitionDelay: `${(i % 3) * 90}ms` }}
            >
              <span className="font-display text-2xl font-bold leading-none text-primary">
                {stage.step}
              </span>
              <h3 className="mt-3 font-display text-base font-bold text-foreground">
                {stage.title}
              </h3>
              <p className="mt-1 text-xs font-bold text-primary">{stage.question}</p>
              <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{stage.detail}</p>
            </li>
          ))}
        </ol>

        {/* Принцип остался, но теперь он следствие, а не лозунг. */}
        <div className="reveal mt-8 rounded-[1.75rem] border border-border bg-white p-6 sm:p-7">
          <p className="text-sm leading-6 text-foreground">
            <span className="font-bold">Большинство агентств начинают с инструмента:</span>{" "}
            сайт, реклама, SMM, SEO. Мы начинаем с точки потери — и только потом
            решаем, какие инструменты нужны. Если инструмент не закрывает найденную
            потерю, мы его не предлагаем.
          </p>
        </div>
      </div>
    </section>
  );
}

function TwoSystems() {
  return (
    <section id="system" className="section-pad">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Система"
            title="Две задачи. Две системы."
            text="Инструменты живут внутри системы, а не продаются по отдельности. Яндекс KIT — инфраструктура магазина, 7К — методология работы с пациентопотоком."
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {agencyFlows.map((flow, i) => (
            <div
              key={flow.id}
              className="card-base card-lift reveal p-6 sm:p-8"
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="pill-sm bg-primary-soft text-primary">{flow.label}</span>
                <h3 className="font-display text-xl font-bold text-foreground">{flow.title}</h3>
              </div>
              <FlowScheme steps={flow.steps} />
              <Link href={flow.href} className="cta-link mt-6 text-sm">
                Подробнее о направлении
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/**
 * Маршрут до заявки.
 *
 * Ставится сразу после выбора направления: человек уже понял, кому
 * он пришёл, и следующий вопрос — «что дальше и сколько шагов». Ответ
 * показан прямо на странице, а не спрятан в подвале.
 */
function Routes() {
  return (
    <section className="section-pad">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Маршрут"
            title="Как устроен путь до заявки"
            text="Из поиска и с главной — два входа в один результат. На каждом шаге видно, что происходит и зачем."
          />
        </div>
        <div className="reveal reveal-delay-1 mt-8">
          <CommercialRoute />
        </div>
      </div>
    </section>
  );
}

function WhySharik() {
  return (
    <section id="why" className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Почему ШАРиК"
            title="Сначала считаем. Потом запускаем. Затем масштабируем то, что работает."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {agencyWhy.map((item, i) => (
            <div
              key={item.title}
              className="card-base card-lift reveal p-6"
              style={{ transitionDelay: `${(i % 2) * 100}ms` }}
            >
              <h3 className="font-display text-lg font-bold text-foreground">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3 reveal reveal-delay-2">
          {agencyStats.map((m) => (
            <div key={m.label} className="rounded-[1.45rem] bg-primary p-6 text-white">
              <div className="font-display text-3xl font-bold leading-none">{m.value}</div>
              <p className="mt-2 text-sm leading-5 text-white/85">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle kicker="FAQ" title="Частые вопросы" />
        </div>
        <div className="mx-auto mt-10 max-w-3xl">
          {agencyFaq.map((item, i) => (
            <div
              key={i}
              className={`border-t border-border/60 transition-all duration-300 ${openIndex === i ? "bg-primary/5" : ""}`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between py-4 text-left text-base font-black text-foreground transition hover:text-primary"
                aria-expanded={openIndex === i}
              >
                {item.q}
                <span className="ml-4 shrink-0 text-primary">
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
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="section-pad" style={{ background: "var(--premium)" }}>
      <div className="container-wide">
        <div className="reveal mx-auto max-w-3xl text-center">
          <h2
            className="font-display font-bold leading-[0.95] tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(1.7rem, 5cqi, 3rem)" }}
          >
            Начните с расчёта, а не с покупки
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/80">
            Выберите направление — покажем, где именно в вашей воронке теряются деньги, и посчитаем,
            что можно улучшить в первую очередь.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/sellers" className="btn-primary w-full sm:w-auto">
              Селлерам
            </Link>
            <Link
              href="/clinics"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-black text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
            >
              Клиникам
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
