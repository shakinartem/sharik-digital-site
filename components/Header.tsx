"use client";

import { useState } from "react";
import { site } from "@/data/site";
import { ButtonLink } from "./ui";

const nav = [
  ["Где теряются пациенты", "#problems"],
  ["Чек-лист", "#checklist"],
  ["Кейсы", "#cases"],
  ["Как работаем", "#process"],
  ["Услуги", "#services"],
  ["Контакты", "#contacts"],
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="container-pad flex h-20 items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-skyBrand" onClick={() => setIsOpen(false)}>
          <img src="/brand/logo-header.svg" alt="ШАРиК-digital" className="h-10 w-auto" />
        </a>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
          {nav.map(([label, href]) => (
            <a key={href} href={href} className="rounded-lg transition hover:text-skyBrand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-skyBrand">
              {label}
            </a>
          ))}
        </nav>
        <div className="hidden md:block">
          <ButtonLink href={site.botUrl}>Получить чек-лист</ButtonLink>
        </div>
        <button
          type="button"
          aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-ink shadow-sm transition hover:border-skyBrand/40 hover:bg-blue-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-skyBrand lg:hidden"
        >
          <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
            <span className={`h-0.5 rounded-full bg-current transition ${isOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 rounded-full bg-current transition ${isOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 rounded-full bg-current transition ${isOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>
      {isOpen && (
        <nav id="mobile-nav" className="border-t border-slate-200 bg-white/95 px-5 py-4 shadow-soft backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {nav.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className="rounded-2xl px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-skyBrand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-skyBrand"
              >
                {label}
              </a>
            ))}
            <div className="px-4 pt-2">
              <ButtonLink href={site.botUrl}>Получить чек-лист</ButtonLink>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
