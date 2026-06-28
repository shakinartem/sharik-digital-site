import Link from "next/link";
import type { ReactNode } from "react";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const isExternal = href.startsWith("http");
  const styles = {
    primary: "bg-[color:var(--red)] text-white hover:-translate-y-0.5 hover:brightness-90",
    secondary: "bg-[color:var(--blue)] text-white hover:-translate-y-0.5 hover:brightness-110",
    ghost: "border border-[color:var(--line)] bg-white/80 text-[color:var(--ink)] hover:-translate-y-0.5 hover:border-[color:var(--red)]/40 hover:bg-white",
  }[variant];
  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className={`inline-flex min-h-12 w-full max-w-full items-center justify-center rounded-full px-5 py-3 text-center text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--red)] sm:w-auto ${styles} ${className}`}
    >
      {children}
    </Link>
  );
}

export function SectionTitle({ kicker, title, text }: { kicker?: string; title: string; text?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {kicker && <div className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-[color:var(--red)]">{kicker}</div>}
      <h2 className="brand-title text-3xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-4xl lg:text-5xl">{title}</h2>
      {text && <p className="mt-5 text-lg leading-8 text-[color:var(--muted)]">{text}</p>}
    </div>
  );
}

export function NumberBadge({ children }: { children: ReactNode }) {
  return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white font-bold text-[color:var(--red)] ring-1 ring-[color:var(--line)]">{children}</div>;
}
