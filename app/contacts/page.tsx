import type { Metadata } from "next";
import Link from "next/link";
import { Send, MessageCircle, Phone } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionTitle } from "@/components/ui";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Связаться с ШАРиК digital: Telegram, телефон, консультация по маркетингу для клиник и продавцов маркетплейсов.",
  // Свой canonical обязателен: без него страница наследует адрес главной
  // и Яндекс считает её дублем.
  alternates: { canonical: "/contacts" },
  openGraph: {
    title: "Контакты — ШАРиК digital",
    description:
      "Telegram-бот, быстрый вопрос и телефон: свяжитесь с ШАРиК digital по маркетингу для клиник и продавцов маркетплейсов.",
    url: "/contacts",
  },
};

const CHANNELS = [
  {
    Icon: Send,
    title: "Telegram-бот",
    description: "Диагностика, чек-листы и разбор задачи в одном чате.",
    href: site.botUrl,
    action: site.botUsername,
    external: true,
  },
  {
    Icon: MessageCircle,
    title: "Быстрый вопрос",
    description: "Короткий разбор в Telegram — отвечаем по делу, без продажи.",
    href: site.socials.telegram,
    action: "Написать в Telegram",
    external: true,
  },
  {
    Icon: Phone,
    title: "Телефон",
    description: "Звонок или сообщение, если удобнее обсудить голосом.",
    href: `tel:${site.phone.replace(/\s/g, "")}`,
    action: site.phone,
    external: false,
  },
] as const;

export default function ContactsPage() {
  return (
    <main className="overflow-x-hidden">
      <SiteHeader ctaLabel="Написать в Telegram" ctaHref={site.botUrl} solidBg={false} />

      <section className="section-pad pt-12 sm:pt-16">
        <div className="container-wide">
          <SectionTitle
            as="h1"
            kicker="Контакты"
            title="Давайте сначала посчитаем"
            text="Не обещаем результат до того, как увидели цифры. Опишите задачу — разберём, где теряются деньги, и скажем, есть ли смысл двигаться дальше."
          />

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
            {CHANNELS.map(({ Icon, title, description, href, action, external }) => (
              <a
                key={title}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className="card-base card-lift flex flex-col p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 font-display text-lg font-bold text-foreground">{title}</h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{description}</p>
                <span className="mt-5 text-sm font-black text-primary">{action}</span>
              </a>
            ))}
          </div>

          <div className="card-base mx-auto mt-8 max-w-4xl p-7 sm:p-10">
            <h2 className="font-display text-xl font-bold leading-tight text-foreground sm:text-2xl">
              Что полезно указать в первом сообщении
            </h2>
            <ul className="mt-5 space-y-3">
              {[
                "Что делает компания или клиника и кто ваш клиент.",
                "Какие каналы уже работают и какие цифры есть сейчас.",
                "Какая задача стоит: продажи, пациентопоток, позиционирование.",
                "Желаемый срок и есть ли ограничения по бюджету.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-6 text-muted-foreground">
              Подробнее о том, как мы работаем и чего ожидать на каждом этапе, — на странице{" "}
              <Link href="/about" className="font-bold text-primary hover:opacity-80">
                «О нас»
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
