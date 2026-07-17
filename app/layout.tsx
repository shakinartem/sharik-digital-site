import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  weight: ["400", "900"],
});

export const metadata: Metadata = {
  title: "ШАРиК digital — управляем пациентопотоком стоматологий | Patient Flow Company",
  description: "Управляем пациентопотоком стоматологий по методологии 7К. Внедряем систему касания, кредит доверия, конверсии и контроля. Пред-аудит, карта потерь, индекс пациентопотока. ⚡ Запишитесь на диагностику",
  metadataBase: new URL("https://sharik-digital.ru"),
  openGraph: {
    title: "ШАРиК digital — управляем пациентопотоком стоматологий",
    description: "Внедряем систему управления потоком пациентов по методологии 7К. Индекс пациентопотока, карта потерь, контурная упаковка клиники. Пред-аудит в Telegram.",
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