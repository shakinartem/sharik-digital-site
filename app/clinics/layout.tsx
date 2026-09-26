import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Клиникам — управляем пациентопотоком по методологии 7К | ШАРиК digital",
  description:
    "Находим, где клиника теряет пациентов, и собираем digital-систему: пред-аудит, карта потерь, индекс пациентопотока, контент, реклама и CRM.",
  alternates: { canonical: "/clinics" },
  openGraph: {
    title: "Клиникам — управляем пациентопотоком по методологии 7К",
    description:
      "Клиникам: пред-аудит 7К, карта потерь, индекс пациентопотока и рост потока пациентов.",
    url: "/clinics",
  },
};

export default function ClinicsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
