import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Собственный канал продаж для селлеров — ШАРиК digital",
  description:
    "Помогаем продавцам Wildberries, Ozon и Яндекс Маркета создавать собственный канал продаж: расчёт потенциала, запуск интернет-магазина на Яндекс KIT, трафик, аналитика и повторные продажи.",
  alternates: { canonical: "/sellers" },
  openGraph: {
    title: "Собственный канал продаж для селлеров — ШАРиК digital",
    description:
      "Яндекс KIT, трафик и повторные продажи поверх маркетплейсов. Начинаем с расчёта потенциала, а не с обещаний.",
    url: "/sellers",
  },
};

export default function SellersLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
