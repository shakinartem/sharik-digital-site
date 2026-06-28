import { Header } from "@/components/Header";
import { CasesSection } from "@/components/CasesSection";
import { ContactForm } from "@/components/ContactForm";
import { ButtonLink, NumberBadge, SectionTitle } from "@/components/ui";
import { packages, services, site } from "@/data/site";

const keyMetrics = [
  ["+450 лидов", "Максимум в кейсах при правильной воронке и контенте."],
  ["9 кейсов", "Стоматология, медицина и смежные ниши."],
  ["1 digital-система", "Сайт, карты, соцсети, CRM и бот должны работать вместе."],
] as const;

const lossChain = [
  ["Увидел клинику", "Пациент нашёл вас в картах, рекламе, соцсетях или по рекомендации."],
  ["Начал проверять", "Он смотрит отзывы, фото, врачей, сайт, цены и общее впечатление."],
  ["Сравнил варианты", "Если у конкурента понятнее упаковка и маршрут до записи — пациент уйдёт туда."],
  ["Не получил ответа", "Если ответили поздно или без понятного сценария, интерес остывает."],
] as const;

const faq = [
  ["Вы работаете только со стоматологиями?", "Основной фокус — стоматологии и медицинские проекты."],
  ["Можно начать с одной услуги?", "Да. Но лучший результат даёт связка из нескольких точек."],
  ["Зачем нужен Telegram-бот?", "Он выдаёт чек-лист, собирает ответы и помогает довести владельца клиники до разбора."],
] as const;

export default function Home() {
  return (
    <main id="top">
      <Header />
      <Hero />
      <ValueBand />
      <WhyUs />
      <CasesSection />
      <Director />
      <Process />
      <Services />
      <ServicesCta />
      <Packages />
      <Contact />
      <FAQ />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section id="hero" className="relative min-h-[calc(100svh-96px)] overflow-hidden pb-12 pt-8">
      <div className="hero-wash pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute bottom-10 right-8 hidden opacity-[0.07] lg:block">
        <img src="/brand/favicon.svg" alt="" className="h-[32rem] w-[32rem]" />
      </div>
      <div className="container-pad relative grid min-h-[calc(100svh-180px)] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.24em] text-[color:var(--red)]">Маркетинг для стоматологий</p>
          <h1 className="brand-title text-4xl font-semibold leading-[0.95] tracking-tight text-[color:var(--ink)] sm:text-6xl lg:text-7xl">
            ШАРиК Digital строит систему, которая <span className="text-[color:var(--red)]">приводит пациентов</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[color:var(--muted)]">
            Сайт, карты, репутация, контент, CRM и аналитика работают как один маршрут: от первого касания до записи в клинику.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="#contact">Оставить заявку на консультацию</ButtonLink>
            <ButtonLink href="#services" variant="ghost">Посмотреть решения</ButtonLink>
          </div>
        </div>

        <div className="relative min-h-[470px] lg:min-h-[560px]">
          <div className="absolute left-1/2 top-10 hidden h-px w-[72%] -translate-x-1/2 border-t-2 border-dotted border-[color:var(--red)]/70 lg:block" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 lg:absolute lg:inset-x-0 lg:top-0 lg:grid-cols-5">
            {["Увидел клинику", "Изучил услуги", "Поверил отзывам", "Оставил заявку", "Записался"].map((item) => (
              <DiagramNode key={item} label={item} />
            ))}
          </div>

          <div className="absolute left-1/2 top-[42%] hidden -translate-x-1/2 lg:block">
            <img src="/brand/favicon.svg" alt="" className="h-28 w-28" />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:absolute lg:bottom-4 lg:left-0 lg:right-0">
            {keyMetrics.map(([title, text]) => (
              <div key={title} className="border-l-2 border-dotted border-[color:var(--red)]/75 bg-white/70 px-5 py-4 backdrop-blur">
                <div className="text-lg font-bold text-[color:var(--red)]">{title}</div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DiagramNode({ label }: { label: string }) {
  return (
    <div className="grid justify-items-center gap-3 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white bg-white text-sm font-bold text-[color:var(--red)] shadow-[var(--node-shadow)]">
        <span className="h-3 w-3 rounded-full bg-[color:var(--red)]" />
      </div>
      <p className="max-w-[7.5rem] text-sm font-semibold leading-5 text-[color:var(--ink)]">{label}</p>
    </div>
  );
}

function ValueBand() {
  return (
    <section className="px-0 py-6">
      <div className="container-pad">
        <div className="section-divider mb-6" />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "Повышаем доверие до обращения",
            "Упрощаем путь до записи",
            "Усиливаем видимость и аналитику",
          ].map((item) => (
            <div key={item} className="flex items-center gap-4 rounded-[20px] border border-white/80 bg-white/90 p-5">
              <NumberBadge>✓</NumberBadge>
              <p className="font-semibold text-[color:var(--ink)]">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  return (
    <section id="why-us" className="section-pad">
      <div className="container-pad">
        <SectionTitle kicker="Почему мы" title="Смотрим на путь пациента целиком" text="Не отдельная реклама, не просто сайт и не изолированные соцсети. Система должна доводить человека до заявки." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {lossChain.map(([title, text], i) => (
            <div key={title} className="rounded-[20px] border border-white/80 bg-white/90 p-6">
              <div className="text-3xl font-black text-[color:var(--red)]">0{i + 1}</div>
              <h3 className="mt-4 text-xl font-semibold text-[color:var(--ink)]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Director() {
  return (
    <section className="section-pad bg-white/65">
      <div className="container-pad grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div className="rounded-[28px] border border-white/80 bg-white/90 p-8 text-center">
          <div className="brand-glass mx-auto flex h-44 w-44 items-center justify-center rounded-full text-5xl font-black text-[color:var(--ink)]">
            А
          </div>
          <p className="mt-5 text-sm text-[color:var(--muted)]">Фото директора здесь</p>
        </div>
        <div>
          <div className="pill mb-5">Директор</div>
          <h2 className="brand-title text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">{site.directorName}</h2>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--red)]">{site.directorRole}</p>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">{site.directorSummary}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="#contact">Оставить заявку на консультацию</ButtonLink>
            <ButtonLink href={site.botUrl} variant="ghost">Написать в Telegram</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function Process() {
  const steps = ["Диагностика", "Карта роста", "Запуск", "Оптимизация"] as const;
  return (
    <section id="process" className="section-pad">
      <div className="container-pad">
        <SectionTitle kicker="Процесс" title="Четыре шага до результата" text="Сначала находим точки потерь, потом усиливаем путь пациента и закрепляем систему." />
        <div className="grid gap-5 md:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step} className="rounded-[20px] border border-white/80 bg-white/90 p-6">
              <NumberBadge>{i + 1}</NumberBadge>
              <h3 className="mt-5 text-xl font-semibold text-[color:var(--ink)]">{step}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="section-pad bg-white/65">
      <div className="container-pad">
        <SectionTitle kicker="Услуги" title="Что подключаем для роста" text="Только то, что помогает привести пациента к записи и не потерять его по дороге." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map(([title, text]) => (
            <div key={title} className="rounded-[20px] border border-white/80 bg-white/90 p-6">
              <h3 className="text-xl font-semibold text-[color:var(--ink)]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesCta() {
  return (
    <section className="bg-white/65 pb-16">
      <div className="container-pad">
        <div className="section-divider mb-6" />
        <div className="flex flex-col gap-5 rounded-[24px] border border-white/80 bg-white/90 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--red)]">Следующий шаг</p>
            <p className="mt-2 max-w-2xl text-2xl font-semibold leading-tight text-[color:var(--ink)]">
              Разберём, какие элементы digital-системы дадут быстрый эффект именно вашей клинике.
            </p>
          </div>
          <ButtonLink href="#contact">Оставить заявку на консультацию</ButtonLink>
        </div>
      </div>
    </section>
  );
}

function Packages() {
  return (
    <section id="solutions" className="section-pad">
      <div className="container-pad">
        <SectionTitle kicker="Решения" title="Несколько форматов работы" />
        <div className="grid gap-5 lg:grid-cols-4">
          {packages.map(([title, text, items]) => (
            <div key={title} className="rounded-[20px] border border-white/80 bg-white/90 p-6">
              <h3 className="text-xl font-semibold text-[color:var(--ink)]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{text}</p>
              <ul className="mt-5 space-y-2 text-sm text-[color:var(--muted)]">
                {items.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="section-pad bg-white/65">
      <div className="container-pad grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <div className="pill mb-5">Контакты</div>
          <h2 className="brand-title text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">Хотите понять, где клиника теряет пациентов?</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[color:var(--muted)]">
            Оставьте заявку на консультацию — покажем точки роста, приоритеты и следующий шаг без расплывчатых обещаний.
          </p>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="section-pad">
      <div className="container-pad">
        <SectionTitle kicker="FAQ" title="Частые вопросы" />
        <div className="mx-auto max-w-4xl space-y-4">
          {faq.map(([q, a]) => (
            <details key={q} className="rounded-[20px] border border-white/80 bg-white/90 p-6">
              <summary className="cursor-pointer text-lg font-semibold text-[color:var(--ink)]">{q}</summary>
              <p className="mt-4 leading-7 text-[color:var(--muted)]">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[color:var(--line)] bg-white/75 py-10">
      <div className="container-pad flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <img src="/brand/logo-footer.svg" alt="ШАРиК-digital" className="h-10 w-auto" />
          <p className="mt-3 max-w-md text-sm text-[color:var(--muted)]">Digital-система для стоматологий и медицинских проектов.</p>
        </div>
        <div className="flex flex-col items-start gap-3 text-sm text-[color:var(--muted)] md:items-end">
          <ButtonLink href="#contact" className="px-5 py-3 text-sm">Оставить заявку на консультацию</ButtonLink>
          <div className="md:text-right">
            <p>{site.botUsername}</p>
            <p>{site.phone}</p>
            <a href="/privacy" className="mt-2 inline-flex text-[color:var(--red)]">Политика конфиденциальности</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
