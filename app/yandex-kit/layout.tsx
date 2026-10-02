import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Метаданные вынесены в layout, а не в page: страница помечена
 * "use client" из-за интерактивных блоков, а экспортировать metadata
 * из клиентского компонента Next.js запрещает.
 */
export const metadata: Metadata = {
  title: "Яндекс KIT — создание и настройка интернет-магазина",
  description:
    "Запуск интернет-магазина на Яндекс KIT: перенос товаров, настройка витрины, домена, оплаты и доставки, SEO и аналитика. Помогаем собрать магазин и привести к нему покупателей.",
  alternates: { canonical: "/yandex-kit" },
  openGraph: {
    title: "Яндекс KIT — создание и настройка интернет-магазина",
    description:
      "Собираем магазин на Яндекс KIT и выстраиваем вокруг него трафик, SEO и повторные продажи.",
    url: "/yandex-kit",
  },
};

export default function YandexKitLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}