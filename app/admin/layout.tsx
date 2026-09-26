import type { Metadata } from "next";

/**
 * Служебная страница. Закрыта от индексации на уровне layout,
 * а доступ защищён паролем в /api/admin/articles.
 */
export const metadata: Metadata = {
  title: "Редактор статей — ШАРиК digital",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}