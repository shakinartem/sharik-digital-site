/**
 * Частые вопросы.
 *
 * Вопросы и ответы лежат в content/faq/*.md, откуда их собирает
 * scripts/generate-content.mjs. Формат тот же, что у статей:
 * frontmatter с id, порядком и вопросом, затем текст ответа.
 *
 * Порядок задаётся полем order в файле: он определяет, в каком виде
 * вопросы идут на странице, и меняется без правки кода.
 */
import { generatedFaq } from "./faq.generated";

export type FaqItem = {
  id: string;
  order: number;
  /**
   * Хаб, к которому относится вопрос: `agency` — про студию,
   * `kit` — про платформу. Разделение нужно, чтобы вопросы о KIT
   * не выводились на страницах про клиники.
   */
  hub: string;
  /** Текст вопроса. */
  q: string;
  /** Текст ответа. */
  a: string;
};

export const agencyFaq: FaqItem[] = generatedFaq.filter((i) => i.hub === "agency");

/** Вопросы о платформе — для хаба Яндекс KIT. */
export const kitFaq: FaqItem[] = generatedFaq.filter((i) => i.hub === "kit");
