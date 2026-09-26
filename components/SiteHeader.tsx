"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { DIRECTIONS } from "@/data/agency";

type NavItem = { label: string; href: string };

const ANCHORS: NavItem[] = [
  { label: "Направления", href: "/#directions" },
  { label: "Кейсы", href: "/#cases" },
  { label: "Подход", href: "/#approach" },
  { label: "О нас", href: "/#founder" },
  { label: "FAQ", href: "/#faq" },
];

export function SiteHeader({
  ctaLabel = "Рассчитать потенциал",
  ctaHref = "/sellers#potential",
  solidBg = false,
}: {
  ctaLabel?: string;
  ctaHref?: string;
  solidBg?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dirOpen, setDirOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition ${
        solidBg ? "border-border bg-white/90 backdrop-blur-xl" : "border-transparent bg-transparent"
      }`}
    >
      <div className="container-wide">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-lg font-black text-foreground">
              ШАРиК<span className="text-primary">.</span>digital
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-bold text-foreground lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setDirOpen(true)}
              onMouseLeave={() => setDirOpen(false)}
            >
              <button
                type="button"
                onClick={() => setDirOpen((v) => !v)}
                aria-expanded={dirOpen}
                className="inline-flex items-center gap-1.5 rounded-lg py-2 transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Направления
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dirOpen ? "rotate-180" : ""}`} />
              </button>
              {dirOpen && (
                <div className="absolute left-1/2 top-full w-80 -translate-x-1/2 pt-3">
                  <div className="card-base overflow-hidden p-2 shadow-xl">
                    {DIRECTIONS.map((d) => (
                      <Link
                        key={d.href}
                        href={d.href}
                        onClick={() => setDirOpen(false)}
                        className="block rounded-xl px-4 py-3 transition hover:bg-primary-soft"
                      >
                        <span className="block text-sm font-black text-foreground">{d.label}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {d.description}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {ANCHORS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg py-2 transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden shrink-0 lg:block">
            <a href={ctaHref} className="btn-primary min-h-11 px-5 text-sm">
              {ctaLabel}
            </a>
          </div>

          <button
            type="button"
            aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            onClick={() => setIsOpen((v) => !v)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground transition hover:border-primary/40 lg:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <nav id="mobile-nav" className="border-t border-border bg-white lg:hidden">
          <div className="container-wide space-y-1 py-4">
            <p className="px-4 pb-1 pt-2 text-xs font-black uppercase tracking-wide text-muted-foreground">
              Направления
            </p>
            {DIRECTIONS.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-black text-foreground transition hover:bg-primary-soft hover:text-primary"
              >
                {d.label}
              </Link>
            ))}
            <div className="px-4 pb-1 pt-3 text-xs font-black uppercase tracking-wide text-muted-foreground">
              Агентство
            </div>
            {ANCHORS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-bold text-foreground transition hover:bg-primary-soft hover:text-primary"
              >
                {item.label}
              </a>
            ))}
            <div className="px-4 pt-3">
              <a href={ctaHref} onClick={() => setIsOpen(false)} className="btn-primary w-full">
                {ctaLabel}
              </a>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
