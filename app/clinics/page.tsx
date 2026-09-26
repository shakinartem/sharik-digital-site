"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CasesSection } from "@/components/CasesSection";
import { PreAuditForm } from "@/components/PreAuditForm";
import { ButtonLink, SectionTitle, NumberBadge } from "@/components/ui";
import { JourneyMap } from "@/components/JourneyMap";
import {
  ChartIcon,
  ArrowIcon,
  MapPinIcon,
  ShieldIcon,
  ChatIcon,
  CalendarIcon,
  UsersIcon,
  RefreshIcon,
  ControlIcon,
  ChevronDownIcon,
} from "@/components/icons";
import { site, contours7K } from "@/data/site";
import { Eye, FileText, PhoneCall, BarChart3, MessageCircle, ArrowRightToLine, RotateCcw, ArrowUpRight, Plus, Minus } from "lucide-react";

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.08 }
    );

    const targets = document.querySelectorAll(".reveal");
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

const contourIcons = [Eye, ShieldIcon, FileText, MessageCircle, PhoneCall, RotateCcw, BarChart3];

const faq = [
  { q: "Чем вы отличаетесь от digital-агентства?", a: "Digital-агентства продают услуги: сайты, рекламу, SMM. Мы продаём систему. Направление Patient Flow в ШАРиК digital: наша задача — сделать так, чтобы пациент приходил, записывался, лечился, возвращался и приводил друзей." },
  { q: "Что такое Индекс пациентопотока?", a: "Это метрика, которая оценивает здоровье системы привлечения и удержания пациентов по шкале от 0 до 100. ИПП складывается из 7 параметров — от охвата касаний до прозрачности аналитики. Значение считается по вашим данным, а не сравнивается с отраслевым нормативом." },
  { q: "Можно ли заказать только сайт или только рекламу?", a: "Мы не рекомендуем заказывать услуги по отдельности. Сайт без контура доверия и конверсии — это красивый буклет, который не приводит пациентов." },
  { q: "Сколько стоит внедрение системы?", a: "Диагностика — бесплатно. Внедрение одного контура — фиксированная стоимость. Полное внедрение системы 7К — индивидуальный проект." },
  { q: "Как быстро будет результат?", a: "Первые изменения видны через 2–4 недели. Устойчивый эффект — от 2 до 6 месяцев в зависимости от формата. Точные сроки внутри кейсов — по фактическим внедрениям." },
  { q: "Вы работаете только со стоматологами?", a: "Да, мы специализируемся исключительно на стоматологических клиниках. Понимаем специфику цикла принятия решения, сезонности и юридических аспектов." },
];

const founderPoints = [
  "Направление Patient Flow внутри ШАРиК digital",
  "Методология 7К для стоматологий",
  "Измеряем результат индексом пациентопотока",
  "90-дневные циклы внедрения вместо одиночных услуг",
];

export default function ClinicsPage() {
  useScrollReveal();

  return (
    <main id="top" className="overflow-x-hidden">
      <SiteHeader
        ctaLabel="Бесплатный аудит"
        ctaHref="#contact"
        solidBg
      />
      <Hero />
      <Methodology7K />
      <PatientLossMap />
      <FlowIndex />
      <DarkStats />
      <CasesSection />
      <WhatWeImplement />
      <Founder />
      <CollaborationFormats />
      <FAQ />
      <PreAuditForm />
      <SiteFooter />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-20 sm:pb-20 sm:pt-24 lg:pb-24 lg:pt-32 min-h-[calc(100svh-5rem)] lg:min-h-[calc(100svh-4rem)]">
      <div className="container-wide h-full flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="grid gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-center w-full">
          <div className="reveal">
            <div className="mb-5 inline-flex items-center rounded-full bg-muted px-4 py-1.5 text-xs font-bold text-muted-foreground">
              ШАРиК digital · Направление: Patient Flow
            </div>
            <h1
              className="font-display font-bold leading-[0.95] text-foreground"
              style={{ fontSize: "clamp(1.9rem, min(7cqi, 5rem), 4.4rem)" }}
            >
              Помогаем клиникам <span className="text-primary">видеть и закрывать</span> потери пациентов
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Методология 7К показывает, где пациент теряется — от первого касания до записи
              и повторного визита.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={site.links.audit}>Пройти пред-аудит</ButtonLink>
              <ButtonLink href="#cases" variant="outline">
                Посмотреть кейсы
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              5 минут — и увидите, где ваша клиника теряет пациентов.
            </p>
          </div>

          <div className="relative reveal reveal-delay-2">
            <SevenKDiagram />
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="card-sm p-4 shadow-card">
                <div className="text-2xl font-display font-bold text-primary">25</div>
                <p className="mt-1 text-xs text-muted-foreground">точек контроля</p>
              </div>
              <div className="card-sm p-4 shadow-card">
                <div className="text-2xl font-display font-bold text-primary">7</div>
                <p className="mt-1 text-xs text-muted-foreground">контуров пациентопотока</p>
              </div>
              <div className="card-sm p-4 shadow-card">
                <div className="text-2xl font-display font-bold text-primary">90</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  дней — цикл внедрения
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SevenKDiagram() {
  const cx = 200, cy = 160, radius = 110, centerR = 28;
  const angles = [0, 1, 2, 3, 4, 5, 6].map((i) => (i * 51.43 - 90) * (Math.PI / 180));
  const labels = ["1К", "2К", "3К", "4К", "5К", "6К", "7К"];

  return (
    <svg viewBox="0 0 400 320" className="mx-auto w-full max-w-md" aria-hidden="true">
      {angles.map((a, i) => {
        const next = angles[(i + 1) % 7];
        return (
          <line
            key={`line-${i}`}
            x1={cx + radius * Math.cos(a)}
            y1={cy + radius * Math.sin(a)}
            x2={cx + radius * Math.cos(next)}
            y2={cy + radius * Math.sin(next)}
            stroke="#D1D5DB"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={centerR} fill="#FFF" stroke="#760229" strokeWidth="1.5" />
      <text x={cx} y={cy + 5} textAnchor="middle" className="text-sm font-black" fill="#760229" style={{ fontFamily: "var(--font-body)" }}>
        7К
      </text>
      {angles.map((a, i) => {
        const x = cx + radius * Math.cos(a);
        const y = cy + radius * Math.sin(a);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={28} fill="#FFF" stroke={i === 0 ? "#760229" : "#D1D5DB"} strokeWidth="1.5" />
            <text x={x} y={y + 5} textAnchor="middle" className="text-sm font-black" fill={i === 0 ? "#760229" : "#6B7280"} style={{ fontFamily: "var(--font-body)" }}>
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Methodology7K() {
  // New order: 1, 5, 2, 6, 3, 7, 4
  const order = [0, 4, 1, 5, 2, 6, 3];

  return (
    <section id="methodology-7k" className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Методология 7К"
            title="7 контуров, которые работают как единый механизм"
            text="Не разовые услуги, а семь контуров, каждый из которых решает конкретную задачу в маршруте пациента."
          />
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {order.map((idx) => {
            const contour = contours7K[idx];
            const Icon = contourIcons[idx];
            const label = `${idx + 1}К`;
            return (
              <div key={contour.id} className="card-base card-lift relative overflow-hidden p-6 sm:p-7">
                <div className="absolute right-4 top-4 text-5xl font-black text-primary/10 select-none">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <Icon className="mb-4 h-6 w-6 text-primary" strokeWidth={1.5} />
                <div className="text-xs font-black text-primary">{label}</div>
                <h3
                  className="mt-1 font-black text-foreground"
                  style={{ fontSize: "clamp(1.2rem, min(4cqi, 5rem), 1.75rem)", lineHeight: 1.05 }}
                >
                  {contour.title}
                </h3>
                <div className="mt-4 space-y-2">
                  <p className="flex items-start gap-2 text-xs font-black text-primary">
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>Проверяем: {contour.check}</span>
                  </p>
                  <p className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                    <span>Потеря: {contour.loss}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-10 text-center reveal reveal-delay-3">
          <div className="card-sm mx-auto inline-block max-w-2xl p-5 shadow-card">
            <p className="text-base font-black text-foreground">
              Каждый контур — это конкретная точка потери или точка роста. Мы проверяем все 7 контуров и показываем, с чего стоит начать.
            </p>
          </div>
        </div>
        <div className="mt-8 text-center reveal reveal-delay-4">
          <ButtonLink href={site.links.audit}>Начать с диагностики</ButtonLink>
        </div>
      </div>
    </section>
  );
}

/**
 * Где клиника теряет пациентов.
 *
 * Показывает путь от карт до повторного визита и типовые утечки на
 * каждом переходе. Проценты — масштаб этапов, а не результат по
 * конкретной клинике: без замеров это было бы выдуманным обещанием.
 */
function PatientLossMap() {
  const stages = [
    { label: "Поиск клиники", share: 100, hint: "Карты, поиск, рекомендации" },
    {
      label: "Выбор клиники",
      share: 35,
      loss: "Нет понятного ответа: чем лечат, сколько стоит и когда есть свободное окно",
      hint: "Решение пациента почти всегда сводится к этим трём вопросам",
    },
    {
      label: "Обращение",
      share: 45,
      loss: "Заявка ушла в мессенджер и потерялась: нет подтверждения и напоминания",
      hint: "Здесь нужен быстрый ответ администратора",
    },
    {
      label: "Запись",
      share: 55,
      loss: "Не дозвонились или не перезвонили — пациент уходит к другой клинике",
      hint: "Скорость ответа влияет на конверсию сильнее рекламы",
    },
    {
      label: "Лечение",
      share: 85,
      hint: "Пациент дошёл до кресла" },
    {
      label: "Повторный визит",
      share: 40,
      loss: "Нет напоминаний и профилактики: пациент не возвращается сам",
      hint: "Повторный визит стоит в разы дешевле привлечения",
    },
  ];

  return (
    <section id="losses" className="section-pad">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Путь пациента"
            title="Где теряются пациенты"
            text="Разбираем путь от первого поиска до повторного визита и показываем типовые утечки. Проценты — масштаб для сравнения этапов, а не обещание результата."
          />
        </div>
        <div className="reveal reveal-delay-1 mt-8">
          <JourneyMap stages={stages} legend="Схема типовых потерь, а не данные по клинике" />
        </div>
      </div>
    </section>
  );
}

function FlowIndex() {
  return (
    <section id="flow-index" className="section-pad bg-background">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Индекс пациентопотока"
            title="Метрика, которая заменяет гадание"
            text="Вместо разрозненных KPI — один числовой показатель здоровья вашего потока пациентов. ИПП учитывает 7 параметров и выдаёт оценку от 0 до 100."
          />
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="reveal reveal-delay-1">
            <RadarChart />
          </div>
          <div className="reveal reveal-delay-2">
            <div className="card-base p-6 sm:p-7">
              <h3 className="font-black text-foreground" style={{ fontSize: "clamp(1.2rem, min(4cqi, 5rem), 1.75rem)", lineHeight: 1.05 }}>
                Что получите после пред-аудита:
              </h3>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                {["Ваш текущий ИПП от 0 до 100", "Карту потерь: конкретные этапы", "3–5 приоритетных действий", "План внедрения по контурам", "PDF-отчёт на email"].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <ButtonLink href={site.links.audit}>Рассчитать индекс пациентопотока</ButtonLink>
            </div>
          </div>
        </div>
        {/* Нормативы «средний индекс до внедрения 50–100» и «целевой 85+»
            убраны: достаточной статистической базы, чтобы называть их
            средним и целевым, у нас нет. Осталась только шкала и
            методика расчёта. */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {[
            { value: "0–100", label: "шкала ИПП" },
            { value: "7", label: "параметров оценки" },
          ].map((m) => (
            <div key={m.value} className="card-sm p-4 shadow-card reveal">
              <div
                className="font-black text-primary leading-none"
                style={{ fontSize: "clamp(1.3rem, min(4cqi, 5rem), 2.5rem)" }}
              >
                {m.value}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RadarChart() {
  const points = 7;
  const cx = 200, cy = 180, r = 130;

  const getPoint = (i: number, scale: number) => {
    const angle = (i * (360 / points) - 90) * (Math.PI / 180);
    return { x: cx + r * scale * Math.cos(angle), y: cy + r * scale * Math.sin(angle) };
  };

  const data = [0.85, 0.7, 0.6, 0.75, 0.5, 0.4, 0.65];
  const labels = ["Касание", "Доверие", "Конкретика", "Контакт", "Конверсия", "Курация", "Контроль"];

  return (
    <svg viewBox="0 0 400 360" className="mx-auto w-full max-w-sm" aria-hidden="true">
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon
          key={scale}
          points={Array.from({ length: points }, (_, i) => {
            const p = getPoint(i, scale);
            return `${p.x},${p.y}`;
          }).join(" ")}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: points }, (_, i) => {
        const p = getPoint(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E5E7EB" strokeWidth="1" />;
      })}
      <polygon
        points={data.map((d, i) => {
          const p = getPoint(i, d);
          return `${p.x},${p.y}`;
        }).join(" ")}
        fill="rgba(118, 2, 41, 0.1)"
        stroke="#760229"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const p = getPoint(i, d);
        return <circle key={i} cx={p.x} cy={p.y} r="4" fill="#760229" />;
      })}
      {labels.map((label, i) => {
        const p = getPoint(i, 1.18);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="text-[10px] font-black" fill="#6B7280" style={{ fontFamily: "var(--font-body)" }}>
            {label}
          </text>
        );
      })}
    </svg>
  );
}

const flowMetrics = [
  { value: "7", label: "контуров пациентопотока" },
  { value: "9+", label: "реализованных проектов" },
  { value: "90", label: "дней — цикл внедрения" },
];

function DarkStats() {
  return (
    <section className="section-pad" style={{ background: "var(--premium)" }}>
      <div className="container-wide">
        <div className="reveal">
          <h2
            className="text-center font-black leading-[0.95] text-white"
            style={{ fontSize: "clamp(1.4rem, min(5cqi, 5rem), 3.6rem)" }}
          >
            Patient Flow в цифрах
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {flowMetrics.map((m) => (
            <div
              key={m.label}
              className="reveal"
              style={{
                borderRadius: "1.45rem",
                borderColor: "rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.08)",
              }}
            >
              <div className="bg-white/8 p-5 rounded-[1.45rem] backdrop-blur-md text-center">
                <div
                  className="font-black text-white leading-none"
                  style={{ fontSize: "clamp(1.5rem, min(4cqi, 5rem), 2.75rem)" }}
                >
                  {m.value}
                </div>
                <p className="mt-2 text-sm text-white/85">{m.label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 reveal">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-6 backdrop-blur-md text-center">
            <p className="text-base font-black text-white">
              Мои медиа: Telegram-канал, YouTube, подкаст о пациентопотоке
            </p>
            <div className="mt-4">
              <ButtonLink href={site.links.consultation} variant="outline">
                Задать вопрос
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const implementGroups = [
  {
    title: "Касание + Доверие",
    icon: Eye,
    items: ["Карты и локальная видимость", "Репутация и отзывы", "Реклама с привязкой к потоку"],
    note: "Клиника становится заметной и вызывает доверие на первом же касании.",
  },
  {
    title: "Доверие + Конкретика",
    icon: ShieldIcon,
    items: ["Упаковка клиники и позиционирование", "Личный бренд врача", "SMM и контент-маркетинг"],
    note: "Пациент понимает, почему выбрать именно эту клинику.",
  },
  {
    title: "Конкретика + Контакт",
    icon: FileText,
    items: ["Сайты и посадочные страницы", "Формы записи и мессенджеры", "Telegram-боты для сбора заявок"],
    note: "Каждое касание ведёт к конкретному действию — записи, звонку, заявке.",
  },
  {
    title: "Контакт + Конверсия",
    icon: MessageCircle,
    items: ["Скрипты и обучение администраторов", "Обработка «подумаю» и недозвонов", "Реактивация и повторные касания"],
    note: "Ни один пациент не теряется после первого контакта.",
  },
  {
    title: "Конверсия + Курация",
    icon: BarChart3,
    items: ["CRM и автоматизация", "Сквозная аналитика", "Дашборды и отчёты"],
    note: "Вся система управляется по цифрам, а не по ощущениям.",
  },
];

function WhatWeImplement() {
  return (
    <section id="services" className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Что внедряем"
            title="Контуры пациентопотока"
            text="Мы не продаём услуги по отдельности. Мы собираем контуры — готовые блоки системы."
          />
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {implementGroups.slice(0, 4).map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.title} className="card-base card-lift p-6 sm:p-7 reveal">
                <div className="mb-4 flex items-center gap-3">
                  <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                  <h3 className="text-xl font-black text-foreground">{group.title}</h3>
                </div>
                <p className="text-sm leading-7 text-muted-foreground">{group.items.join(" · ")}</p>
                <div className="mt-4 rounded-[1.45rem] border border-border bg-white p-5">
                  <p className="text-sm font-black text-foreground">{group.note}</p>
                </div>
              </div>
            );
          })}
        </div>
        {/* 5-я карточка "Конверсия + Курация" посередине */}
        <div className="mt-5 flex justify-center">
          <div className="card-base card-lift max-w-2xl p-6 sm:p-7 reveal">
            {(() => {
              const group = implementGroups[4];
              const Icon = group.icon;
              return (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                    <h3 className="text-xl font-black text-foreground">{group.title}</h3>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">{group.items.join(" · ")}</p>
                  <div className="mt-4 rounded-[1.45rem] border border-border bg-white p-5">
                    <p className="text-sm font-black text-foreground">{group.note}</p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
        <div className="mt-10 text-center reveal">
          <div className="card-sm mx-auto inline-block max-w-xl p-5 shadow-card">
            <p className="text-base font-black text-foreground">
              Не уверены, какой контур нужен? Начните с пред-аудита. Мы проверим все 7 контуров и покажем, с чего стоит начать именно вам.
            </p>
          </div>
          <div className="mt-6">
            <ButtonLink href={site.links.audit}>Пройти пред-аудит</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section id="founder" className="section-pad bg-background">
      <div className="container-wide">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div className="reveal">
            <div className="card-base overflow-hidden p-5 text-center sm:p-7">
              <div className="mx-auto mb-4 inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white">
                Направление: Patient Flow
              </div>
              <div className="mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-section bg-muted">
                <img src="/brand/founder-artem.png" alt="Шакин Артём" className="h-full w-full object-cover object-center" />
              </div>
              <p className="mt-5 text-sm font-black text-foreground">Шакин Артём</p>
              <p className="text-sm text-muted-foreground">Основатель ШАРиК digital</p>
            </div>
          </div>
          <div className="reveal reveal-delay-1">
            <div className="mb-5 inline-flex items-center rounded-full bg-muted px-4 py-1.5 text-xs font-black text-muted-foreground">
              Основатель
            </div>
            <h2
              className="font-black leading-[0.95] text-foreground"
              style={{ fontSize: "clamp(1.4rem, min(5cqi, 5rem), 3.6rem)" }}
            >
              ШАРиК digital для клиник
            </h2>
            <div className="mt-5 space-y-4 text-base leading-7 text-muted-foreground">
              <p>Я создаю digital-системы, где маркетинг, заявки и обработка работают как единый маршрут пациента.</p>
              <p>Наша миссия — научить стоматологию управлять пациентопотоком: видеть потери, закрывать утечки, измерять результат.</p>
              <p>Мы работаем по методологии 7К: каждый контур оценивается по единому критерию — закрывает ли он потерю пациента.</p>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {founderPoints.map((item) => (
                <div key={item} className="card-lift flex items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-card">
                  <NumberBadge>✓</NumberBadge>
                  <p className="text-sm font-black text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const formats = [
  {
    badge: "Базовый",
    title: "База присутствия",
    desc: "Закрываем критические потери в 1–3 контурах: контакт, доверие, действие",
    includes: ["Карты и локальная видимость", "Репутация и отзывы", "Базовая рекламная упаковка", "Быстрый старт маршрута"],
  },
  {
    badge: "Системный",
    title: "Система привлечения",
    desc: "Связываем 4–6 контуров в единый маршрут + контроль",
    includes: ["Упаковка клиники и позиционирование", "Личный бренд врачей", "Telegram-бот и мессенджеры", "Скрипты и реактивация"],
    recommended: true,
  },
  {
    badge: "Масштабирование",
    title: "Полная система 7К",
    desc: "Полный контур 1–7, индекс потока и 90-дневные циклы внедрения",
    includes: ["Полный контур 1–7", "Индекс пациентопотока", "90-дневные циклы внедрения", "Сквозная аналитика"],
    fullSystem: true,
  },
];

function CollaborationFormats() {
  return (
    <section id="solutions" className="section-pad bg-background">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Форматы работы"
            title="Варианты карт"
            text="Выбираем формат под задачу: отдельные участки или полная система 7К."
          />
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {formats.map((f, i) => (
            <div
              key={f.title}
              className={`card-base card-lift p-6 sm:p-7 reveal ${
                f.recommended ? "ring-2 ring-primary shadow-xl" : 
                f.fullSystem ? "ring-2 ring-primary shadow-xl" : ""
              }`}
            >
              <div className="mb-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-black bg-white/10 border border-white/20 text-white">
                {f.badge}
              </div>
              <h3
                className="font-black text-foreground"
                style={{ fontSize: "clamp(1.2rem, min(4cqi, 5rem), 1.75rem)", lineHeight: 1.05 }}
              >
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              <ul className="mt-6 space-y-2">
                {f.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <ButtonLink href={site.links.audit} variant={f.recommended || f.fullSystem ? "primary" : "outline"}>
                  {f.recommended ? "На встречу" : "Обсудить"}
                </ButtonLink>
              </div>
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
          {faq.map((item, i) => (
            <div key={i} className={`border-t border-border/60 transition-all duration-300 ${openIndex === i ? "bg-primary/5" : ""}`}>
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between py-4 text-left text-base font-black text-foreground transition hover:text-primary"
              >
                {item.q}
                <span className="ml-4 shrink-0 text-primary transition-transform duration-200" style={{ transform: openIndex === i ? "rotate(180deg)" : undefined }}>
                  {openIndex === i ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? "max-h-96 pb-4" : "max-h-0"}`}>
                <p className="text-base leading-7 text-muted-foreground">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
