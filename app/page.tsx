import { Header } from "@/components/Header";
import { CasesSection } from "@/components/CasesSection";
import { PreAuditForm } from "@/components/PreAuditForm";
import { ButtonLink, NumberBadge, SectionTitle } from "@/components/ui";
import {
  ArrowIcon,
  BotIcon,
  CalendarIcon,
  ChartIcon,
  ChatIcon,
  ChevronDownIcon,
  CompareIcon,
  DzenSocialIcon,
  MaxSocialIcon,
  MegaphoneIcon,
  MapPinIcon,
  PasteIcon,
  ShieldIcon,
  TelegramSocialIcon,
  ToothIcon,
  ToothbrushIcon,
  VkSocialIcon,
} from "@/components/icons";
import { packages, problems, services, site, systemItems } from "@/data/site";

const keyMetrics = [
  { title: "25 точек", text: "Чек-лист быстро показывает слабые места digital-маршрута.", icon: ChartIcon },
  { title: "5 минут", text: "Мини-диагностика в Telegram с понятными вопросами по маршруту пациента.", icon: BotIcon },
  { title: "1 маршрут", text: "Карты, сайт, отзывы, заявки, CRM и бот связываются в систему.", icon: ArrowIcon },
] as const;

const patientPath = [
  { label: "Увидел клинику", icon: MapPinIcon, className: "lg:left-[4%] lg:top-[50%]" },
  { label: "Проверил доверие", icon: ShieldIcon, className: "lg:left-[18%] lg:top-[17%]" },
  { label: "Сравнил", icon: CompareIcon, className: "lg:left-1/2 lg:top-[5%] lg:-translate-x-1/2" },
  { label: "Написал", icon: ChatIcon, className: "lg:right-[18%] lg:top-[17%]" },
  { label: "Записался", icon: CalendarIcon, className: "lg:right-[4%] lg:top-[50%]" },
] as const;

const lossChain = [
  { title: "Не заметил", text: "Клиника плохо видна в картах, поиске, соцсетях или рекомендациях.", icon: MapPinIcon },
  { title: "Не нашёл ответы", text: "На сайте и в карточках не хватает понятных услуг, врачей, ценности и сценария записи.", icon: ShieldIcon },
  { title: "Не доверился", text: "Отзывы, фото, контент и упаковка не снимают тревогу перед обращением.", icon: ToothIcon },
  { title: "Не оставил заявку", text: "Кнопки, мессенджеры, лид-магнит и путь до контакта не собраны в простой маршрут.", icon: ChatIcon },
  { title: "Не дошёл до записи", text: "Заявка обработана поздно, нет статуса, CRM, уведомлений или понятного следующего шага.", icon: CalendarIcon },
] as const;

const diagnosticResults = [
  { title: "3–5 точек потерь", text: "Покажем, где клиника может терять пациентов: в картах, сайте, соцсетях, заявках или обработке.", icon: MapPinIcon, className: "lg:col-span-2" },
  { title: "Приоритеты на запуск", text: "Поможем понять, что чинить первым: упаковку, карты, сайт, Telegram-бота, CRM или контент.", icon: ChartIcon, className: "" },
  { title: "Карта быстрых улучшений", text: "Сформируем список действий, которые можно внедрить без долгой перестройки.", icon: ArrowIcon, className: "" },
  { title: "Понимание системы", text: "Покажем, как связать digital-каналы, заявки и обработку в один маршрут пациента.", icon: BotIcon, className: "lg:col-span-2" },
] as const;

const founderPoints = [
  "Команда с опытом работы со стоматологиями",
  "Понимаем путь пациента внутри клиники",
  "Соединяем маркетинг, разработку и автоматизацию",
  "3 года в digital и медицинских проектах",
] as const;

const faq = [
  ["Почему вы начинаете с диагностики, а не с рекламы?", "Реклама усиливает то, что уже собрано. Сначала нужно увидеть, где теряются заявки: в картах, сайте, доверии, кнопках или обработке."],
  ["Что входит в чек-лист?", "25 точек проверки: карты, сайт, соцсети, отзывы, заявки, CRM, скорость ответа и понятность маршрута пациента."],
  ["Что такое пред-аудит в Telegram?", "Короткая диагностика в боте. Вы отвечаете на вопросы, а мы видим первичные зоны риска до полноценного разбора."],
  ["Нужно ли оставлять контакт сразу?", "Нет. Основной сценарий идёт через Telegram-профиль: бот соберёт контекст и подведёт к разбору."],
  ["Можно ли начать без сайта?", "Да. Часто первые потери видны в картах, отзывах, соцсетях и обработке обращений."],
  ["Вы работаете только со стоматологиями?", "Фокус сайта — стоматологии. Также есть опыт в смежной медицине, где важны доверие, запись и аккуратная коммуникация."],
  ["Что быстрее всего даст результат?", "Обычно быстрые улучшения дают карты, отзывы, понятный CTA и скорость обработки заявки."],
  ["Можно ли подключить CRM позже?", "Да. На старте можно собрать маршрут через Telegram и уведомления, а CRM подключить после диагностики процесса."],
  ["Чем вы отличаетесь от обычного SMM-подрядчика?", "Мы смотрим не только на публикации, а на путь пациента: от первого касания до заявки, ответа администратора и записи."],
  ["Как понять, что клиника теряет заявки именно в обработке?", "Смотрим скорость ответа, статусы обращений, уведомления, повторные касания и то, доходит ли диалог до записи."],
] as const;

const caseMetrics = ["до 450 лидов", "1,5 млн охват", "146 обращений", "+68% действий в картах", "52 новых отзыва", "97 лидов"] as const;
const problemDecorIcons = [ToothIcon, ToothbrushIcon, PasteIcon, MapPinIcon, BotIcon, MegaphoneIcon] as const;

const serviceHints = [
  "Когда соцсети не объясняют ценность врачей",
  "Когда карты не дают обращений",
  "Когда сайт не ведёт к заявке",
  "Когда заявки теряются в переписке",
  "Когда нет статусов и контроля",
  "Когда рутину можно ускорить",
  "Когда система уже готова принимать трафик",
] as const;

export default function Home() {
  return (
    <main id="top" className="overflow-x-hidden">
      <Header />
      <Hero />
      <LossMap />
      <LossChain />
      <LeadMagnet />
      <DiagnosticOutcome />
      <MiniDiagnostic />
      <CasesSection />
      <SystemApproach />
      <Founder />
      <Services />
      <Packages />
      <RepeatChecklistCta />
      <FAQ />
      <PreAuditForm />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden pb-10 pt-6 sm:pb-12 sm:pt-8 lg:min-h-[calc(100svh-96px)]">
      <div className="hero-wash pointer-events-none absolute inset-0" />
      <div className="container-pad relative grid gap-8 lg:min-h-[calc(100svh-180px)] lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--red)] sm:mb-5 sm:text-sm sm:tracking-[0.24em]">Digital-диагностика для стоматологий</p>
          <h1 className="brand-title text-4xl font-semibold leading-[0.95] text-[color:var(--ink)] sm:text-6xl lg:text-7xl">
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
            Бот выдаст чек-лист, задаст несколько вопросов и подведёт к разбору клиники.
          </p>
        </div>

        <div className="relative min-h-[540px] sm:min-h-[560px] lg:min-h-[620px]">
          <svg className="orbit-arrows pointer-events-none absolute left-1/2 top-10 hidden h-72 w-[92%] -translate-x-1/2 text-[color:var(--red)] lg:block" viewBox="0 0 760 270" fill="none">
            <defs>
              <marker id="orbitArrow" markerHeight="10" markerWidth="10" orient="auto" refX="8" refY="5">
                <path d="M1 1 9 5 1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </marker>
            </defs>
            <path className="path-dash" d="M70 204C92 145 126 112 164 92" stroke="currentColor" strokeWidth="2.2" strokeDasharray="4 11" markerEnd="url(#orbitArrow)" />
            <path className="path-dash" d="M208 76C266 48 326 39 380 40" stroke="currentColor" strokeWidth="2.2" strokeDasharray="4 11" markerEnd="url(#orbitArrow)" />
            <path className="path-dash" d="M412 40C476 40 536 52 590 80" stroke="currentColor" strokeWidth="2.2" strokeDasharray="4 11" markerEnd="url(#orbitArrow)" />
            <path className="path-dash" d="M636 96C666 124 688 157 706 202" stroke="currentColor" strokeWidth="2.2" strokeDasharray="4 11" markerEnd="url(#orbitArrow)" />
          </svg>
          <div className="absolute left-1/2 top-20 z-10 -translate-x-1/2 lg:top-40">
            <img src="/brand/mascot-balloon.png" alt="Фирменный воздушный шар ШАРиК-digital" className="balloon-float h-40 w-40 object-contain drop-shadow-2xl sm:h-48 sm:w-48 lg:h-64 lg:w-64" />
            <span className="balloon-shadow absolute left-1/2 top-full -z-10 h-5 w-36 -translate-x-1/2 rounded-full bg-[color:var(--blue)]/15 blur-md lg:w-48" aria-hidden="true" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-64 sm:grid-cols-5 lg:absolute lg:inset-0 lg:block lg:pt-0">
            {patientPath.map((item) => (
              <DiagramNode key={item.label} node={item} />
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:absolute lg:bottom-2 lg:left-0 lg:right-0">
            {keyMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.title} className="metric-card card-lift rounded-[22px] border border-white/90 bg-white/85 px-5 py-4 shadow-[var(--node-shadow)] backdrop-blur">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-[color:var(--red)]" />
                    <div className="metric-pulse text-xl font-black text-[color:var(--red)]">{metric.title}</div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{metric.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function DiagramNode({ node }: { node: (typeof patientPath)[number] }) {
  const Icon = node.icon;
  return (
    <div className={`grid justify-items-center gap-3 text-center lg:absolute ${node.className}`}>
      <div className="icon-float flex h-14 w-14 items-center justify-center rounded-full border border-white bg-white text-[color:var(--red)] shadow-[var(--node-shadow)]">
        <Icon className="h-6 w-6" />
      </div>
      <p className="max-w-[7.5rem] text-sm font-semibold leading-5 text-[color:var(--ink)]">{node.label}</p>
    </div>
  );
}

function LossMap() {
  const icons = [MapPinIcon, ChatIcon, ShieldIcon, CalendarIcon, ArrowIcon, BotIcon] as const;

  return (
    <section id="loss-map" className="section-pad relative">
      <ToothIcon className="pointer-events-none absolute left-4 top-24 h-16 w-16 text-[color:var(--red)] opacity-10 lg:left-14" />
      <div className="container-pad">
        <SectionTitle
          kicker="Где теряются пациенты"
          title="Проблема редко в одной рекламе"
          text="Пациент может потеряться на сайте, в картах, отзывах, переписке, звонке или CRM. Поэтому мы смотрим на весь маршрут до записи."
        />
        <div className="mb-7 flex flex-wrap justify-center gap-2">
          {caseMetrics.map((metric) => (
            <span key={metric} className="premium-badge rounded-full border border-[color:var(--line)] bg-white/90 px-4 py-2 text-sm font-bold text-[color:var(--red)] shadow-sm">
              {metric}
            </span>
          ))}
        </div>
        <div className="relative">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {problems.map(([title, text], index) => {
              const Icon = icons[index];
              const DecorIcon = problemDecorIcons[index];
              return (
                <div key={title} className="card-lift relative z-10 min-h-64 overflow-hidden rounded-[20px] border border-white/80 bg-white/90 p-6 shadow-[var(--node-shadow)]">
                  <DecorIcon className="pointer-events-none absolute -right-3 -top-3 h-20 w-20 text-[color:var(--red)] opacity-[0.08]" />
                  <Icon className="mb-5 h-8 w-8 text-[color:var(--red)]" />
                  <h3 className="text-xl font-semibold text-[color:var(--ink)]">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{text}</p>
                </div>
              );
            })}
          </div>
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
        <div className="relative grid gap-5 md:grid-cols-5">
          {lossChain.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="card-lift relative z-10 rounded-[20px] border border-white/80 bg-white/90 p-5 shadow-[var(--node-shadow)] md:even:mt-8 md:odd:mt-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-3xl font-black text-[color:var(--red)]">0{index + 1}</div>
                  <Icon className="h-7 w-7 text-[color:var(--red)]" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-[color:var(--ink)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LeadMagnet() {
  return (
    <section id="checklist" className="section-pad">
      <div className="container-pad">
        <div className="lead-magnet-shell relative grid gap-8 overflow-hidden rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[var(--node-shadow)] md:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <img src="/brand/mascot-balloon.png" alt="" className="balloon-float pointer-events-none absolute -right-10 -top-10 h-44 w-44 object-contain opacity-10" />
          <div className="relative">
            <div className="pill mb-5">Чек-лист: 25 точек, из-за которых стоматология теряет пациентов</div>
            <div className="mb-4 inline-flex rounded-full bg-[color:var(--red)] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white">PDF / Telegram</div>
            <h2 className="brand-title text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">
              Проверьте, где ваша стоматология теряет пациентов в digital
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              Чек-лист помогает быстро пройтись по картам, сайту, соцсетям, отзывам, заявкам, обработке и аналитике. В конце станет видно, что требует внимания первым.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={site.links.checklist}>Забрать чек-лист в Telegram</ButtonLink>
            </div>
          </div>
          <div className="relative rounded-[24px] bg-[color:var(--blue-soft)] p-5">
            <div className="rounded-[22px] border border-[color:var(--line)] bg-white p-5 shadow-lg">
              <div className="mb-5 flex items-center justify-between border-b border-dotted border-[color:var(--line)] pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--red)]">Диагностическая карта</p>
                  <h3 className="mt-1 text-xl font-bold text-[color:var(--ink)]">25 точек проверки</h3>
                </div>
                <ToothIcon className="h-9 w-9 text-[color:var(--red)]" />
              </div>
              {["Карты и локальная видимость", "Сайт и посадочные страницы", "Отзывы и доверие", "Заявки, CRM и скорость ответа"].map((item, index) => (
                <div key={item} className="checklist-row flex items-center gap-4 border-b border-dotted border-[color:var(--line)]/55 py-4 last:border-0">
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

function DiagnosticOutcome() {
  return (
    <section className="section-pad">
      <div className="container-pad">
        <SectionTitle kicker="После диагностики" title="Что вы получите после диагностики" />
        <div className="grid gap-5 lg:grid-cols-3">
          {diagnosticResults.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className={`card-lift relative z-10 rounded-[20px] border border-white/80 bg-white/90 p-6 shadow-[var(--node-shadow)] ${item.className}`}>
                <div className="flex items-center justify-between gap-3">
                  <NumberBadge>{index + 1}</NumberBadge>
                  <Icon className="h-7 w-7 text-[color:var(--red)]" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-[color:var(--ink)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{item.text}</p>
              </div>
            );
          })}
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
          <p className="mt-5 text-lg leading-8 text-[color:var(--muted)]">
            Один главный сценарий: пройти пред-аудит, получить контекст и перейти к разбору клиники.
          </p>
          <div className="mt-7">
            <ButtonLink href={site.links.audit}>Пройти пред-аудит в Telegram</ButtonLink>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-lg rounded-[30px] border border-[color:var(--line)] bg-[color:var(--blue)] p-4 shadow-2xl">
          <div className="rounded-[24px] bg-white p-4">
            <div className="mb-4 flex items-center gap-3 border-b border-[color:var(--line)] pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--blue-soft)] text-[color:var(--red)]"><BotIcon className="h-5 w-5" /></span>
              <div>
                <p className="font-bold text-[color:var(--ink)]">ШАРиК-бот</p>
                <p className="text-xs text-[color:var(--muted)]">пред-аудит клиники</p>
              </div>
            </div>
            {[
              "Проверим, где пациент может потеряться до записи?",
              "С чего начнём: карты, сайт, соцсети или обработка заявок?",
              "Достаточно ответить на несколько вопросов — бот сохранит контекст для разбора.",
            ].map((message) => (
              <div key={message} className="mb-3 max-w-[88%] rounded-2xl bg-[color:var(--blue-soft)] px-4 py-3 text-sm leading-6 text-[color:var(--ink)] odd:max-w-[76%] even:ml-auto even:bg-[color:var(--red-glass)]">
                {message}
              </div>
            ))}
            <div className="mt-4 flex flex-wrap gap-2">
              {["Карты", "Сайт", "Заявки", "Не знаю"].map((item) => (
                <span key={item} className="rounded-full bg-[color:var(--red)] px-3 py-2 text-xs font-bold text-white">{item}</span>
              ))}
              <span className="rounded-full border border-[color:var(--line)] bg-white px-3 py-2 text-xs font-bold text-[color:var(--red)]">Начать пред-аудит</span>
            </div>
          </div>
          <img src="/brand/mascot-balloon.png" alt="" className="balloon-float pointer-events-none absolute -right-7 -top-8 h-24 w-24 object-contain" />
        </div>
      </div>
    </section>
  );
}

function SystemApproach() {
  const icons = [ToothIcon, MapPinIcon, ChatIcon, CalendarIcon, BotIcon, ChartIcon] as const;

  return (
    <section id="system" className="section-pad">
      <div className="container-pad">
        <SectionTitle kicker="Системный подход" title="Собираем маршрут пациента целиком" text="Не продаём отдельный инструмент ради инструмента. Связываем каналы, заявки и обработку в понятный маршрут." />
        <div className="relative mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {systemItems.map(([title, text], index) => {
            const Icon = icons[index];
            const positions = ["", "lg:translate-y-5", "", "", "lg:translate-y-5", ""];
            return (
              <div key={title} className={`card-lift rounded-[20px] border border-white/80 bg-white/90 p-6 shadow-[var(--node-shadow)] ${positions[index]}`}>
                <div className="flex items-center gap-3">
                  <Icon className="h-7 w-7 text-[color:var(--red)]" />
                  <h3 className="text-xl font-semibold text-[color:var(--ink)]">{title}</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section id="founder" className="section-pad bg-white/65">
      <div className="container-pad grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div className="relative rounded-[28px] border border-white/80 bg-white/90 p-5 text-center shadow-[var(--node-shadow)] md:p-8">
          <div className="absolute right-5 top-5 rounded-full bg-[color:var(--red)] px-4 py-2 text-sm font-bold text-white">3 года опыта</div>
          <div className="brand-glass mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[28px]">
            <img src="/brand/founder-artem.png" alt="Шакин Артём, основатель ШАРиК-digital" className="h-full w-full object-cover object-center" />
          </div>
          <p className="mt-5 text-sm font-semibold text-[color:var(--ink)]">Шакин Артём</p>
          <p className="text-sm text-[color:var(--muted)]">Основатель ШАРиК-digital</p>
        </div>
        <div>
          <div className="pill mb-5">Основатель</div>
          <h2 className="brand-title text-4xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-5xl">Шакин Артём — основатель ШАРиК-digital</h2>
          <div className="mt-5 space-y-4 text-lg leading-8 text-[color:var(--muted)]">
            <p>Я собираю digital-системы для стоматологий и медицинских проектов: сайты, Telegram-боты, CRM, автоматизации, AI-инструменты, контент и продвижение.</p>
            <p>Важное отличие ШАРиК-digital — мы смотрим не только на рекламу и красивые страницы, а на реальный путь пациента внутри клиники: как человек выбирает врача, где проверяет доверие, куда пишет, как быстро получает ответ и доходит ли до записи.</p>
            <p>В команде есть специалисты, которые напрямую работают со стоматологическими клиниками и понимают внутренние процессы: администраторов, врачей, обработку обращений, карты, отзывы и повторные касания.</p>
            <p>За 3 года работы в digital и медицинских проектах мы пришли к простой логике: клинике нужна не отдельная услуга, а связанная система, где маркетинг, заявки и обработка работают вместе.</p>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {founderPoints.map((item) => (
              <div key={item} className="card-lift flex items-center gap-3 rounded-2xl border border-white/80 bg-white/85 p-4">
                <NumberBadge>✓</NumberBadge>
                <p className="font-semibold text-[color:var(--ink)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const icons = [ChatIcon, MapPinIcon, ToothIcon, BotIcon, CalendarIcon, ChartIcon, ArrowIcon] as const;

  return (
    <section id="services" className="section-pad bg-white/65">
      <div className="container-pad">
        <SectionTitle kicker="Услуги" title="Что подключаем после диагностики" text="Только то, что помогает не терять пациента по дороге к заявке и записи." />
        <div className="service-ribbon flex flex-col gap-4 md:flex-row md:flex-wrap">
          {services.map(([title, text], index) => {
            const Icon = icons[index];
            return (
              <div key={title} className="service-pill card-lift rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-[var(--node-shadow)] md:min-w-[280px] md:flex-1">
                <div className="flex items-center gap-3">
                  <Icon className="h-7 w-7 shrink-0 text-[color:var(--red)]" />
                  <h3 className="text-lg font-semibold text-[color:var(--ink)]">{title}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{text}</p>
                <p className="mt-4 rounded-2xl bg-[color:var(--blue-soft)] px-4 py-3 text-sm font-semibold text-[color:var(--ink)]">Когда подключаем: {serviceHints[index].replace("Когда ", "")}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Packages() {
  return (
    <section id="solutions" className="section-pad">
      <div className="container-pad">
        <SectionTitle kicker="Решения" title="Форматы работы как путь взросления клиники" text="После чек-листа и диагностики становится понятнее, какой формат нужен именно вашей клинике." />
        <div className="grid gap-5 lg:grid-cols-3">
          {packages.map((item) => (
            <div key={item.title} className={`card-lift package-card relative z-10 rounded-[22px] border bg-white/90 p-6 shadow-[var(--node-shadow)] ${item.price === "300 000 ₽" ? "recommended-package" : ""}`}>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-[color:var(--red)] px-3 py-1 text-xs font-bold text-white">{item.badge}</span>
                <span className={`availability-pill availability-${item.availabilityTone} inline-flex rounded-full px-3 py-1 text-xs font-bold`}>{item.availability}</span>
                <span className="inline-flex rounded-full border border-[color:var(--line)] bg-white px-3 py-1 text-xs font-bold text-[color:var(--red)]">{item.price}</span>
              </div>
              <div className="text-4xl font-black leading-none text-[color:var(--ink)]">{item.price.replace(" ₽", "")}</div>
              <h3 className="brand-title mt-4 text-2xl font-semibold text-[color:var(--ink)]">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{item.goal}</p>
              <ul className="mt-5 space-y-2 text-sm leading-6 text-[color:var(--muted)]">
                {item.includes.map((entry) => <li key={entry}>• {entry}</li>)}
              </ul>
              <div className="mt-6">
                <ButtonLink href={site.links.audit} variant={item.price === "300 000 ₽" ? "primary" : "ghost"} className="min-h-10 px-4 py-2 text-xs">Обсудить пакет</ButtonLink>
              </div>
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
        <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[var(--node-shadow)] md:p-8">
          <img src="/brand/mascot-balloon.png" alt="" className="balloon-float pointer-events-none absolute -right-10 -top-10 h-48 w-48 object-contain opacity-10" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--red)]">Пред-аудит в Telegram</p>
              <p className="mt-2 max-w-2xl text-2xl font-semibold leading-tight text-[color:var(--ink)]">
                Ответьте на несколько вопросов в боте — и мы увидим, где клиника может терять пациентов ещё до консультации.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={site.links.audit}>Пройти пред-аудит</ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className="section-pad">
      <div className="container-pad">
        <SectionTitle kicker="FAQ" title="Частые вопросы" />
        <div className="mx-auto max-w-4xl space-y-4">
          {faq.map(([q, a]) => (
            <details key={q} className="faq-item rounded-[20px] border border-white/80 bg-white/90 p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-[color:var(--ink)]">
                {q}
                <span className="faq-arrow grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[color:var(--line)] bg-white text-[color:var(--red)] shadow-sm">
                  <ChevronDownIcon className="h-4 w-4" />
                </span>
              </summary>
              <p className="faq-content mt-4 leading-7 text-[color:var(--muted)]">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const socialLinks = [
    { label: "Telegram", href: site.socials.telegram, icon: TelegramSocialIcon },
    { label: "VK", href: site.socials.vk, icon: VkSocialIcon },
    { label: "MAX", href: site.socials.max, icon: MaxSocialIcon },
    { label: "Дзен", href: site.socials.dzen, icon: DzenSocialIcon },
  ] as const;
  const footerLinks = [
    ["Где теряются пациенты", "#loss-map"],
    ["Чек-лист", "#checklist"],
    ["Кейсы", "#cases"],
    ["Пакеты", "#solutions"],
    ["FAQ", "#faq"],
    ["Политика конфиденциальности", "/privacy"],
  ] as const;

  return (
    <footer className="border-t border-[color:var(--line)] bg-white/70 py-10">
      <div className="container-pad grid gap-8 lg:grid-cols-[1.1fr_1fr_0.8fr] lg:items-start">
        <div>
          <img src="/brand/logo-header.svg" alt="ШАРиК-digital" className="h-14 w-auto" />
          <p className="mt-4 max-w-md text-sm leading-6 text-[color:var(--muted)]">
            Digital-система для стоматологий: чек-лист, диагностика, пред-аудит и внедрение.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a key={item.label} href={item.href} className="social-chip inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--red)] hover:text-[color:var(--red)]">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
        <nav className="grid gap-2 sm:grid-cols-2">
          {footerLinks.map(([label, href]) => (
            <a key={href} href={href} className="text-sm font-semibold text-[color:var(--ink)] transition hover:text-[color:var(--red)]">
              {label}
            </a>
          ))}
        </nav>
        <div className="lg:text-right">
          <p className="text-sm font-semibold text-[color:var(--ink)]">Telegram-бот</p>
          <a href={site.botUrl} className="mt-2 inline-flex text-sm font-bold text-[color:var(--red)]">{site.botUsername}</a>
          <div className="mt-5">
            <ButtonLink href={site.links.audit}>Пройти пред-аудит</ButtonLink>
          </div>
        </div>
      </div>
      <div className="container-pad mt-8 text-sm text-[color:var(--muted)]">© ШАРиК-digital</div>
    </footer>
  );
}
