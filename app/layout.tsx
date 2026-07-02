import type { Metadata } from "next";
import { Manrope, Montserrat } from "next/font/google";
import "./globals.css";

const displayFont = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
});

const bodyFont = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "ШАРиК-digital — digital-система для стоматологий",
  description:
    "Находим, где стоматология теряет пациентов, и собираем систему, которая приводит заявки: карты, сайт, SMM, Telegram-боты, CRM и автоматизация.",
  metadataBase: new URL("https://sharik-digital.ru"),
  openGraph: {
    title: "ШАРиК-digital — находим, где стоматология теряет пациентов",
    description:
      "Чек-лист, диагностика и digital-система для стоматологий и медицинских клиник.",
    images: ["/brand/og-preview.png"],
  },
  icons: {
    icon: "/brand/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
