import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SellerLeadForm } from "@/components/SellerLeadForm";
import { site } from "@/data/site";
import { sellerLinks } from "@/data/sellers";
import { MessageCircle, Phone, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "Заявка на расчёт канала",
  description:
    "Оставьте ссылку на каталог и примерный оборот — посчитаем, сколько заказов может дать собственный канал продаж поверх маркетплейса.",
  alternates: { canonical: "/sellers/request" },
  // Страница-форма: в поиске ей нечего предложить, а в индексе она
  // конкурировала бы с /sellers за один и тот же запрос.
  robots: { index: false, follow: true },
};

/**
 * Заявка на расчёт — отдельная страница.
 *
 * Раньше форма стояла прямо на /sellers, и страница выглядела
 * как лендинг с полями ввода. Теперь /sellers объясняет, как
 * устроены параллельные продажи, а сюда приходят те, кто дочитал и
 * готов считать. Ссылка ведёт сюда и блок «Посчитаем ваш канал», и
 * финальный CTA.
 */
const ALTERNATIVES = [
  {
    Icon: Send,
    title: "Telegram-бот",
    description: "Мини-диагностика и чек-лист в одном чате — без заполнения полей.",
    href: sellerLinks.potential,
    action: "Открыть бота",
  },
  {
    Icon: MessageCircle,
    title: "Задать вопрос",
    description: "Короткий разбор в Telegram: что переносится, что придётся делать заново.",
    href: sellerLinks.question,
    action: "Написать в Telegram",
  },
  {
    Icon: Phone,
    title: "Позвонить",
    description: "Если удобнее обсудить голосом — отвечаем в рабочее время.",
    href: `tel:${site.phone.replace(/\s/g, "")}`,
    action: site.phone,
  },
] as const;

export default function SellerRequestPage() {
  return (
    <main className="overflow-x-hidden">
      <SiteHeader
        ctaLabel="Как устроены параллельные продажи"
        ctaHref="/sellers"
        solidBg={false}
      />

      <section className="pt-10 sm:pt-14">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center">
            <h1
              className="font-display font-bold leading-[0.98] text-foreground"
              style={{ fontSize: "clamp(1.8rem, 6cqi, 3rem)" }}
            >
              Посчитаем потенциал вашего канала
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              Четыре поля — этого достаточно, чтобы посмотреть каталог и сказать, есть
              ли смысл запускать свой магазин. Если потенциала нет, вы получите отчёт с
              цифрами, а не потраченный бюджет.
            </p>
          </div>
        </div>
      </section>

      <SellerLeadForm showHeading={false} />

      <section className="section-pad pt-0">
        <div className="container-wide">
          <div className="mx-auto max-w-4xl">
            <p className="text-center text-sm font-black text-foreground">
              Не хочется заполнять форму?
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {ALTERNATIVES.map(({ Icon, title, description, href, action }) => (
                <a
                  key={title}
                  href={href}
                  {...(href.startsWith("http")
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                  className="card-base card-lift flex flex-col p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-sm font-black text-foreground">{title}</h2>
                  <p className="mt-1.5 flex-1 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                  <span className="mt-4 text-sm font-black text-primary">{action}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}