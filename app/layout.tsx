import type { Metadata } from "next";
import { Manrope, Montserrat } from "next/font/google";
import { AnalyticsBootstrap } from "@/components/AnalyticsBootstrap";
import { MetricaCounter } from "@/components/MetricaCounter";
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
 * Manrope — основной текст по брендбуку. 800 добавлен не «про запас»:
 * `font-black` (900) — самый частый класс в вёрстке, а у Manrope потолок 800,
 * поэтому без него всё «жирное» молча зажималось до 700.
 */
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sharik-digital.ru"),
  title: {
    default: "ШАРиК digital — digital-системы привлечения и продаж",
    template: "%s — ШАРиК digital",
  },
  description:
    "Строим digital-системы, которые превращают трафик в продажи. Два направления: собственный канал продаж для селлеров и система пациентопотока для клиник по методологии 7К.",
  alternates: { canonical: "/" },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${montserrat.variable} ${manrope.variable}`}>
      <body>
        {children}
        <AnalyticsBootstrap />
        <MetricaCounter id={site.metricaId} />
      </body>
    </html>
  );
}