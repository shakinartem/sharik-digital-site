import type { Metadata } from "next";
import { Manrope, Montserrat } from "next/font/google";
import { AnalyticsBootstrap } from "@/components/AnalyticsBootstrap";
import { MetricaCounter } from "@/components/MetricaCounter";
import { CookieConsent } from "@/components/CookieConsent";
import { site } from "@/data/site";
import "./globals.css";

/**
 * Типографика по брендбуку (ВСЕ МАТЕРИАЛЫ/Брендовые материалы,
 * раздел «ТИПОГРАФИКА»): Montserrat — заголовки, Manrope — текст.
 *
 * В брендбуке display назван «Montserrat Rounded», но такой гарнитуры нет
 * ни в Google Fonts, ни в системных шрифтах, поэтому используется обычный
 * Montserrat. Он подключён вариативным начертанием 100–900, так что
 * `font-bold`/`font-black` в заголовках не синтезируются, а кириллица
 * приходит тем же файлом, что и латиница.
 */
const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

/**
 * Manrope — основной текст по брендбуку.
 *
 * Подключён вариативным начертанием, без списка weight. Со списком
 * next/font скачивал пять статических файлов на каждое подмножество —
 * на главной это 97 КБ шрифтов, на /sellers 178 КБ, и они конкурировали
 * с картинками за мобильный канал. Вариативный файл один на подмножество
 * и покрывает весь диапазон 200–800, поэтому `font-black` (900) по-прежнему
 * не синтезируется: шрифт просто упрётся в потолок 800, как и раньше.
 */
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sharik-digital.ru"),
  title: {
    default: "ШАРиК digital — digital-системы привлечения и продаж",
    template: "%s — ШАРиК digital",
  },
  description:
    "Строим digital-системы, которые превращают трафик в продажи. Два направления: собственный канал продаж для селлеров и система пациентопотока для клиник.",
  /**
   * Канонический адрес главной.
   *
   * ВАЖНО: alternates наследуются всеми вложенными страницами, поэтому
   * каждая страница обязана переопределить его своим. Страница без своего
   * canonical объявит себя дублем главной и выпадет из индекса.
   *
   * Форма адреса: Next.js срезает завершающий слеш, и в разметку попадает
   * https://sharik-digital.ru — ровно так же записан <loc> главной
   * в scripts/generate-sitemap.mjs. Если поменять одно, нужно поменять
   * и второе: Яндекс сверяет строки буквально.
   */
  alternates: { canonical: "https://sharik-digital.ru/" },
  /**
   * Подтверждение прав в Яндекс.Вебмастере. Код берётся из переменной
   * окружения, чтобы при переподтверждении не приходилось править код:
   * задать NEXT_PUBLIC_YANDEX_VERIFICATION в настройках сборки Cloudflare
   * Pages. Пустое значение Next.js не выводит в разметку вовсе.
   */
  verification: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION
    ? { yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION }
    : undefined,
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "ШАРиК digital",
    title: "ШАРиК digital — digital-системы привлечения и продаж",
    description:
      "Собственный канал продаж для селлеров и система пациентопотока для клиник. Сначала считаем экономику, потом запускаем.",
    url: "/",
    images: ["/og-default.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ШАРиК digital — digital-системы привлечения и продаж",
    description: "Собственный канал продаж для селлеров и система пациентопотока для клиник.",
    images: ["/og-default.png"],
  },
  icons: {
    icon: [
      { url: "/brand/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

/**
 * Разметка организации и сайта.
 *
 * Зачем: Яндекс показывает в расширенных сниппетах название компании,
 * логотип и контакты. Без Organization-разметки блок «Об организации»
 * в выдаче остаётся пустым, даже если данные есть в футере.
 *
 * Данные берутся из data/site.ts — тот же источник, что и у видимого
 * футера, поэтому разметка не может разойтись с текстом на странице.
 */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://sharik-digital.ru/#organization",
      name: site.name,
      url: "https://sharik-digital.ru/",
      logo: {
        "@type": "ImageObject",
        url: "https://sharik-digital.ru/brand/icon-512.png",
      },
      image: "https://sharik-digital.ru/og-default.png",
      description:
        "Строим digital-системы, которые превращают трафик в продажи: собственный канал продаж для селлеров и система пациентопотока для клиник.",
      founder: {
        "@type": "Person",
        name: site.directorName,
        jobTitle: site.directorRole,
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: site.phone,
          contactType: "sales",
          areaServed: "RU",
          availableLanguage: "Russian",
        },
      ],
      sameAs: [
        site.socials.telegram,
        site.socials.vk,
        site.socials.dzen,
        site.botUrl,
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://sharik-digital.ru/#website",
      url: "https://sharik-digital.ru/",
      name: site.name,
      inLanguage: "ru-RU",
      publisher: { "@id": "https://sharik-digital.ru/#organization" },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${montserrat.variable} ${manrope.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
        <AnalyticsBootstrap />
        <MetricaCounter id={site.metricaId} />
        <CookieConsent />
      </body>
    </html>
  );
}