import * as React from "react";
import { DynamicIcon } from "@/lib/icons";

/**
 * Har bir bo'lim uchun premium header banner — gradient fon, motif, blur orbs
 * va mavzuga mos ikon klasteri (illustration o'rnida, qo'shimcha dep'siz).
 * variant="full" — to'liq enli (landing/marketplace), "card" — konteyner ichidagi
 * yumaloq karta (dashboard sahifalar).
 */
export function PageBanner({
  eyebrow,
  title,
  description,
  icons = [],
  actions,
  variant = "full",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Mavzuga mos lucide ikon nomlari (o'ngdagi klaster). */
  icons?: string[];
  actions?: React.ReactNode;
  variant?: "full" | "card";
}) {
  const cluster = icons.length > 0 && (
    <div className="flex shrink-0 items-center gap-3 sm:gap-4">
      {icons.slice(0, 4).map((name, i) => (
        <span
          key={name}
          className="glass flex items-center justify-center rounded-2xl text-primary shadow-card"
          style={{
            width: i % 2 ? "3.25rem" : "3.75rem",
            height: i % 2 ? "3.25rem" : "3.75rem",
            transform: `translateY(${i % 2 ? "0.5rem" : "-0.25rem"}) rotate(${i % 2 ? 6 : -6}deg)`,
          }}
        >
          <DynamicIcon name={name} className="size-6" />
        </span>
      ))}
    </div>
  );

  const body = (
    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            {eyebrow}
          </span>
        )}
        <h1 className={variant === "card"
          ? "mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl"
          : "mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl"}>
          {title}
        </h1>
        {description && <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {(cluster || actions) && (
        <div className="flex items-center gap-3">
          {cluster}
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
    </div>
  );

  if (variant === "card") {
    return (
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-surface/60 p-6">
        <div className="motif-grid absolute inset-0 opacity-50" />
        <div className="absolute -right-10 -top-12 h-40 w-52 rounded-full bg-primary-100/40 blur-3xl" />
        <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-secondary-100/30 blur-3xl" />
        {body}
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden border-b border-border bg-surface/40">
      <div className="motif-grid absolute inset-0 opacity-60" />
      <div className="absolute -right-16 -top-24 h-64 w-72 rounded-full bg-primary-100/50 blur-3xl" />
      <div className="absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-secondary-100/40 blur-3xl" />
      <div className="container-page relative py-10 sm:py-14">{body}</div>
    </section>
  );
}
