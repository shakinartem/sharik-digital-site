import { Header } from "@/components/Header";
import { CasesSection } from "@/components/CasesSection";
import { ButtonLink, NumberBadge, SectionTitle } from "@/components/ui";
import { packages, problems, services, site, systemItems } from "@/data/site";

const lossChain = [
  ["Увидел клинику", "Пациент нашёл вас в картах, рекламе, соцсетях или по рекомендации."],
  ["Начал проверять", "Он смотрит отзывы, фото, врачей, сайт, цены, соцсети и общее впечатление."],
  ["Сравнил с конкурентами", "Если у конкурента понятнее упаковка и проще записаться — пациент уйдёт туда."],
  ["Попробовал связаться", "Он написал в Telegram, WhatsApp, форму или позвонил."],
  ["Ждал ответа", "Если ответили поздно или без понятного сценария — интерес остывает."],
  ["Не дошёл до записи", "Клиника потратила деньги на внимание, но не получила пациента."],
] as const;

const faq = [
  ["Вы работаете только со стоматологиями?", "Основной фокус — стоматологии и медицинские проекты. Если задача подходит под нашу экспертизу, можем работать и с другими нишами."],
  ["Можно начать только с одной услуги?", "Да. Можно начать с карт, SMM, сайта, лид-магнита или Telegram-бота. Но лучший результат обычно даёт системная связка."],
  ["Почему вы сначала говорите про диагностику, а не про услуги?", "Потому что клиника может терять пациентов в разных местах: на сайте, в картах, отзывах, соцсетях, заявках или при обработке."],
  ["Можно ли получать заявки в Telegram?", "Да. На первом этапе заявки можно отправлять в Telegram. Позже можно подключить CRM, админку или отдельную систему обработки."],
  ["Зачем нужен Telegram-бот?", "Бот выдаёт чек-лист, проводит мини-диагностику, собирает ответы и переводит заинтересованного владельца клиники к разбору."],
  ["Вы делаете рекламу?", "Да, но не рекомендуем начинать с рекламы, если сайт, карты, отзывы и обработка заявок не готовы принимать пациентов."],
] as const;

export default function Home() {
  return (
    <main id="top">
      <Header />
      <Hero />
      <Problems />
      <LossChain />
      <SystemSection />
      <LeadMagnet />
      <Diagnostics />
      <CasesSection />
      <Trust />
      <Founder />
      <Process />
      <Services />
      <Packages />
      <RepeatCTA />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="section-pad overflow-hidden pt-14 sm:pt-20">
      <div className="container-pad grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="pill mb-6">Digital-система для стоматологий и медицинских клиник</div>
          <h1 className="text-3xl font-black tracking-tight text-ink sm:text-5xl lg:text-7xl">
            Находим, где стоматология теряет пациентов, и собираем систему, которая приводит заявки
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            ШАРиК-digital помогает клиникам получать больше обращений из digital-каналов: через карты, сайт, соцсети, контент, Telegram-ботов, CRM и автоматизацию. Мы смотрим весь путь пациента: от первого касания до записи.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={site.botUrl}>Забрать чек-лист в Telegram</ButtonLink>
            <ButtonLink href={site.botUrl} variant="ghost">Получить разбор клиники</ButtonLink>
          </div>
          <p className="mt-4 text-sm text-muted">Чек-лист откроется в Telegram-боте {site.botUsername}. Без спама — только диагностика и возможность получить разбор.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {["9 кейсов в стоматологии и медицине", "До 450 лидов на проект", "Карты, SMM, сайты, CRM и AI", "Быстрый запуск через Telegram-бота"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/70 bg-white/70 p-4 text-sm font-semibold shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-skyBrand/20">✓ {item}</div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="card relative overflow-hidden p-5">
            <img src="/refs/hero.png" alt="Визуал ШАРиК-digital" className="w-full rounded-[24px]" />
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {["Карты", "Заявки", "CRM"].map((item) => <div key={item} className="rounded-2xl bg-soft p-4 text-center text-sm font-bold">{item}</div>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Problems() {
  return (
    <section id="problems" className="section-pad bg-white/50">
      <div className="container-pad">
        <SectionTitle
          kicker="Где теряются пациенты"
          title="Клиника может терять пациентов ещё до первого звонка"
          text="Пациент смотрит карты, отзывы, сайт, соцсети, врачей, цены, фото клиники и скорость ответа. Если хотя бы одна точка выглядит слабо — он уходит к конкуренту."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {problems.map(([title, text], i) => (
            <div key={title} className="card p-6">
              <NumberBadge>{i + 1}</NumberBadge>
              <h3 className="mt-5 text-xl font-bold">{title}</h3>
              <p className="mt-3 leading-7 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LossChain() {
  return (
    <section className="section-pad">
      <div className="container-pad">
        <SectionTitle
          kicker="Цепочка потерь"
          title="Пациент теряется не в одном месте — он теряется по всей цепочке"
          text="Поэтому стоматологии нужен не отдельный SMM, сайт или реклама. Нужна единая digital-система, которая помогает пациенту пройти путь до записи."
        />
        <div className="grid gap-4 lg:grid-cols-6">
          {lossChain.map(([title, text], i) => (
            <div key={title} className="card p-5">
              <div className="mb-4 text-3xl font-black text-skyBrand">0{i + 1}</div>
              <h3 className="font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SystemSection() {
  return (
    <section className="section-pad bg-ink text-white">
      <div className="container-pad">
        <SectionTitle
          kicker="Как должно быть"
          title="Правильный digital для стоматологии — это система, а не набор отдельных услуг"
          text="Сначала находим слабые места, потом собираем связку, которая помогает получать и не терять заявки."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {systemItems.map(([title, text], i) => (
            <div key={title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ink font-bold">{i + 1}</div>
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-3 leading-7 text-slate-300">{text}</p>
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
        <div className="card grid items-center gap-8 overflow-hidden p-6 md:p-10 lg:grid-cols-[0.95fr_1.05fr]">
          <img src="/refs/Бесплатный чек-лист.png" alt="Чек-лист ШАРиК-digital" className="w-full rounded-[24px]" />
          <div>
            <div className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-redBrand">Лид-магнит</div>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">Проверьте, где ваша стоматология теряет пациентов в digital</h2>
            <p className="mt-5 text-lg leading-8 text-muted">Заберите чек-лист для владельцев и управляющих стоматологий: сайт, карты, соцсети, отзывы, заявки и обработка пациентов.</p>
            <div className="mt-6 rounded-3xl bg-soft p-5">
              <h3 className="font-bold">Чек-лист: 25 точек, из-за которых стоматология теряет пациентов</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li>• почему карты могут не приводить обращения;</li>
                <li>• какие ошибки на сайте снижают заявки;</li>
                <li>• где теряются заявки после первого контакта;</li>
                <li>• что стоит автоматизировать в первую очередь.</li>
              </ul>
            </div>
            <div className="mt-7">
              <ButtonLink href={site.botUrl}>Забрать чек-лист в Telegram</ButtonLink>
            </div>
            <p className="mt-3 text-sm text-muted">Чек-лист выдаст бот {site.botUsername}. После получения можно пройти мини-диагностику.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Diagnostics() {
  return (
    <section className="section-pad bg-white/50">
      <div className="container-pad grid items-center gap-8 lg:grid-cols-2">
        <div>
          <div className="pill mb-5">Мини-диагностика в Telegram</div>
          <h2 className="text-3xl font-black tracking-tight sm:text-5xl">После чек-листа можно пройти мини-диагностику клиники</h2>
          <p className="mt-5 text-lg leading-8 text-muted">Бот задаст несколько вопросов и покажет, где сейчас главные потери: в картах, сайте, соцсетях, заявках, обработке или автоматизации.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={site.botUrl}>Пройти диагностику</ButtonLink>
            <ButtonLink href="#cases" variant="ghost">Смотреть кейсы</ButtonLink>
          </div>
        </div>
        <div className="card p-5">
          <img src="/refs/Diagnostic Dashboard.png" alt="Диагностика клиники" className="w-full rounded-[24px]" />
        </div>
      </div>
    </section>
  );
}

function Trust() {
  const items = [
    ["Реклама не спасёт, если сайт не убеждает", "Пациент перешёл по объявлению, но не понял, почему нужно выбрать именно вашу клинику."],
    ["SMM не спасёт, если нет маршрута до записи", "Контент может собирать просмотры, но без кнопок и обработки он не превращается в пациентов."],
    ["Карты не спасут, если репутация слабая", "Даже при хорошем расположении клиника проигрывает, если у конкурентов больше отзывов и доверия."],
    ["CRM не спасёт, если нет заявок", "Автоматизация нужна не вместо маркетинга, а как часть системы."],
  ] as const;
  return (
    <section className="section-pad">
      <div className="container-pad">
        <SectionTitle
          kicker="Системный подход"
          title="Почему отдельные услуги не решают проблему потери пациентов"
          text="Мы не начинаем с “давайте сделаем SMM”. Мы начинаем с вопроса: где именно ваша клиника сейчас теряет пациентов?"
        />
        <div className="grid gap-5 md:grid-cols-2">
          {items.map(([title, text]) => <div key={title} className="card p-6"><h3 className="text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-muted">{text}</p></div>)}
        </div>
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section className="section-pad bg-white/50">
      <div className="container-pad">
        <div className="card grid items-center gap-8 p-6 md:p-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[28px] bg-gradient-to-br from-blue-100 to-red-50 p-8 text-center">
            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-white text-5xl font-black text-skyBrand shadow-soft">А</div>
            <p className="mt-5 text-sm text-muted">Место для фото Артёма</p>
          </div>
          <div>
            <div className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-skyBrand">Основатель</div>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">Шакин Артём — основатель ШАРиК-digital</h2>
            <p className="mt-5 text-lg leading-8 text-muted">Я собираю digital-системы для бизнеса: сайты, Telegram-боты, CRM, автоматизации, AI-инструменты, контент и продвижение. В медицинских проектах важно не просто “быть в интернете”, а вызывать доверие и не терять пациента на пути к записи.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={site.botUrl}>Написать Артёму</ButtonLink>
              <ButtonLink href={site.botUrl} variant="ghost">Получить разбор в Telegram</ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Process() {
  const steps = ["Диагностика", "Карта роста", "Быстрый запуск", "Сборка системы", "Сопровождение"] as const;
  return (
    <section id="process" className="section-pad">
      <div className="container-pad">
        <SectionTitle kicker="Процесс" title="Сначала находим точки потерь, потом собираем решение" />
        <div className="grid gap-5 md:grid-cols-5">
          {steps.map((step, i) => <div key={step} className="card p-5"><NumberBadge>{i + 1}</NumberBadge><h3 className="mt-5 font-bold">{step}</h3></div>)}
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="section-pad bg-white/50">
      <div className="container-pad">
        <SectionTitle kicker="Услуги" title="Какие инструменты мы подключаем для роста клиники" text="Мы не продаём услуги ради услуг. Каждый инструмент подключается только тогда, когда он усиливает путь пациента к записи." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map(([title, text]) => <div key={title} className="card p-6"><h3 className="text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-muted">{text}</p></div>)}
        </div>
      </div>
    </section>
  );
}

function Packages() {
  return (
    <section className="section-pad">
      <div className="container-pad">
        <SectionTitle kicker="Комплексы" title="Можно начать с малого или сразу собрать digital-систему клиники" />
        <div className="grid gap-5 lg:grid-cols-4">
          {packages.map(([title, text, items]) => (
            <div key={title} className="card flex flex-col p-6">
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-muted">
                {items.map((item) => <li key={item}>• {item}</li>)}
              </ul>
              <div className="mt-6"><ButtonLink href={site.botUrl} variant="ghost">Обсудить</ButtonLink></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RepeatCTA() {
  return (
    <section className="section-pad bg-ink text-white">
      <div className="container-pad text-center">
        <h2 className="mx-auto max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">Не уверены, с чего начать? Заберите чек-лист и проверьте клинику</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">25 точек, по которым можно быстро понять, где стоматология теряет пациентов: в картах, сайте, соцсетях, отзывах, заявках или обработке.</p>
        <div className="mt-8"><ButtonLink href={site.botUrl}>Получить чек-лист в Telegram</ButtonLink></div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="section-pad bg-white/50">
      <div className="container-pad">
        <SectionTitle kicker="FAQ" title="Ответы на частые вопросы" />
        <div className="mx-auto max-w-4xl space-y-4">
          {faq.map(([q, a]) => <details key={q} className="card p-6"><summary className="cursor-pointer text-lg font-bold">{q}</summary><p className="mt-4 leading-7 text-muted">{a}</p></details>)}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="contacts" className="section-pad">
      <div className="container-pad">
        <div className="card bg-gradient-to-br from-white to-blue-50 p-8 text-center md:p-12">
          <h2 className="mx-auto max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">Хотите понять, где ваша клиника теряет пациентов?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted">Оставьте заявку через Telegram-бота — разберём digital-точки и покажем, что можно улучшить в первую очередь.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href={site.botUrl}>Получить разбор в Telegram</ButtonLink>
            <ButtonLink href={site.botUrl} variant="ghost">Задать вопрос в Telegram</ButtonLink>
          </div>
          <p className="mt-5 text-sm text-muted">Телефон / Telegram / WhatsApp / MAX: {site.phone}</p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="container-pad flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <img src="/brand/logo-footer.svg" alt="ШАРиК-digital" className="h-10 w-auto" />
          <p className="mt-3 max-w-md text-sm text-muted">Digital-системы для стоматологий и медицинских проектов.</p>
        </div>
        <div className="text-sm text-muted">
          <p>{site.botUsername}</p>
          <p>{site.phone}</p>
          <a href="/privacy" className="mt-2 inline-flex text-skyBrand">Политика конфиденциальности</a>
        </div>
      </div>
    </footer>
  );
}
