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
  /**
   * Подраздел внутри хаба. Необязателен: вопрос без группы попадает
   * в блок «Другие вопросы». Нужен, чтобы длинный список FAQ не
   * висел сплошняком: 17 вопросов про KIT читаются четырьмя
   * блоками, а не одним экраном.
   */
  group?: string;
  /** Текст вопроса. */
  q: string;
  /** Текст ответа. */
  a: string;
};

/** Подраздел для вопросов, у которых группа не задана. */
export const FAQ_FALLBACK_GROUP = "Другие вопросы";

export const agencyFaq: FaqItem[] = generatedFaq.filter((i) => i.hub === "agency");

/** Вопросы о платформе — для хаба Яндекс KIT. */
export const kitFaq: FaqItem[] = generatedFaq.filter((i) => i.hub === "kit");

/**
 * Вопросы по направлению «параллельные продажи» — для страницы
 * /sellers. Раньше они жили массивом в data/sellers.ts, и править
 * их можно было только через код. Теперь это обычный контент: файл
 * в content/faq, редактор в админке, публикация кнопкой.
 */
export const sellersFaq: FaqItem[] = generatedFaq.filter((i) => i.hub === "sellers");

/**
 * Вопросы для страницы клиник.
 *
 * Раньше они лежали массивом прямо в app/clinics/page.tsx, и править
 * их можно было только правкой кода с последующей сборкой. Теперь это
 * обычный контент: файлы в content/faq, редактор в админке под
 * подразделом «Клиникам (/clinics)».
 */
export const clinicsFaq: FaqItem[] = generatedFaq.filter((i) => i.hub === "clinics");

/**
 * Известные хабы FAQ.
 *
 * Нужен админке: без списка полей «Страница» и «Подраздел» пришлось
 * бы вводить hub и group руками, и опечатка тихо убрала бы вопрос
 * со всех страниц — он просто не попал бы ни в один фильтр.
 */
export const FAQ_HUBS: { value: string; label: string }[] = [
  { value: "agency", label: "Главная — о студии" },
  { value: "clinics", label: "Клиникам (/clinics)" },
  { value: "sellers", label: "Продавцам (/sellers)" },
  { value: "kit", label: "Яндекс KIT (/yandex-kit)" },
];

export type FaqGroup = {
  /** Заголовок подраздела. */
  title: string;
  /** Ответы внутри подраздела. */
  items: FaqItem[];
};

/**
 * Группирует вопросы по подразделам.
 *
 * Порядок подразделов задаётся минимальным `order` вопроса внутри
 * него: так порядок групп меняется правкой order в markdown, без
 * правки кода. «Другие вопросы» всегда уходят в конец — иначе блок
 * без заголовка выглядел бы как обрыв списка.
 */
export function groupFaq(items: FaqItem[]): FaqGroup[] {
  // Массив вместо Map: проект собирается под es5, где итерация по
  // Map и Set требует downlevelIteration, а он в проекте не включён.
  const groups: { title: string; order: number; items: FaqItem[] }[] = [];

  for (const item of items) {
    const title = item.group?.trim() || FAQ_FALLBACK_GROUP;
    const existing = groups.filter((g) => g.title === title)[0];
    if (existing) {
      existing.items.push(item);
      existing.order = Math.min(existing.order, item.order);
    } else {
      groups.push({ title, order: item.order, items: [item] });
    }
  }

  return groups
    .sort(
      (a, b) =>
        // Без этого «Другие вопросы» встал бы по своему order и
        // разорвал бы логику остальных подразделов.
        Number(a.title === FAQ_FALLBACK_GROUP) - Number(b.title === FAQ_FALLBACK_GROUP) ||
        a.order - b.order,
    )
    .map(({ title, items: groupItems }) => ({ title, items: groupItems }));
}
