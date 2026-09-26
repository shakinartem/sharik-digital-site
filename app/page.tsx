"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Minus, Store, Stethoscope } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionTitle } from "@/components/ui";
import { CasesSection } from "@/components/CasesSection";
import { FlowScheme } from "@/components/FlowScheme";
import {
  agencyHero,
  agencyDirections,
  agencyApproach,
  agencyFlows,
  agencyStats,
  agencyWhy,
  agencyFaq,
} from "@/data/agency";
import { site } from "@/data/site";

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
 * Главная сокращена примерно на треть и перестроена по принципу
 * «заинтересовать → объяснить → дать выбор».
 *
 * Что изменилось и почему:
 *  - Плашка «Маркетинговое агентство» из Hero убрана: формулировка
 *    слишком общая и противоречит позиционированию. В Hero теперь
 *    стоит главная мысль бренда.
 *  - Отдельная секция «Две разные воронки» удалена. Она дословно
 *    повторяла то, что уже сказано в Hero, из-за чего страница
 *    рассказывала про направления дважды подряд. Выбор направления
 *    теперь встроен в Hero.
 *  - Секция «Результаты в цифрах» удалена: цифры переехали в блок
 *    «Почему ШАРиК», где они уместны как доказательство, а не
 *    как самоцель.
 *  - Добавлена секция «Система» с двумя схемами потоков — это
 *    отвечает на вопрос «что вы такое» без перечисления услуг.
 *  - Кейсы ограничены четырьмя избранными вместо всех девяти.
 */
export default function Home() {
  useScrollReveal();

  return (
    <main id="top" className="overflow-x-hidden">
      <SiteHeader />
      <Hero />
      <Approach />
      <System />
      <CasesSection limit={4} showAllLink />
      <WhySharik />
      <Founder />
      <FAQ />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-12 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--primary)" }}
        aria-hidden="true"
      />
      <div className="container-wide">
        <div className="reveal mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-bold text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            {agencyHero.name}
          </div>
          <h1
            className="mt-6 font-display font-bold leading-[0.95] tracking-[-0.02em] text-foreground"
            style={{ fontSize: "clamp(2.1rem, 6.5cqi, 4.5rem)" }}
          >
            Строим digital-системы,
            <br />
            которые <span className="text-primary">превращают трафик</span> в продажи
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {agencyHero.sub}
          </p>
        </div>

        {/* Выбор направления встроен в Hero: пользователь ещё не выбрал
            направление, поэтому единственный CTA здесь был бы преждевременным. */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
          {agencyDirections.map((d, i) => {
            const Icon = directionIcons[d.id];
            return (
              <Link
                key={d.id}
                href={d.href}
                className="group reveal flex flex-col rounded-[1.75rem] border border-border bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-black/5 sm:p-7"
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 font-display text-sm font-bold uppercase tracking-[0.08em] text-primary">
                  {d.title}
                </h2>
                <p className="mt-2 font-display text-xl font-bold leading-tight text-foreground">
                  {d.subtitle}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{d.meta}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-primary">
                  {d.cta}
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

function Approach() {
  return (
    <section id="approach" className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Подход"
            title="Не начинаем с набора услуг"
            text="Большинство агентств начинают с инструмента: сайт, реклама, SMM, SEO. Мы начинаем с точки потери — и только потом решаем, какие инструменты нужны."
          />
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {agencyApproach.map((step, i) => (
            <li
              key={step.step}
              className="card-base card-lift reveal p-5"
              style={{ transitionDelay: `${(i % 3) * 90}ms` }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-black text-primary" style={{ fontSize: "1.5rem" }}>
                  {step.step}
                </span>
              </div>
              <h3 className="mt-3 font-display text-base font-bold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function System() {
  return (
    <section id="system" className="section-pad">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Система"
            title="Два направления — две специализированные системы"
            text="Инструменты живут внутри системы, а не продаются по отдельности. KIT — инфраструктура seller-канала, 7К — методология работы с пациентопотоком."
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

function Founder() {
  return (
    <section id="founder" className="section-pad">
      <div className="container-wide">
        <div className="card-base reveal grid gap-8 p-7 sm:p-10 lg:grid-cols-[auto,1fr] lg:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary font-display text-3xl font-bold text-white">
            АШ
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">{site.directorRole}</p>
            <h2 className="mt-1 font-display text-3xl font-bold leading-tight text-foreground">
              {site.directorName}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              В ШАРиК digital два направления: собственные каналы продаж для селлеров
              и пациентопоток для клиник. Методология 7К работает во втором.
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              Сначала считаю, где именно теряются деньги, и только потом предлагаю, что
              с этим делать. Если потенциала нет — говорю об этом прямо и не беру деньги
              за запуск.
            </p>
            <Link href="/about" className="cta-link mt-6">
              Подробнее о нас
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
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
