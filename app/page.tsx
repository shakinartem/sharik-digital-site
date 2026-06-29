import { Header } from "@/components/Header";
import { CasesSection } from "@/components/CasesSection";
import { ButtonLink, NumberBadge, SectionTitle } from "@/components/ui";
import { packages, problems, services, site, systemItems } from "@/data/site";

const keyMetrics = [
  ["25 точек", "Чек-лист помогает быстро увидеть слабые места digital-маршрута."],
  ["5 минут", "Мини-диагностика в Telegram без обязательного телефона."],
  ["1 маршрут", "Карты, сайт, отзывы, заявки, CRM и бот связываются в одну систему."],
] as const;

const patientPath = ["Увидел клинику", "Проверил доверие", "Сравнил", "Написал", "Записался"] as const;

const lossChain = [
  ["Не заметил", "Клиника плохо видна в картах, поиске, соцсетях или рекомендациях."],
  ["Не нашёл ответы", "На сайте и в карточках не хватает понятных услуг, врачей, ценности и сценария записи."],
  ["Не доверился", "Отзывы, фото, контент и упаковка не снимают тревогу перед обращением."],
  ["Не оставил заявку", "Кнопки, мессенджеры, лид-магнит и путь до контакта не собраны в простой маршрут."],
  ["Не дошёл до записи", "Заявка обработана поздно, нет статуса, CRM, уведомлений или понятного следующего шага."],
] as const;

const diagnosticResults = [
  ["3–5 точек потерь", "Покажем, где клиника может терять пациентов: в картах, сайте, соцсетях, заявках или обработке."],
  ["Приоритеты на запуск", "Поможем понять, что чинить первым: упаковку, карты, сайт, Telegram-бота, CRM или контент."],
  ["Карту быстрых улучшений", "Сформируем список действий, которые можно внедрить без долгой перестройки."],
  ["Понимание системы", "Покажем, как связать digital-каналы, заявки и обработку в один маршрут пациента."],
] as const;

const founderPoints = [
  "Карты, репутация и отзывы",
  "Сайты, CRM и Telegram-боты",
  "SMM, контент и упаковка врачей",
  "AI-инструменты и автоматизация",
] as const;

const faq = [
  ["Почему CTA ведёт в Telegram?", "Так владелец клиники быстро получает чек-лист, проходит мини-диагностику и не заполняет длинную форму с обязательным телефоном."],
  ["Телефон обязателен?", "Нет. Бот сохранит Telegram-профиль и задаст несколько вопросов. Телефон можно дать позже, если удобно."],
  ["Можно начать только с чек-листа?", "Да. Чек-лист показывает первые точки потерь, а диагностика помогает понять приоритеты для разбора."],
] as const;

export default function Home() {
  return (
    <main id="top">
      <Header />
      <Hero />
      <ValueBand />
      <LossMap />
      <LossChain />
      <LeadMagnet />
      <MiniDiagnostic />
      <DiagnosticOutcome />
      <CasesSection />
      <SystemApproach />
      <Founder />
      <Process />
      <Services />
      <Packages />
      <RepeatChecklistCta />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden pb-10 pt-6 sm:pb-12 sm:pt-8 lg:min-h-[calc(100svh-96px)]">
      <div className="hero-wash pointer-events-none absolute inset-0" />
      <div className="container-pad relative grid gap-8 lg:min-h-[calc(100svh-180px)] lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--red)] sm:mb-5 sm:text-sm sm:tracking-[0.24em]">Digital-диагностика для стоматологий</p>
          <h1 className="brand-title text-4xl font-semibold leading-[0.95] tracking-tight text-[color:var(--ink)] sm:text-6xl lg:text-7xl">
            Находим, где стоматология <span className="text-[color:var(--red)]">теряет пациентов</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
            Собираем digital-систему, которая доводит человека от первого касания до заявки и записи: сайт, карты, отзывы, Telegram-бот, CRM, контент и аналитика.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={site.links.checklist}>Забрать чек-лист в Telegram</ButtonLink>
            <ButtonLink href={site.links.audit} variant="ghost">Понять, где теряются пациенты</ButtonLink>
          </div>
          <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">
            Бот выдаст чек-лист, задаст несколько вопросов и подведёт к разбору клиники. Телефон не обязателен.
          </p>
        </div>

        <div className="relative min-h-[360px] sm:min-h-[430px] lg:min-h-[590px]">
          <div className="absolute left-1/2 top-2 z-10 -translate-x-1/2 sm:top-4 lg:top-28">
            <img src="/brand/mascot-balloon.png" alt="Фирменный воздушный шар ШАРиК-digital" className="h-36 w-36 object-contain drop-shadow-2xl sm:h-44 sm:w-44 lg:h-64 lg:w-64" />
          </div>
          <div className="absolute left-1/2 top-24 hidden h-px w-[72%] -translate-x-1/2 border-t-2 border-dotted border-[color:var(--red)]/70 lg:block" />
          <div className="grid grid-cols-2 gap-4 pt-40 sm:grid-cols-5 sm:pt-48 lg:absolute lg:inset-x-0 lg:top-0 lg:grid-cols-5 lg:pt-0">
            {patientPath.map((item) => (
              <DiagramNode key={item} label={item} />
            ))}
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
          {["Сайт ведёт в Telegram-бота", "Чек-лист показывает точки потерь", "Диагностика готовит разбор клиники"].map((item) => (
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

function LossMap() {
  return (
    <section id="loss-map" className="section-pad">
      <div className="container-pad">
        <SectionTitle
          kicker="Где теряются пациенты"
          title="Проблема редко в одной рекламе"
          text="Пациент может потеряться на сайте, в картах, отзывах, переписке, звонке или CRM. Поэтому мы смотрим на весь маршрут до записи."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {problems.map(([title, text]) => (
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

function LossChain() {
  return (
    <section id="loss-chain" className="section-pad bg-white/65">
      <div className="container-pad">
        <SectionTitle kicker="Цепочка потерь" title="Пять мест, где путь ломается" text="Если хотя бы одно звено провисает, пациент может не дойти до записи даже при хорошем трафике." />
        <div className="grid gap-5 md:grid-cols-5">
          {lossChain.map(([title, text], index) => (
            <div key={title} className="rounded-[20px] border border-white/80 bg-white/90 p-6">
              <div className="text-3xl font-black text-[color:var(--red)]">0{index + 1}</div>
              <h3 className="mt-4 text-xl font-semibold text-[color:var(--ink)]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LeadMagnet() {
  return (
    <section id="checklist" className="section-pad">
      <div className="container-pad">
        <div className="grid gap-8 rounded-[28px] border border-white/80 bg-white/90 p-6 md:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="pill mb-5">Чек-лист: 25 точек, из-за которых стоматология теряет пациентов</div>
            <h2 className="brand-title text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">
              Проверьте, где ваша стоматология теряет пациентов в digital
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              Чек-лист помогает быстро пройтись по картам, сайту, соцсетям, отзывам, заявкам, обработке и аналитике. В конце станет видно, что требует внимания первым.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={site.links.checklist}>Забрать чек-лист в Telegram</ButtonLink>
              <ButtonLink href={site.links.audit} variant="ghost">Понять, где теряются пациенты</ButtonLink>
            </div>
          </div>
          <div className="relative min-h-72 overflow-hidden rounded-[24px] bg-[color:var(--blue-soft)] p-6">
            <img src="/brand/mascot-balloon.png" alt="" className="absolute -right-8 -top-8 h-52 w-52 object-contain opacity-10" />
            <div className="relative space-y-4">
              {["Карты и локальная видимость", "Сайт и посадочные страницы", "Отзывы и доверие", "Заявки, CRM и скорость ответа"].map((item, index) => (
                <div key={item} className="flex items-center gap-4 border-b border-dotted border-[color:var(--red)]/40 pb-4">
                  <NumberBadge>{index + 1}</NumberBadge>
                  <p className="font-semibold text-[color:var(--ink)]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniDiagnostic() {
  return (
    <section id="diagnostic" className="section-pad bg-white/65">
      <div className="container-pad grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <div className="pill mb-5">Мини-диагностика в Telegram</div>
          <h2 className="brand-title text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">Бот задаст вопросы и покажет слабые места</h2>
        </div>
        <div className="rounded-[28px] border border-white/80 bg-white/90 p-6 md:p-8">
          <p className="text-lg leading-8 text-[color:var(--muted)]">
            Бот задаст несколько вопросов про карты, сайт, соцсети, отзывы, заявки и скорость обработки. По ответам станет понятно, где клиника теряет пациентов сейчас.
          </p>
          <div className="mt-7">
            <ButtonLink href={site.links.audit}>Пройти диагностику в Telegram</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function DiagnosticOutcome() {
  return (
    <section className="section-pad">
      <div className="container-pad">
        <SectionTitle kicker="После диагностики" title="Что вы получите после диагностики" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {diagnosticResults.map(([title, text], index) => (
            <div key={title} className="rounded-[20px] border border-white/80 bg-white/90 p-6">
              <NumberBadge>{index + 1}</NumberBadge>
              <h3 className="mt-5 text-xl font-semibold text-[color:var(--ink)]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <ButtonLink href={site.links.audit}>Понять, где теряются пациенты</ButtonLink>
        </div>
      </div>
    </section>
  );
}

function SystemApproach() {
  return (
    <section id="system" className="section-pad">
      <div className="container-pad">
        <SectionTitle kicker="Системный подход" title="Собираем маршрут пациента целиком" text="Не продаём отдельный инструмент ради инструмента. Связываем каналы, заявки и обработку в понятный маршрут." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {systemItems.map(([title, text]) => (
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

function Founder() {
  return (
    <section id="founder" className="section-pad bg-white/65">
      <div className="container-pad grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div className="rounded-[28px] border border-white/80 bg-white/90 p-8 text-center">
          <div className="brand-glass mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[28px]">
            <img src="/brand/founder-artem.png" alt="Шакин Артём, основатель ШАРиК-digital" className="h-full w-full object-cover object-center" />
          </div>
          <p className="mt-5 text-sm text-[color:var(--muted)]">Основатель ШАРиК-digital</p>
        </div>
        <div>
          <div className="pill mb-5">Основатель</div>
          <h2 className="brand-title text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">Шакин Артём — основатель ШАРиК-digital</h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[color:var(--muted)]">{site.directorSummary}</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {founderPoints.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/85 p-4">
                <NumberBadge>✓</NumberBadge>
                <p className="font-semibold text-[color:var(--ink)]">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={site.links.audit}>Понять, где теряются пациенты</ButtonLink>
            <ButtonLink href={site.links.question} variant="ghost">Задать вопрос в Telegram</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function Process() {
  const steps = ["Чек-лист", "Мини-диагностика", "Разбор клиники", "Карта роста", "Внедрение"] as const;
  return (
    <section id="process" className="section-pad">
      <div className="container-pad">
        <SectionTitle kicker="Процесс" title="От чек-листа до системы" text="Сначала находим точки потерь, потом усиливаем маршрут пациента и закрепляем результат." />
        <div className="grid gap-5 md:grid-cols-5">
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
        <SectionTitle kicker="Услуги" title="Что подключаем после диагностики" text="Только то, что помогает не терять пациента по дороге к заявке и записи." />
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

function Packages() {
  return (
    <section id="solutions" className="section-pad">
      <div className="container-pad">
        <SectionTitle kicker="Решения" title="Форматы работы" text="После чек-листа и диагностики становится понятнее, какой формат нужен именно вашей клинике." />
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

function RepeatChecklistCta() {
  return (
    <section className="section-pad bg-white/65">
      <div className="container-pad">
        <div className="section-divider mb-6" />
        <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/90 p-6 md:p-8">
          <img src="/brand/mascot-balloon.png" alt="" className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 object-contain opacity-10" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--red)]">Повторный CTA</p>
              <p className="mt-2 max-w-2xl text-2xl font-semibold leading-tight text-[color:var(--ink)]">
                Начните с чек-листа: он быстро покажет, где пациент может отваливаться до записи.
              </p>
            </div>
            <ButtonLink href={site.links.checklist}>Забрать чек-лист в Telegram</ButtonLink>
          </div>
        </div>
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

function Contact() {
  return (
    <section id="contact" className="section-pad bg-white/65">
      <div className="container-pad grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="pill mb-5">Контакты</div>
          <h2 className="brand-title text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">Хотите понять, где клиника теряет пациентов?</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[color:var(--muted)]">
            Получите чек-лист или пройдите мини-диагностику в Telegram. Бот сохранит Telegram-профиль и задаст несколько вопросов. Телефон не обязателен.
          </p>
        </div>
        <div className="rounded-[28px] border border-white/80 bg-white/90 p-6 md:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <ButtonLink href={site.links.audit}>Получить разбор в Telegram</ButtonLink>
            <ButtonLink href={site.links.checklist} variant="ghost">Забрать чек-лист</ButtonLink>
          </div>
          <p className="mt-5 text-sm leading-6 text-[color:var(--muted)]">
            Дополнительный способ связи: <a href={`tel:${site.phone.replace(/\D/g, "")}`} className="font-semibold text-[color:var(--red)]">{site.phone}</a>
          </p>
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
          <p className="mt-3 max-w-md text-sm text-[color:var(--muted)]">Digital-система для стоматологий: чек-лист, диагностика, разбор и внедрение.</p>
        </div>
        <div className="flex flex-col items-start gap-3 text-sm text-[color:var(--muted)] md:items-end">
          <ButtonLink href={site.links.checklist} className="px-5 py-3 text-sm">Забрать чек-лист в Telegram</ButtonLink>
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
