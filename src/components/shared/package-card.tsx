"use client";
import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Layers, GitCompare, Package as PackageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RatingBadge } from "./rating-badge";
import { useAppStore } from "@/lib/store/app";
import { useCompare } from "@/lib/store/compare";
import { useHydrated } from "@/lib/store/hydrated";
import { packageFromPrice, packageFinalFromPrice, packageDiscountConfig, packagePriceType } from "@/lib/pricing";
import { formatUZS, cn } from "@/lib/utils";
import type { ServicePackage } from "@/lib/types";

export function PackageCard({
  pkg,
  providerName,
  index = 0,
}: {
  pkg: ServicePackage;
  providerName?: string;
  index?: number;
}) {
  const services = useAppStore((s) => s.services);
  const compare = useCompare();
  const hydrated = useHydrated();
  const compared = hydrated && compare.has("package", pkg.id);

  const getService = React.useCallback(
    (id: string) => services.find((s) => s.id === id),
    [services],
  );
  const negotiable = packagePriceType(pkg.serviceIds, getService) === "negotiable";
  const cfg = packageDiscountConfig(pkg);
  const origMin = packageFromPrice(pkg.serviceIds, getService);
  const min = packageFinalFromPrice(pkg.serviceIds, getService, cfg);
  const hasDiscount = !negotiable && cfg.type !== "NONE" && min < origMin;
  const image = pkg.images[0] ?? getService(pkg.serviceIds[0])?.images[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: (index % 8) * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="card-hover group relative overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
        <Link href={`/jamlanmalar/${pkg.id}`} aria-label={pkg.title} className="absolute inset-0 z-[1]" />
        <div className="relative aspect-[4/3] overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={pkg.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary-50 text-primary">
              <PackageIcon className="size-10" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex items-start justify-between p-3">
            <Badge className="bg-accent text-accent-foreground" variant="accent">
              <Layers className="mr-1 size-3.5" /> Jamlanma
            </Badge>
            <button
              type="button"
              onClick={() => compare.toggle("package", pkg.id)}
              aria-label="Solishtirishga qo'shish"
              className={cn(
                "pointer-events-auto flex size-9 items-center justify-center rounded-full bg-surface/90 backdrop-blur transition-colors",
                compared ? "text-primary" : "text-muted-foreground hover:text-primary",
              )}
            >
              <GitCompare className="size-4" />
            </button>
          </div>
        </div>

        <div className="relative p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold text-foreground">{pkg.title}</h3>
            <RatingBadge rating={pkg.rating || 0} reviewCount={pkg.reviewCount} size="sm" showCount={false} />
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Layers className="size-3.5" /> {pkg.serviceIds.length} ta xizmat
            {providerName ? ` · ${providerName}` : ""}
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <div>
              <div className="text-[11px] text-muted-foreground">To'plam narxi</div>
              {negotiable ? (
                <div className="font-display font-bold text-primary">Kelishuv asosida</div>
              ) : hasDiscount ? (
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground line-through">{formatUZS(origMin)}</span>
                    <span className="rounded bg-success-bg px-1 py-0.5 text-[9px] font-bold text-success">
                      {cfg.type === "PERCENTAGE" ? `−${cfg.value}%` : "chegirma"}
                    </span>
                  </div>
                  <div className="font-display font-bold text-success">{formatUZS(min)} dan</div>
                </div>
              ) : (
                <div className="font-display font-bold text-primary">{formatUZS(min)} dan</div>
              )}
            </div>
            <span className="rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              Batafsil
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
