import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";
import { DIRECTIONS } from "@/data/agency";
import { TelegramSocialIcon, VkSocialIcon, DzenSocialIcon } from "./icons";
import { CookieSettingsButton } from "./CookieConsent";

const PAGES = [
  { label: "Кейсы", href: "/cases" },
  { label: "Отзывы", href: "/reviews" },
  { label: "Запуск магазина на Яндекс KIT", href: "/yandex-kit" },
  { label: "О компании", href: "/about" },
  { label: "Статьи", href: "/blog" },
  { label: "Контакты", href: "/contacts" },
];

export function SiteFooter() {
  const socialIcons = [
    { Icon: TelegramSocialIcon, href: site.socials.telegram, label: "Telegram" },
    { Icon: VkSocialIcon, href: site.socials.vk, label: "VK" },
    { Icon: DzenSocialIcon, href: site.socials.dzen, label: "Дзен" },
  ];

  return (
    <footer className="border-t border-border bg-muted/55 py-10 sm:py-12">
      <div className="container-wide">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="inline-block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <Image
                src="/brand/logo-full-480.webp"
                alt="ШАРиК digital"
                width={480}
                height={186}
                className="h-16 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              Строим digital-системы привлечения и продаж: от пациентопотока клиники до
              собственного канала продаж селлера. Маркетинговое агентство — второстепенное
              описание; по сути это одна компания с двумя специализированными
              направлениями.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">© ШАРиК digital</p>
          </div>

          <div>
            <p className="text-sm font-black text-foreground">Направления</p>
            <ul className="mt-3 space-y-2">
              {DIRECTIONS.map((d) => (
                <li key={d.href}>
                  <Link
                    href={d.href}
                    className="text-sm text-muted-foreground transition hover:text-primary"
                  >
                    {d.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-black text-foreground">Разделы</p>
            <ul className="mt-3 space-y-2">
              {PAGES.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            {socialIcons.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-white transition hover:bg-primary"
                aria-label={label}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href={site.botUrl}
              className="text-sm font-black text-primary transition hover:opacity-80"
            >
              {site.botUsername}
            </a>
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="text-sm text-muted-foreground transition hover:text-primary"
            >
              {site.phone}
            </a>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground transition hover:text-primary"
            >
              Политика конфиденциальности
            </Link>
            {/* Ссылка нужна, чтобы решение по cookie можно было изменить:
                иначе отказ остаётся необратимым до очистки кэша. */}
            <CookieSettingsButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
