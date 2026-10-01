/**
 * Типы кейсов.
 *
 * Содержимое лежит в content/cases/*.md, откуда
 * scripts/generate-content.mjs собирает data/cases.generated.ts.
 * Правьте кейсы через админку (/admin) или в markdown-файлах.
 */
import { generatedCases } from "./cases.generated";
import { articles, type Article } from "./articles";

export type CaseItem = {
  id: string;
  title: string;
  niche: string;
  city?: string;
  mainResult: string;
  shortDescription: string;
  task: string;
  whatWasDone: string[];
  results: string[];
  conclusion: string;
  images: string[];
  tags: string[];
  contourClosed?: string; // Какой контур был закрыт
  /**
   * Направление для фильтра на /cases.
   * Продавцов (seller) в портфолио пока нет: кейсы по маркетплейсам
   * не выдумываются. Arximed Security — не клинический кейс, поэтому
   * показан отдельно и не приписывается к методологии 7К.
   */
  direction: "clinic" | "other";
  /**
   * Отзыв, написанный по этому кейсу. Связь двусторонняя: у отзыва
   * в этом случае проставлен caseId с тем же значением.
   */
  reviewId?: string;
};

export const cases: CaseItem[] = generatedCases;

export function getCase(id: string): CaseItem | undefined {
  return cases.find((c) => c.id === id);
}

/** Статьи, написанные по этому кейсу. */
export function getCaseArticles(caseId: string): Article[] {
  return articles.filter((a) => a.caseId === caseId);
}