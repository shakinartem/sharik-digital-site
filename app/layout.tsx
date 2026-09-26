import type { Metadata } from "next";
import localFont from "next/font/local";
import { Manrope } from "next/font/google";
import "./globals.css";

/**
 * Фирменный Sharik Rounded Display собран из растровых спецификаций
 * (шрифт/build_font_v2.py). Начертания 400/500/700 — честные, а не
 * синтетический bold: разница достигается толщиной штриха, поэтому
 * `font-black` в заголовках не «смазывается».
 */
const sharik = localFont({
  src: [
    {
      path: "../public/fonts/SharikRoundedDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/SharikRoundedDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/SharikRoundedDisplay-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["Manrope", "system-ui", "sans-serif"],
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sharik-digital.ru"),
  title: {
    default: "ШАРиК digital — маркетинговое агентство",
    template: "%s — ШАРиК digital",
  },
  description:
    "Собственные каналы продаж для селлеров маркетплейсов на инфраструктуре Яндекс KIT и управление пациентопотоком клиник по методологии 7К.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "ШАРиК digital",
    title: "ШАРиК digital — маркетинговое агентство",
    description:
      "Собственный канал продаж для селлеров и управление пациентопотоком клиник. Начинаем с расчёта, а не с обещаний.",
    url: "/",
    images: ["/og-default.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ШАРиК digital — маркетинговое агентство",
    description: "Собственный канал продаж для селлеров и управление пациентопотоком клиник.",
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
    <html lang="ru" className={`${sharik.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}