import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ШАРиК-digital — digital-система для стоматологий",
  description:
    "Находим, где стоматология теряет пациентов, и собираем систему, которая приводит заявки: карты, сайт, SMM, Telegram-боты, CRM и автоматизация.",
  metadataBase: new URL("https://sharik-digital.ru"),
  openGraph: {
    title: "ШАРиК-digital — находим, где стоматология теряет пациентов",
    description:
      "Чек-лист, диагностика и digital-система для стоматологий и медицинских клиник.",
    images: ["/brand/превью сайта.png"],
  },
  icons: {
    icon: "/brand/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
