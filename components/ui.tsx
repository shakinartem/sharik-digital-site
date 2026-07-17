import type { ReactNode } from "react";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline";
  className?: string;
}) {
  const isExternal = href.startsWith("http");
  const base =
    variant === "primary"
      ? "btn-primary"
      : "btn-outline";
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-black transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${base} ${className}`}
    >
      {children}
    </a>
  );
}

export function SectionTitle({ kicker, title, text }: { kicker?: string; title: string; text?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {kicker && (
        <div className="mb-5 inline-flex items-center rounded-full bg-muted px-4 py-1.5 text-xs font-black text-muted-foreground">
          {kicker}
        </div>
      )}
      <h2
        className="font-black leading-[0.95] text-foreground"
        style={{
          fontSize: "clamp(1.4rem, min(5cqi, 5rem), 3.6rem)",
        }}
      >
        {title}
      </h2>
      {text && <p className="mt-5 text-base leading-7 text-muted-foreground">{text}</p>}
    </div>
  );
}

export function NumberBadge({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white font-black text-primary ring-1 ring-border">
      {children}
    </div>
  );
}