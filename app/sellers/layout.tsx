import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  // Бренд не пишем вручную: корневой layout добавляет его через template
  // "%s — ШАРиК digital", иначе он дублировался в <title>.
  title: "Собственный канал продаж для селлеров",
  description:
    "Помогаем продавцам Wildberries, Ozon и Яндекс Маркета запускать собственный канал продаж: расчёт потенциала, интернет-магазин на Яндекс KIT, трафик, аналитика и повторные продажи.",
  alternates: { canonical: "/sellers" },
  openGraph: {
    title: "Собственный канал продаж для селлеров",
    description:
      "Яндекс KIT, трафик и повторные продажи поверх маркетплейсов. Начинаем с расчёта потенциала, а не с обещаний.",
    url: "/sellers",
  },
};

export default function SellersLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
