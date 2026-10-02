import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  // Шаблон "%s — ШАРиК digital" из корневого layout добавит бренд сам.
  title: "Клиникам — видеть и закрывать потери пациентов",
  description:
    "Методология 7К показывает, где пациент теряется. Пред-аудит, карта потерь, индекс пациентопотока, контент, реклама и CRM.",
  alternates: { canonical: "/clinics" },
  openGraph: {
    title: "Клиникам — видеть и закрывать потери пациентов",
    description:
      "Клиникам: пред-аудит 7К, карта потерь, индекс пациентопотока и рост потока пациентов.",
    url: "/clinics",
  },
};

export default function ClinicsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
