/**
 * Страницы сайта и раскладка контента по ним.
 *
 * Зачем отдельный файл: в админке контент разложен по типам (статьи,
 * кейсы, отзывы, FAQ), а человек думает страницами — «что я показываю
 * на странице про продавцов». Здесь в одном месте описано, какой
 * странице соответствует запись контента, поэтому фильтр, заголовок
 * группы и ссылка «открыть на сайте» всегда считаются одинаково.
 *
 * Всё выводится из frontmatter того же markdown-файла, который лежит
 * в content/ и который пишет генератор: второго источника правды
 * здесь намеренно нет.
 */

/** Страницы, на которых может жить контент. */
export type PageId = "home" | "sellers" | "kit" | "clinics";

export const ADMIN_PAGES: { id: PageId; label: string; href: string }[] = [
  { id: "home", label: "Главная", href: "/" },
  { id: "sellers", label: "Продавцам", href: "/sellers" },
  { id: "kit", label: "Яндекс KIT", href: "/yandex-kit" },
  { id: "clinics", label: "Клиникам", href: "/clinics" },
];

/** Значение поля frontmatter верхнего уровня без кавычек. */
function fm(markdown: string, key: string): string {
  const match = markdown.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
}

/** Человеческое название страницы. */
export function pageLabel(id: string): string {
  const page = ADMIN_PAGES.filter((p) => p.id === id)[0];
  return page ? page.label : id;
}

/** Адрес страницы. */
export function pageHref(id: string): string {
  const page = ADMIN_PAGES.filter((p) => p.id === id)[0];
  return page ? page.href : "/";
}

/* --------------------------------------------------------------------------
   Соответствие «страница → поле в контенте».

   FAQ разложен по хабам (agency / sellers / kit), статьи — по
   категориям, кейсы — по направлению. Отзывы на сайте витриной стоят
   на главной, поэтому страница у них одна и группируются они по нише.
--------------------------------------------------------------------------- */

const HUB_PAGES: Record<string, PageId> = {
  agency: "home",
  sellers: "sellers",
  kit: "kit",
};

const CATEGORY_PAGES: Record<string, PageId> = {
  "yandex-kit": "kit",
  patients: "clinics",
  economy: "sellers",
};

const CATEGORY_LABELS: Record<string, string> = {
  "yandex-kit": "Яндекс KIT",
  patients: "Пациентопоток",
  economy: "Экономика канала",
};

/** Категории статей в порядке блога на сайте. */
export const ARTICLE_CATEGORIES: { value: string; label: string }[] = [
  { value: "yandex-kit", label: CATEGORY_LABELS["yandex-kit"] },
  { value: "patients", label: CATEGORY_LABELS.patients },
  { value: "economy", label: CATEGORY_LABELS.economy },
];

/** Страница сайта, на которой показывается запись контента. */
export function pageOf(section: string, markdown: string): PageId {
  if (section === "faq") return HUB_PAGES[fm(markdown, "hub")] || "home";
  if (section === "article") return CATEGORY_PAGES[fm(markdown, "category")] || "home";
  if (section === "case") return fm(markdown, "direction") === "other" ? "home" : "clinics";
  return "home";
}

/**
 * Адрес, по которому запись можно посмотреть на сайте.
 *
 * У вопроса FAQ отдельной страницы нет: он живёт блоком на странице
 * своего хаба, поэтому ведём туда. Кейс открывается в общем списке
 * /cases, отзыв — на главной.
 */
export function siteUrl(section: string, slug: string, markdown: string): string {
  if (section === "article") return `/blog/${slug}`;
  if (section === "case") return "/cases";
  if (section === "faq") return pageHref(pageOf("faq", markdown));
  return "/";
}


/**
 * Группировка списка контента по страницам.
 *
 * Порядок групп повторяет порядок страниц в меню, а не алфавит:
 * человек открывает админку «посмотреть, что лежит на странице про
 * клиник», и ждёт найти это в том же порядке, в каком страницы
 * перечислены на сайте.
 */
export function groupItems<T extends { markdown: string }>(
  section: string,
  items: T[],
): ItemGroup<T>[] {
  /** key -> заголовок, порядок и записи. */
  const buckets: { key: string; label: string; order: number; items: T[] }[] = [];

  const push = (key: string, label: string, order: number, item: T) => {
    const existing = buckets.filter((b) => b.key === key)[0];
    if (existing) {
      existing.items.push(item);
      return;
    }
    buckets.push({ key, label, order, items: [item] });
  };

  // Одинаковая логика для FAQ, статей и кейсов: сначала решаем, чем
  // запись адресуется (хаб, категория, направление), потом раскладываем
  // по группам. Обход вложенным циклом, а не Map: проект собирается под
  // es5, где итерация по Map требует downlevelIteration.
  const byField = (valueOf: (item: T) => string, keys: { key: string; label: string }[]) => {
    keys.forEach((entry, index) => {
      for (const item of items) {
        if (valueOf(item) === entry.key) push(entry.key, entry.label, index, item);
      }
    });
  };

  if (section === "faq") {
    byField(
      (item) => fm(item.markdown, "hub") || "agency",
      ADMIN_PAGES.map((page) => ({
        key: page.id === "home" ? "agency" : page.id,
        label: page.label,
      })),
    );
  } else if (section === "article") {
    byField(
      (item) => fm(item.markdown, "category") || "yandex-kit",
      ARTICLE_CATEGORIES.map((category) => ({ key: category.value, label: category.label })),
    );
    // Статья с категорией, которой нет в справочнике, иначе исчезла бы
    // из списка целиком — молча потерять материал хуже, чем показать
    // его в отдельной группе.
    for (const item of items) {
      const value = fm(item.markdown, "category") || "yandex-kit";
      if (!ARTICLE_CATEGORIES.some((c) => c.value === value)) {
        push(value, `Категория «${value}»`, 99, item);
      }
    }
  } else if (section === "case") {
    byField(
      (item) => (fm(item.markdown, "direction") === "other" ? "other" : "clinic"),
      [
        { key: "clinic", label: "Клиникам (/clinics)" },
        { key: "other", label: "Другое (главная)" },
      ],
    );
  } else {
    // Отзывы: страница одна (главная), поэтому делим их по нише.
    const niches: string[] = [];
    for (const item of items) {
      const niche = fm(item.markdown, "niche") || "Без ниши";
      if (niches.indexOf(niche) === -1) niches.push(niche);
    }
    byField(
      (item) => fm(item.markdown, "niche") || "Без ниши",
      niches.map((niche) => ({ key: niche, label: `Ниша: ${niche}` })),
    );
  }

  return buckets
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((bucket) => ({ key: bucket.key, label: bucket.label, items: bucket.items }));
}

/**
 * Вторая строка в списке: чем запись отличается от соседних.
 *
 * Для FAQ это подраздел, для статьи — заголовок и дата, для кейса —
 * ниша и город, для отзыва — роль автора и результат. Без неё два
 * похожих заголовка в списке неразличимы.
 */
export function itemSubtitle(section: string, markdown: string): string {
  if (section === "faq") return fm(markdown, "group") || "Без подраздела";

  if (section === "article") {
    const date = fm(markdown, "date");
    return date ? `от ${date}` : "без даты";
  }

  if (section === "case") {
    const niche = fm(markdown, "niche");
    const city = fm(markdown, "city");
    return [niche, city].filter(Boolean).join(" · ") || "Без ниши и города";
  }

  return [fm(markdown, "role"), fm(markdown, "result")].filter(Boolean).join(" · ");
}

export type ItemGroup<T> = {
  /** Ключ группы: значение поля, по которому она собрана. */
  key: string;
  /** Заголовок группы для админки. */
  label: string;
  items: T[];
};
