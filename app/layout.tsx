import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  weight: ["400", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "ШАРиК digital — маркетинговое агентство полного цикла",
    template: "%s",
  },
  description:
    "Собственные каналы продаж для селлеров маркетплейсов на инфраструктуре Яндекс KIT и управление пациентопотоком стоматологий по методологии 7К.",
  metadataBase: new URL("https://sharik-digital.ru"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "ШАРиК digital — маркетинговое агентство полного цикла",
    description:
      "Собственный канал продаж для селлеров и управление пациентопотоком стоматологий. Начинаем с расчёта, а не с обещаний.",
    url: "/",
    images: ["/brand/og-preview.png"],
  },
  icons: {
    icon: "/brand/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}