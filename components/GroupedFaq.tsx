"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { SectionTitle } from "@/components/ui";
import { groupFaq, type FaqItem } from "@/data/faq";

/**
 * FAQ с подразделами.
 *
 * Раньше все вопросы шли одним списком: на странице Яндекс KIT их
 * семнадцать, и человек либо не дочитывал, либо закрывал вкладку.
 * Теперь вопросы разложены по темам (вопрос про оплату не стоит
 * рядом с вопросом про склад), а заголовок подраздела даёт понять,
 * что ответ находится ниже.
 *
 * Подразделы приходят из content/faq: поле `group` в frontmatter.
 * Порядок и состав меняются в markdown, а не здесь.
 */
export function GroupedFaq({
  items,
  kicker = "FAQ",
  title = "Частые вопросы",
  id = "faq",
  tone = "muted",
}: {
  items: FaqItem[];
  kicker?: string;
  title?: string;
  id?: string;
  tone?: "muted" | "plain";
}) {
  const groups = groupFaq(items);
  // Ключ — заголовок плюс индекс: два подраздела с одинаковым
  // названием (если их завели в markdown) не схлопнутся.
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id={id} className={tone === "muted" ? "section-pad bg-muted" : "section-pad"}>
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle kicker={kicker} title={title} />
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-10">
          {groups.map((group) => (
            <div key={group.title}>
              {/* Подраздел — h3: h2 уже занят заголовком секции,
                  а h3 сохраняет структуру для скринридеров. */}
              <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-wide text-primary">
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
                {group.title}
              </h3>
              <div className="mt-4">
                {group.items.map((item) => {
                  const key = `${group.title}::${item.id}`;
                  const isOpen = open === key;
                  return (
                    <div
                      key={item.id}
                      className={`border-t border-border/60 transition-all duration-300 ${
                        isOpen ? "bg-primary/5" : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : key)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-black text-foreground transition hover:text-primary"
                      >
                        {item.q}
                        <span className="shrink-0 text-primary">
                          {isOpen ? (
                            <Minus className="h-5 w-5" />
                          ) : (
                            <Plus className="h-5 w-5" />
                          )}
                        </span>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isOpen ? "max-h-96 pb-4" : "max-h-0"
                        }`}
                      >
                        <p className="text-base leading-7 text-muted-foreground">{item.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}