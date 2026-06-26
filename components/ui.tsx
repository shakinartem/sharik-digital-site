import Link from "next/link";
import type { ReactNode } from "react";

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" | "ghost" }) {
  const isExternal = href.startsWith("http");
  const styles = {
    primary: "bg-skyBrand text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-xl",
    secondary: "bg-ink text-white hover:-translate-y-0.5 hover:bg-slate-900",
    ghost: "border border-slate-200 bg-white text-ink hover:-translate-y-0.5 hover:border-skyBrand/40 hover:bg-blue-50/60",
  }[variant];
  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className={`inline-flex min-h-12 w-full max-w-full items-center justify-center rounded-full px-5 py-3 text-center text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-skyBrand sm:w-auto ${styles}`}
    >
      {children}
    </Link>
  );
}

export function SectionTitle({ kicker, title, text }: { kicker?: string; title: string; text?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {kicker && <div className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-skyBrand">{kicker}</div>}
      <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">{title}</h2>
      {text && <p className="mt-5 text-lg leading-8 text-muted">{text}</p>}
    </div>
  );
}

export function NumberBadge({ children }: { children: ReactNode }) {
  return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 font-bold text-skyBrand">{children}</div>;
}
