"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ButtonLink, SectionTitle, NumberBadge } from "@/components/ui";
import { CasesSection } from "@/components/CasesSection";
import { agencyDirections, agencyApproach, agencyStats, agencyFaq } from "@/data/agency";
import { site } from "@/data/site";
import { ArrowRight, Plus, Minus, Store, Stethoscope } from "lucide-react";

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

const directionIcons = { sellers: Store, stomatologiya: Stethoscope } as const;

export default function Home() {
  useScrollReveal();

  return (
    <main id="top" className="overflow-x-hidden">
      <SiteHeader />
      <Hero />
      <Directions />
      <Approach />
      <Stats />
      <CasesSection />
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
          <div className="inline-flex items-center rounded-full border border-border bg-white px-4 py-2 text-xs font-black text-foreground">
            Маркетинговое агентство полного цикла
          </div>
          <h1
            className="mt-6 font-black leading-[0.95] text-foreground"
            style={{ fontSize: "clamp(2rem, 6.5cqi, 4.5rem)" }}
          >
            Строим системы,
            <br />
            которые <span className="text-primary">приносят деньги</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Два специализированных направления: собственные каналы продаж для селлеров
            маркетплейсов и управление пациентопотоком для стоматологий. Работаем не с набором
            услуг, а с измеримым результатом.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/sellers#potential" className="w-full sm:w-auto">
              Рассчитать потенциал канала
            </ButtonLink>
            <ButtonLink href="#directions" variant="outline" className="w-full sm:w-auto">
              Смотреть направления
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function Directions() {
  return (
    <section id="directions" className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Направления"
            title="Две разные воронки — два разных подхода"
            text="Маркетплейс и стоматологическая клиника — это разные циклы сделки, разные сроки и разные критерии выбора. Поэтому у каждого направления своя методика."
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {agencyDirections.map((d, i) => {
            const Icon = directionIcons[d.id as keyof typeof directionIcons];
            return (
              <article
                key={d.id}
                className="card-base card-lift reveal flex flex-col p-6 sm:p-8"
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="pill-primary">{d.badge}</span>
                </div>

                <h3
                  className="mt-5 font-black leading-tight text-foreground"
                  style={{ fontSize: "clamp(1.25rem, 2.6vw, 1.75rem)" }}
                >
                  {d.title}
                </h3>
                <p className="mt-1 text-sm font-black text-primary">{d.subtitle}</p>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{d.lead}</p>

                <ul className="mt-5 space-y-2.5">
                  {d.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {p}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-7">
                  <Link href={d.href} className="cta-link text-sm">
                    {d.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Approach() {
  return (
    <section id="approach" className="section-pad">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Подход"
            title="Как мы работаем в любом направлении"
            text="Один и тот же процесс. Различается только предметная область внутри каждого этапа."
          />
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {agencyApproach.map((item, i) => (
            <li
              key={item.step}
              className="card-base card-lift reveal p-5"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <NumberBadge>{item.step}</NumberBadge>
              <h3 className="mt-4 text-base font-black text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="section-pad" style={{ background: "var(--premium)" }}>
      <div className="container-wide">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {agencyStats.map((s, i) => (
            <div key={s.label} className="reveal" style={{ transitionDelay: `${i * 90}ms` }}>
              <p
                className="font-black leading-none text-white"
                style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
              >
                {s.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/75">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Founder() {
  const points = [
    "Два отдельных направления вместо одного универсального",
    "Методология 7К для клиник и расчёт потенциала для селлеров",
    "Работаем на цифрах: юнит-экономика до старта работ",
    "Передаём процессы и документацию, а не держим клиента в зависимости",
  ];

  return (
    <section id="founder" className="section-pad">
      <div className="container-wide">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-12">
          <div className="reveal">
            <div className="card-base overflow-hidden">
              <img
                src="/brand/founder-artem.png"
                alt={`${site.directorName} — основатель ШАРиК digital`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div className="reveal reveal-delay-1">
            <SectionTitle kicker="Основатель" title={site.directorName} />
            <p className="-mt-6 text-sm font-black text-primary">{site.directorRole}</p>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              Я создаю ШАРиК digital как маркетинговое агентство, где у каждого направления есть
              собственная методика и измеримый результат. Для клиник это пациентопоток по
              методологии 7К, для продавцов — расчёт потенциала, запуск канала и рост повторных
              продаж. Мы не обещаем рост цифрами. Мы показываем, откуда эти цифры берутся.
            </p>
            <ul className="mt-6 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {p}
                </li>
              ))}
            </ul>
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
            className="font-black leading-[0.95] text-white"
            style={{ fontSize: "clamp(1.6rem, 5cqi, 3rem)" }}
          >
            Начните с расчёта, а не с покупки
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/80">
            Выберите направление — покажем, где именно в вашей воронке теряются деньги, и
            посчитаем, что можно улучшить в первую очередь.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/sellers#potential" className="w-full sm:w-auto">
              Рассчитать потенциал канала
            </ButtonLink>
            <a
              href={site.links.audit}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-black text-white transition hover:border-white hover:bg-white/10 sm:w-auto"
            >
              Пройти пред-аудит клиники
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
