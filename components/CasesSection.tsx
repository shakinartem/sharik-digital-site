"use client";

import { useEffect, useRef, useState } from "react";
import { cases, type CaseItem } from "@/data/cases";
import { site } from "@/data/site";
import { ButtonLink, SectionTitle } from "./ui";

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
    <section id="cases" className="section-pad bg-white/65">
      <div className="container-pad">
        <SectionTitle
          kicker="Кейсы"
          title="Показываем на практике, как digital влияет на заявки, доверие и запись"
          text="Сначала стоматологии, затем смежные медицинские проекты. Каждый кейс открывается внутри страницы без перехода."
        />
        <div className="mb-7 flex flex-wrap justify-center gap-3">
          {filters.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--red)] ${
                filter === value
                  ? "border-[color:var(--red)] bg-[color:var(--red)] text-white"
                  : "border-[color:var(--line)] bg-white/80 text-[color:var(--ink)] hover:border-[color:var(--red)]/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleCases.map((item, index) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActive(item)}
              className={`card card-lift group overflow-hidden text-left shadow-sm transition duration-200 hover:border-[color:var(--red)]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--red)] ${
                index < 3 ? "ring-1 ring-[color:var(--line)]" : ""
              }`}
            >
              <div className="aspect-square overflow-hidden bg-[color:var(--blue-soft)]">
                <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[color:var(--blue)] px-3 py-1 text-xs font-semibold text-white">
                    {getCaseFilter(item) === "dentistry" ? "Стоматология" : "Смежная медицина"}
                  </span>
                  {item.tags.filter((tag) => tag !== "Стоматология").slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[color:var(--red)] ring-1 ring-[color:var(--line)]">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="brand-title text-2xl font-semibold text-[color:var(--ink)]">{item.title}</h3>
                <p className="metric-pulse mt-2 text-sm font-semibold text-[color:var(--red)]">{item.mainResult}</p>
                <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">{item.shortDescription}</p>
                <span className="mt-5 inline-flex font-semibold text-[color:var(--red)]">Открыть кейс →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      {active && <CaseModal item={active} onClose={() => setActive(null)} />}
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[color:var(--modal-overlay)] p-3 backdrop-blur sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`case-title-${item.id}`}
        className="modal-pop mx-auto my-4 max-w-5xl overflow-hidden rounded-[24px] bg-white shadow-2xl sm:my-8 sm:rounded-[32px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-5 border-b border-[color:var(--line)] p-5 sm:flex-row sm:items-start sm:justify-between md:p-8">
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-[color:var(--red)]">{item.niche}{item.city ? ` · ${item.city}` : ""}</div>
            <h3 id={`case-title-${item.id}`} className="brand-title mt-2 text-3xl font-semibold text-[color:var(--ink)] md:text-4xl">{item.title}</h3>
            <p className="mt-3 text-lg font-semibold text-[color:var(--red)]">{item.mainResult}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] px-4 py-2 text-sm font-semibold transition hover:border-[color:var(--red)]/40 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--red)]"
          >
            Закрыть
          </button>
        </div>
        <div className="grid gap-8 p-5 md:p-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="space-y-6">
              <InfoBlock title="Задача" text={item.task} />
              <div>
                <h4 className="font-bold text-[color:var(--ink)]">Что сделали</h4>
                <ul className="mt-3 space-y-2 text-[color:var(--muted)]">
                  {item.whatWasDone.map((x) => <li key={x}>• {x}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-[color:var(--ink)]">Результат</h4>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {item.results.map((x) => <li key={x} className="rounded-2xl bg-[color:var(--blue-soft)] p-3 text-sm font-semibold text-[color:var(--ink)]">{x}</li>)}
                </ul>
              </div>
              <InfoBlock title="Вывод" text={item.conclusion} />
              <div>
                <ButtonLink href={site.links.caseLink(item.id)}>Хочу похожий результат</ButtonLink>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {item.images.map((image, i) => (
              <img key={image} src={image} alt={`${item.title}, слайд ${i + 1}`} className="w-full rounded-3xl border border-[color:var(--line)]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h4 className="font-bold text-[color:var(--ink)]">{title}</h4>
      <p className="mt-3 leading-7 text-[color:var(--muted)]">{text}</p>
    </div>
  );
}
