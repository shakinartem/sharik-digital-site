"use client";

import { useState } from "react";
import { site } from "@/data/site";
import { ButtonLink } from "./ui";

const nav = [
  ["Где теряются пациенты", "#loss-map"],
  ["Чек-лист", "#checklist"],
  ["Кейсы", "#cases"],
  ["Услуги", "#services"],
  ["Пакеты", "#solutions"],
  ["FAQ", "#faq"],
  ["Пред-аудит", "#contact"],
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-white/85 backdrop-blur-xl">
      <div className="container-pad flex min-h-24 items-center justify-between gap-5 py-3">
        <a href="#top" className="flex items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--red)]" onClick={() => setIsOpen(false)}>
          <img src="/brand/logo-header.svg" alt="ШАРиК-digital" className="h-14 w-auto sm:h-16" />
        </a>
        <div className="hidden h-20 border-l-4 border-dotted border-[color:var(--red)]/80 lg:block" aria-hidden="true" />
        <nav className="hidden flex-1 items-center justify-center gap-10 text-base font-medium text-[color:var(--ink)] lg:flex">
          {nav.map(([label, href]) => (
            <a key={href} href={href} className="rounded-lg transition hover:text-[color:var(--red)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--red)]">
              {label}
            </a>
          ))}
        </nav>
        <div className="hidden md:block">
          <ButtonLink href={site.links.checklist}>Забрать чек-лист</ButtonLink>
        </div>
        <button
          type="button"
          aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] bg-white text-[color:var(--ink)] shadow-sm transition hover:border-[color:var(--red)]/40 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--red)] lg:hidden"
        >
          <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
            <span className={`h-0.5 rounded-full bg-current transition ${isOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 rounded-full bg-current transition ${isOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 rounded-full bg-current transition ${isOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>
      {isOpen && (
        <nav id="mobile-nav" className="border-t border-[color:var(--line)] bg-white/95 px-5 py-4 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {nav.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className="rounded-2xl px-4 py-3 text-base font-semibold text-[color:var(--ink)] transition hover:bg-white hover:text-[color:var(--red)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--red)]"
              >
                {label}
              </a>
            ))}
            <div className="px-4 pt-2">
              <ButtonLink href={site.links.checklist}>Забрать чек-лист</ButtonLink>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
