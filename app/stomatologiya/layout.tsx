import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Стоматологии — управляем пациентопотоком по методологии 7К | ШАРиК digital",
  description:
    "Находим, где стоматологическая клиника теряет пациентов, и собираем digital-систему: пред-аудит, карта потерь, индекс пациентопотока, контент, реклама и CRM.",
  alternates: { canonical: "/stomatologiya" },
  openGraph: {
    title: "Стоматологии — управляем пациентопотоком по методологии 7К",
    description:
      "Patient Flow Company для стоматологий: пред-аудит 7К, карта потерь, индекс пациентопотока и рост потока пациентов.",
    url: "/stomatologiya",
  },
};

export default function StomatologiyaLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
