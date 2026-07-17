"use client";

import { useEffect, useRef, useState } from "react";
import { cases, type CaseItem } from "@/data/cases";
import { site } from "@/data/site";
import { SectionTitle, ButtonLink } from "./ui";
import { ArrowUpRight } from "lucide-react";

const filters = [
  ["all", "Все"],
  ["dentistry", "Стоматологии"],
  ["medical", "Смежная медицина"],
] as const;

type CaseFilter = (typeof filters)[number][0];

const dentistryIds = new Set(["eurodent", "biomed", "interdent", "dental-pro", "ibradent"]);

function getCaseFilter(item: CaseItem): Exclude<CaseFilter, "all"> {
  return dentistryIds.has(item.id) ? "dentistry" : "medical";
}

function getCaseOrder(item: CaseItem) {
  const order = ["eurodent", "biomed", "interdent", "dental-pro", "ibradent", "divina-podology", "kerala", "arximed-security", "po-pyatam"];
  return order.indexOf(item.id);
}

export function CasesSection() {
  const [active, setActive] = useState<CaseItem | null>(null);
  const [filter, setFilter] = useState<CaseFilter>("all");
  const visibleCases = cases
    .slice()
    .sort((a, b) => getCaseOrder(a) - getCaseOrder(b))
    .filter((item) => filter === "all" || getCaseFilter(item) === filter);

  return (
    <section id="cases" className="section-pad bg-muted">
      <div className="container-wide">
        <div className="reveal">
          <SectionTitle
            kicker="Кейсы"
            title="Закрываем контуры пациентопотока: кейсы с цифрами"
            text="Каждый кейс — это конкретный контур, который мы закрыли и измерили результат."
          />
        </div>

        <div className="mb-8 flex justify-center gap-2 reveal reveal-delay-1">
          {filters.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full border px-4 py-2 text-sm font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                filter === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white text-foreground hover:border-primary/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleCases.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActive(item)}
              className="group overflow-hidden text-left rounded-[2rem] border border-border bg-white transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary reveal"
            >
              <div className="h-44 overflow-hidden">
                <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5 sm:p-6">
                <div className="mb-2 inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">
                  {item.niche}
                </div>
                <h3 className="font-black text-foreground" style={{ fontSize: "clamp(1.2rem, min(4cqi, 5rem), 1.75rem)", lineHeight: 1.05 }}>
                  {item.title}
                </h3>
                <div className="mt-2 font-black text-primary">{item.mainResult}</div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.shortDescription}</p>
                <div className="cta-link mt-4 group">
                  <span>Подробнее</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" strokeWidth={2.5} />
                </div>
              </div>
            </button>
          ))}
        </div>

        {active && <CaseModal item={active} onClose={() => setActive(null)} />}
      </div>
    </section>
  );
}

function CaseModal({ item, onClose }: { item: CaseItem; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`case-title-${item.id}`}
        className="modal-pop mx-auto my-4 max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-5 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between md:p-8">
          <div>
            <div className="mb-2 inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">
              {item.niche}{item.city ? ` · ${item.city}` : ""}
            </div>
            <h3
              id={`case-title-${item.id}`}
              className="font-black text-foreground"
              style={{ fontSize: "clamp(1.4rem, min(5cqi, 5rem), 3.6rem)", lineHeight: 0.95 }}
            >
              {item.title}
            </h3>
            <p className="mt-3 text-base font-black text-primary">{item.mainResult}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-border bg-white px-4 py-2 text-sm font-black text-foreground transition hover:border-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Закрыть
          </button>
        </div>
        <div className="grid gap-8 p-5 md:p-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="space-y-6">
              <div>
                <h4 className="font-black text-foreground">Задача</h4>
                <p className="mt-3 leading-7 text-muted-foreground">{item.task}</p>
              </div>
              <div>
                <h4 className="font-black text-foreground">Что сделали</h4>
                <ul className="mt-3 space-y-2 text-muted-foreground">
                  {item.whatWasDone.map((x) => <li key={x}>• {x}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-black text-foreground">Результат</h4>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {item.results.map((x) => (
                    <li key={x} className="rounded-2xl bg-primary/5 p-3 text-sm font-black text-foreground">
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-black text-foreground">Вывод</h4>
                <p className="mt-3 leading-7 text-muted-foreground">{item.conclusion}</p>
              </div>
              <div>
                <ButtonLink href={site.links.caseLink(item.id)}>Хочу похожий результат</ButtonLink>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {item.images.map((image, i) => (
              <img key={image} src={image} alt={`${item.title}, слайд ${i + 1}`} className="w-full rounded-card border border-border" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}