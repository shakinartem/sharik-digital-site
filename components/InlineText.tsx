/**
 * Инлайн-разметка: **жирный**, *курсив*, [ссылка](адрес).
 *
 * Собирается через React-узлы, а не через dangerouslySetInnerHTML:
 * так текст из админки физически не может превратиться в HTML и
 * выполнить скрипт. Порядок важен — сначала текст экранируется
 * самим JSX, потом разбирается на части.
 */
import type { ReactNode } from "react";

/** Порядок важен: сперва жирный, иначе ** попадёт под курсив. */
const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;

export function InlineText({ text }: { text: string }): ReactNode {
  const parts = text.split(INLINE).filter((part) => part !== "");

  return (
    <>
      {parts.map((part, i) => {
        const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
        if (link) {
          const [, label, href] = link;
          // Внешние ссылки открываем в новой вкладке и закрываем
          // окно для обратной связи: rel защищает от кражи навигации.
          const external = /^https?:\/\//.test(href);
          return (
            <a
              key={i}
              href={href}
              className="text-primary underline underline-offset-2 hover:opacity-80"
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {label}
            </a>
          );
        }

        const bold = part.match(/^\*\*([^*]+)\*\*$/);
        if (bold) {
          return (
            <strong key={i} className="font-bold text-foreground">
              {bold[1]}
            </strong>
          );
        }

        const italic = part.match(/^\*([^*]+)\*$/);
        if (italic) {
          return (
            <em key={i} className="italic">
              {italic[1]}
            </em>
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
