import { generatedArticles } from "./articles.generated";

/**
 * Типы и хелперы реестра статей.
 *
 * Содержимое статей лежит в content/articles/*.md, откуда
 * scripts/generate-content.mjs собирает data/articles.generated.ts.
 * Список ниже — просто удобная точка входа для остального кода.
 *
 * Почему контент хранится как типизированные блоки, а не как HTML-строка:
 * из данных нельзя случайно принести сырой <script>, а рендерер
 * (components/ArticleBody.tsx) остаётся единственным местом, где решается,
 * как выглядит абзац, выноска и таблица.
 *
 * Правьте статьи через админку (/admin) или в markdown-файлах — не здесь.
 *
 * Факты о Яндекс KIT соответствуют официальной справке
 * (yandex.ru/support/kit/ru). Если платформа изменится — правим markdown
 * и ставим новую дату в updatedAt, чтобы читатель видел свежесть материала.
 */

export type Block =
  | { t: "p"; text: string }
  | { t: "h2"; text: string }
  | { t: "h3"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "note"; kind: "note" | "warn" | "tip"; title: string; text: string }
  | { t: "table"; head: string[]; rows: string[][] };

export type Article = {
  slug: string;
  title: string;
  description: string;
  /** Для заголовка <title>: конкретный интент, без бренда — он добавится шаблоном. */
  seoTitle: string;
  category: "yandex-kit" | "patients" | "economy";
  tags: string[];
  date: string;
  updatedAt?: string;
  /** Ссылка на первоисточник, если материал опирается на документацию. */
  sourceUrl?: string;
  sourceLabel?: string;
  /** Коммерческий CTA под статьёй. Разный для разных интентов. */
  cta: { title: string; text: string; href: string; label: string };
  related: string[];
  blocks: Block[];
};

export const CATEGORY_LABELS: Record<Article["category"], string> = {
  "yandex-kit": "Яндекс KIT",
  patients: "Пациентопоток",
  economy: "Экономика канала",
};

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getRelated(slugs: string[]): Article[] {
  return slugs
    .map(getArticle)
    .filter((a): a is Article => Boolean(a));
}

/** Статьи категории — для хаба и списка. */
export function getByCategory(category: Article["category"]): Article[] {
  return articles.filter((a) => a.category === category);
}

/**
 * Заголовки второго уровня — для оглавления статьи.
 * Собираются из блоков, чтобы оглавление не расходилось с текстом:
 * добавили H2 в контент — он автоматически появился в списке.
 */
export function getHeadings(article: Article): { id: string; text: string }[] {
  return article.blocks
    .filter((b): b is { t: "h2"; text: string } => b.t === "h2")
    .map((b) => ({
      id: slugifyHeading(b.text),
      text: b.text,
    }));
}

export function slugifyHeading(text: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
    ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return text
    .toLowerCase()
    .split("")
    .map((ch) => (ch in map ? map[ch] : ch))
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Приблизительное время чтения: 180 слов в минуту. */
export function getReadingTime(article: Article): number {
  const words = article.blocks
    .map((b) => {
      if (b.t === "p" || b.t === "h2" || b.t === "h3") return b.text;
      if (b.t === "ul" || b.t === "ol") return b.items.join(" ");
      if (b.t === "note") return `${b.title} ${b.text}`;
      if (b.t === "table") return b.rows.flat().join(" ");
      return "";
    })
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}
export const articles: Article[] = generatedArticles;