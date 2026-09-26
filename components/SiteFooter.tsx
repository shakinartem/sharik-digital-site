import Link from "next/link";
import { site } from "@/data/site";
import { DIRECTIONS } from "@/data/agency";
import { TelegramSocialIcon, VkSocialIcon, DzenSocialIcon } from "./icons";

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
            <div className="text-lg font-black text-foreground">
              ШАРиК<span className="text-primary">.</span>digital
            </div>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              Маркетинговое агентство полного цикла. Строим системы привлечения и удержания — от
              пациентопотока клиники до собственного канала продаж селлера.
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
            <p className="text-sm font-black text-foreground">Связаться</p>
            <div className="mt-3 flex flex-wrap gap-3">
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
            <a
              href={site.botUrl}
              className="mt-4 inline-block text-sm font-black text-primary transition hover:opacity-80"
            >
              {site.botUsername}
            </a>
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="mt-1 block text-sm text-muted-foreground transition hover:text-primary"
            >
              {site.phone}
            </a>
            <Link
              href="/privacy"
              className="mt-3 block text-sm text-muted-foreground transition hover:text-primary"
            >
              Политика конфиденциальности
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
