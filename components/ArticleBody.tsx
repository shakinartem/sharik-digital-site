import { type Block, slugifyHeading } from "@/data/articles";
import { Info, AlertTriangle, Lightbulb, ExternalLink } from "lucide-react";

/**
 * Рендерер тела статьи.
 *
 * Единственное место в проекте, где решается, как выглядит абзац,
 * выноска и таблица. Контент приходит типизированными блоками из
 * data/articles.ts, поэтому сырой HTML сюда попасть не может.
 *
 * Выноски намеренно различаются и цветом, и иконкой: на телефоне
 * различие только в иконке, и «Ошибка» не должна читаться как подсказка.
 */
const NOTE_STYLES = {
  note: {
    wrap: "border-l-primary bg-primary-soft",
    icon: Info,
    iconClass: "text-primary",
    label: "Важно",
  },
  warn: {
    wrap: "border-l-[#B45309] bg-amber-50",
    icon: AlertTriangle,
    iconClass: "text-[#B45309]",
    label: "Обратите внимание",
  },
  tip: {
    wrap: "border-l-emerald-600 bg-emerald-50",
    icon: Lightbulb,
    iconClass: "text-emerald-700",
    label: "Совет",
  },
} as const;

function renderTable(block: Extract<Block, { t: "table" }>) {
  return (
    // На мобильном таблица прокручивается по горизонтали, а не сжимается
    // в нечитаемые колонки.
    <div className="my-6 overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            {block.head.map((h) => (
              <th
                key={h}
                className="px-3 py-3 font-display text-sm font-bold text-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, i) => (
            <tr key={i} className="border-b border-border/60 last:border-0">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-3 py-3 leading-6 ${
                    j === 0 ? "font-bold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderBlock(block: Block, key: number) {
  switch (block.t) {
    case "p":
      return (
        <p key={key} className="my-4 text-base leading-8 text-muted-foreground">
          {block.text}
        </p>
      );
    case "h2":
      return (
        <h2
          key={key}
          id={slugifyHeading(block.text)}
          className="mt-12 scroll-mt-24 font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl"
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3
          key={key}
          id={slugifyHeading(block.text)}
          className="mt-8 scroll-mt-24 font-display text-lg font-bold text-foreground"
        >
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul key={key} className="my-5 space-y-2.5">
          {block.items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-base leading-7 text-muted-foreground">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={key} className="my-5 space-y-3">
          {block.items.map((item, i) => (
            <li key={item} className="flex items-start gap-3 text-base leading-7 text-muted-foreground">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-xs font-bold text-primary">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );
    case "note": {
      const style = NOTE_STYLES[block.kind];
      const Icon = style.icon;
      return (
        <aside
          key={key}
          className={`my-6 rounded-2xl border-l-4 p-5 ${style.wrap}`}
        >
          <p className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
            <Icon className={`h-4 w-4 shrink-0 ${style.iconClass}`} />
            {block.title}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{block.text}</p>
        </aside>
      );
    }
    case "table":
      return renderTable(block);
    default:
      return null;
  }
}

export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return <div className="max-w-none">{blocks.map(renderBlock)}</div>;
}

export function SourceNote({ url, label }: { url: string; label: string }) {
  return (
    <p className="mt-8 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-muted p-4 text-xs text-muted-foreground">
      <Info className="h-4 w-4 shrink-0 text-primary" />
      Функциональность описана по официальной справке. Платформа меняется — проверяйте
      актуальные условия.
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 font-bold text-primary underline underline-offset-2"
      >
        {label}
        <ExternalLink className="h-3 w-3" />
      </a>
    </p>
  );
}