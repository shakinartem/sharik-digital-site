import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Метаданные вынесены в layout, а не в page: страница помечена
 * "use client" из-за фильтра кейсов, а экспортировать metadata
 * из клиентского компонента Next.js запрещает. Тот же приём
 * применён в app/yandex-kit/layout.tsx.
 *
 * Без этого файла страница наследовала title, description и canonical
 * главной — Яндекс видел в /cases точный дубль главной и не брал
 * её в индекс.
 */
export const metadata: Metadata = {
  title: "Кейсы — результаты по клиникам и селлерам",
  description:
    "Кейсы ШАРиК digital: где клиники и продавцы теряли пациентов и клиентов, какие контуры перестроили и какой результат получили. С цифрами.",
  alternates: { canonical: "/cases" },
  openGraph: {
    title: "Кейсы — результаты по клиникам и селлерам",
    description:
      "Где клиники и продавцы теряли пациентов и клиентов, какие контуры перестроили и какой результат получили.",
    url: "/cases",
  },
};

export default function CasesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}