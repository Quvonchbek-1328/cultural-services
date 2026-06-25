"use client";
import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Heart, Building2, GitCompare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RatingBadge } from "./rating-badge";
import { DIRECTION_MAP } from "@/lib/constants";
import { useFavorites } from "@/lib/store/favorites";
import { useCompare } from "@/lib/store/compare";
import { useHydrated } from "@/lib/store/hydrated";
import { fromPrice } from "@/lib/pricing";
import { formatUZS, cn } from "@/lib/utils";
import type { Service } from "@/lib/types";

export function ServiceCard({
  service,
  providerName,
  orgName,
  index = 0,
}: {
  service: Service;
  providerName?: string;
  orgName?: string;
  index?: number;
}) {
  const dir = DIRECTION_MAP[service.directionId];
  const { ids, toggle } = useFavorites();
  const compare = useCompare();
  const hydrated = useHydrated();
  const fav = hydrated && ids.includes(service.id);
  const compared = hydrated && compare.has("service", service.id);

  const negotiable = service.priceType === "negotiable";
  const min = fromPrice(service.regionPrices);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: (index % 8) * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="card-hover group relative overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
        <Link
          href={`/xizmatlar/${service.id}`}
          aria-label={service.title}
          className="absolute inset-0 z-[1]"
        />
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={service.images[0]}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex items-start justify-between p-3">
            <Badge className="bg-surface/90 backdrop-blur" variant="default">
              {dir?.name ?? "Xizmat"}
            </Badge>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => compare.toggle("service", service.id)}
                aria-label="Solishtirishga qo'shish"
                className={cn(
                  "pointer-events-auto flex size-9 items-center justify-center rounded-full bg-surface/90 backdrop-blur transition-colors",
                  compared ? "text-primary" : "text-muted-foreground hover:text-primary",
                )}
              >
                <GitCompare className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => toggle(service.id)}
                aria-label="Sevimlilarga qo'shish"
                className="pointer-events-auto flex size-9 items-center justify-center rounded-full bg-surface/90 text-muted-foreground backdrop-blur transition-colors hover:text-danger"
              >
                <Heart className={cn("size-4", fav && "fill-danger text-danger")} />
              </button>
            </div>
          </div>
          {service.featured && (
            <span className="absolute bottom-3 left-3 z-[2] rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground shadow-soft">
              Tavsiya etilgan
            </span>
          )}
        </div>

        <div className="relative p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold text-foreground">{service.title}</h3>
            <RatingBadge rating={service.rating || 0} reviewCount={service.reviewCount} size="sm" showCount={false} />
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" /> {service.region}
            {service.district ? `, ${service.district}` : ""}
          </p>
          {(orgName || providerName) && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              {orgName ? <Building2 className="size-3.5" /> : null}
              <span className="line-clamp-1">{orgName ?? providerName}</span>
            </p>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <div>
              <div className="text-[11px] text-muted-foreground">
                {negotiable ? "Narx" : "Boshlang'ich narx"}
              </div>
              <div className="font-display font-bold text-primary">
                {negotiable ? "Kelishuv asosida" : `${formatUZS(min)} dan`}
              </div>
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
