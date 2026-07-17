"use client";

import { useState } from "react";
import { site } from "@/data/site";
import { Menu, X } from "lucide-react";

const nav = [
  ["Методология 7К", "#methodology-7k"],
  ["Карта потерь", "#loss-map"],
  ["Индекс потока", "#flow-index"],
  ["Кейсы", "#cases"],
  ["Что внедряем", "#services"],
  ["FAQ", "#faq"],
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-4 z-40 mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8">
      <div className="flex h-14 items-center justify-between gap-5 rounded-full border border-border bg-white/85 pl-5 pr-2 shadow-header backdrop-blur-xl sm:h-16 sm:pl-7 sm:pr-2.5">
        <a href="#top" className="flex items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" onClick={() => setIsOpen(false)}>
          <div className="text-lg font-black text-foreground">
            ШАРиК<span className="text-primary">.</span>digital
          </div>
        </a>
        <nav className="hidden items-center justify-center gap-8 text-sm font-black text-foreground md:flex">
          {nav.map(([label, href]) => (
            <a key={href} href={href} className="rounded-lg transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
              {label}
            </a>
          ))}
        </nav>
        <div className="hidden md:block">
          <a href={site.links.audit} className="btn-primary inline-flex min-h-10 items-center justify-center rounded-full px-5 py-2 text-sm font-black">
            Бесплатный аудит
          </a>
        </div>
        <button
          type="button"
          aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground transition hover:border-primary/40 md:hidden"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {isOpen && (
        <nav id="mobile-nav" className="mt-2 rounded-2xl border border-border bg-white/95 p-4 shadow-header backdrop-blur-xl md:hidden">
          <div className="grid gap-1">
            {nav.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-black text-foreground transition hover:bg-muted hover:text-primary"
              >
                {label}
              </a>
            ))}
            <div className="px-4 pt-3">
              <a href={site.links.audit} className="btn-primary inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-black">
                Бесплатный аудит
              </a>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}