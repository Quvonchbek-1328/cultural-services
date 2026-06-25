import * as React from "react";
import { PageBanner } from "./page-banner";

/**
 * Sahifa sarlavhasi = premium banner-karta (PageBanner card variant ustida).
 * `icons` berilsa mavzu klasteri ham chiqadi; aks holda oddiy gradient-karta.
 */
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  icons,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
  icons?: string[];
}) {
  return (
    <PageBanner
      variant="card"
      title={title}
      description={description}
      actions={actions}
      eyebrow={eyebrow}
      icons={icons}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <span className="inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-3 text-base text-muted-foreground">{description}</p>}
    </div>
  );
}
