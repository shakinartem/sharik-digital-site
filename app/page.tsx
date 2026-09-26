"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Minus, Store, Stethoscope } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionTitle } from "@/components/ui";
import { CasesSection } from "@/components/CasesSection";
import { agencyDirections, agencyApproach, agencyStats, agencyFaq } from "@/data/agency";
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
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-bold text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            Маркетинговое агентство
          </div>
          <h1
            className="mt-6 font-display font-bold leading-[0.95] tracking-[-0.02em] text-foreground"
            style={{ fontSize: "clamp(2.1rem, 6.5cqi, 4.5rem)" }}
          >
            Строим системы,
            <br />
            которые <span className="text-primary">приносят деньги</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Два специализированных направления: собственные каналы продаж для селлеров маркетплейсов
            и управление пациентопотоком для клиник. Работаем не с набором услуг, а с измеримым
            результатом.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/sellers#potential" className="btn-primary w-full sm:w-auto">
              Селлерам
            </Link>
            <Link href="/clinics#audit" className="btn-outline w-full sm:w-auto">
              Клиникам
            </Link>
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
            text="Мы не делаем «маркетинг вообще». У каждого направления своя методика, свои метрики и своя логика расчёта."
          />
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {agencyDirections.map((direction, index) => {
            const Icon = directionIcons[direction.id as keyof typeof directionIcons];
            return (
              <article
                key={direction.id}
                className="card-base card-lift reveal flex flex-col p-7 sm:p-9"
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-6 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {direction.badge}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold leading-tight text-foreground">
                  {direction.title}
                </h3>
                <p className="mt-1 text-sm font-semibold text-primary">{direction.subtitle}</p>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{direction.lead}</p>
                <ul className="mt-6 space-y-3">
                  {direction.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm text-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Link href={direction.href} className="cta-link mt-8">
                  {direction.cta}
                  <ArrowRight className="h-5 w-5" />
                </Link>
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
            title="Сначала считаем, потом делаем"
            text="Один и тот же порядок работ для обоих направлений: мы не начинаем с продажи услуг."
          />
        </div>
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {agencyApproach.map((step) => (
            <li key={step.step} className="reveal h-full">
              <div className="h-full rounded-card-sm border border-border bg-white p-5">
                <p className="font-display text-sm font-bold text-primary">{step.step}</p>
                <h3 className="mt-2 text-base font-black text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="section-pad bg-muted">
      <div className="container-wide">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {agencyStats.map((stat) => (
            <div key={stat.label} className="reveal text-center">
              <p className="font-display text-5xl font-bold text-primary">{stat.value}</p>
              <p className="mx-auto mt-3 max-w-[15rem] text-sm leading-6 text-muted-foreground">
                {stat.label}
              </p>
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
              {site.directorSummary}
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
