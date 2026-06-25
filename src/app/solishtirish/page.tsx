"use client";
import * as React from "react";
import Link from "next/link";
import { GitCompare, X, Star, Layers, ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useAppStore } from "@/lib/store/app";
import { useCompare } from "@/lib/store/compare";
import { useHydrated } from "@/lib/store/hydrated";
import { DIRECTION_MAP, CATEGORY_MAP } from "@/lib/constants";
import {
  fromPrice,
  serviceRegions,
  packageRegions,
  packageFromPrice,
  packagePriceType,
} from "@/lib/pricing";
import { formatUZS } from "@/lib/utils";
import type { ItemKind } from "@/lib/types";

interface Row {
  kind: ItemKind;
  id: string;
  href: string;
  title: string;
  image?: string;
  typeLabel: string;
  categoryLabel: string;
  priceLabel: string;
  rating: number;
  reviewCount: number;
  regions: string[];
  ownerName: string;
  members?: string[];
}

export default function ComparePage() {
  const { items, remove, clear } = useCompare();
  const services = useAppStore((s) => s.services);
  const packages = useAppStore((s) => s.packages);
  const providers = useAppStore((s) => s.providers);
  const hydrated = useHydrated();

  const getService = React.useCallback(
    (id: string) => services.find((s) => s.id === id),
    [services],
  );
  const ownerNameOf = React.useCallback(
    (id: string) => providers.find((p) => p.id === id)?.name ?? "—",
    [providers],
  );

  const rows: Row[] = React.useMemo(() => {
    if (!hydrated) return [];
    const out: Row[] = [];
    for (const it of items) {
      if (it.kind === "service") {
        const s = services.find((x) => x.id === it.id);
        if (!s) continue;
        const dir = DIRECTION_MAP[s.directionId];
        const negotiable = s.priceType === "negotiable";
        out.push({
          kind: "service",
          id: s.id,
          href: `/xizmatlar/${s.id}`,
          title: s.title,
          image: s.images[0],
          typeLabel: "Xizmat",
          categoryLabel: dir ? `${CATEGORY_MAP[dir.categoryId]?.name ?? ""} · ${dir.name}` : "—",
          priceLabel: negotiable ? "Kelishuv asosida" : `${formatUZS(fromPrice(s.regionPrices))} dan`,
          rating: s.rating,
          reviewCount: s.reviewCount,
          regions: serviceRegions(s.regionPrices),
          ownerName: ownerNameOf(s.providerId),
        });
      } else {
        const p = packages.find((x) => x.id === it.id);
        if (!p) continue;
        const negotiable = packagePriceType(p.serviceIds, getService) === "negotiable";
        out.push({
          kind: "package",
          id: p.id,
          href: `/jamlanmalar/${p.id}`,
          title: p.title,
          image: p.images[0] ?? getService(p.serviceIds[0])?.images[0],
          typeLabel: "Jamlanma",
          categoryLabel: `${p.serviceIds.length} ta xizmat`,
          priceLabel: negotiable ? "Kelishuv asosida" : `${formatUZS(packageFromPrice(p.serviceIds, getService))} dan`,
          rating: p.rating,
          reviewCount: p.reviewCount,
          regions: packageRegions(p.serviceIds, getService),
          ownerName: ownerNameOf(p.providerId),
          members: p.serviceIds.map((sid) => getService(sid)?.title ?? "Xizmat"),
        });
      }
    }
    return out;
  }, [items, services, packages, getService, ownerNameOf, hydrated]);

  return (
    <SiteShell>
      <div className="container-page py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 font-display text-3xl font-bold tracking-tight">
              <GitCompare className="size-7 text-primary" /> Solishtirish
            </h1>
            <p className="mt-1 text-muted-foreground">Tanlangan xizmat va jamlanmalarni yonma-yon taqqoslang.</p>
          </div>
          {rows.length > 0 && (
            <Button variant="outline" onClick={clear}><X /> Hammasini tozalash</Button>
          )}
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={GitCompare}
            title="Solishtirish ro'yxati bo'sh"
            description="Xizmat yoki jamlanma kartochkalaridagi solishtirish tugmasi orqali element qo'shing."
            action={<Button asChild><Link href="/xizmatlar">Xizmatlarni ko'rish</Link></Button>}
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-soft">
            <table className="w-full min-w-[640px] text-sm">
              <tbody>
                {/* Sarlavha + rasm */}
                <tr className="border-b border-border">
                  <th className="w-36 bg-muted/40 p-4 text-left align-top text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Element
                  </th>
                  {rows.map((r) => (
                    <td key={r.id} className="min-w-[220px] border-l border-border p-4 align-top">
                      <div className="relative">
                        <button
                          onClick={() => remove(r.kind, r.id)}
                          aria-label="Olib tashlash"
                          className="absolute right-0 top-0 flex size-7 items-center justify-center rounded-lg bg-surface/90 text-muted-foreground shadow-soft hover:text-danger"
                        >
                          <X className="size-4" />
                        </button>
                        {r.image ? (
                          <img src={r.image} alt={r.title} className="h-28 w-full rounded-xl object-cover" />
                        ) : (
                          <div className="flex h-28 w-full items-center justify-center rounded-xl bg-primary-50 text-primary">
                            <Layers className="size-7" />
                          </div>
                        )}
                        <Link href={r.href} className="mt-2 line-clamp-2 block font-semibold text-foreground hover:text-primary">
                          {r.title}
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>

                <CompareRow label="Tur">
                  {rows.map((r) => (
                    <Cell key={r.id}>
                      <Badge variant={r.kind === "package" ? "accent" : "default"}>
                        {r.kind === "package" ? <Layers className="mr-1 size-3.5" /> : null}
                        {r.typeLabel}
                      </Badge>
                    </Cell>
                  ))}
                </CompareRow>

                <CompareRow label="Kategoriya / tarkib">
                  {rows.map((r) => <Cell key={r.id}><span className="text-muted-foreground">{r.categoryLabel}</span></Cell>)}
                </CompareRow>

                <CompareRow label="Narx">
                  {rows.map((r) => <Cell key={r.id}><span className="font-display font-bold text-primary">{r.priceLabel}</span></Cell>)}
                </CompareRow>

                <CompareRow label="Reyting">
                  {rows.map((r) => (
                    <Cell key={r.id}>
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Star className="size-4 fill-accent text-accent" />
                        {r.rating ? r.rating.toFixed(1) : "—"}
                        <span className="text-xs text-muted-foreground">({r.reviewCount})</span>
                      </span>
                    </Cell>
                  ))}
                </CompareRow>

                <CompareRow label="Mavjud hududlar">
                  {rows.map((r) => (
                    <Cell key={r.id}>
                      <span className="text-muted-foreground">{r.regions.length} ta viloyat</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {r.regions.slice(0, 4).map((rg) => (
                          <span key={rg} className="rounded-full bg-muted px-2 py-0.5 text-[11px]">{rg}</span>
                        ))}
                        {r.regions.length > 4 && <span className="text-[11px] text-muted-foreground">+{r.regions.length - 4}</span>}
                      </div>
                    </Cell>
                  ))}
                </CompareRow>

                <CompareRow label="Taqdimotchi">
                  {rows.map((r) => <Cell key={r.id}><span className="text-muted-foreground">{r.ownerName}</span></Cell>)}
                </CompareRow>

                <CompareRow label="To'plam tarkibi">
                  {rows.map((r) => (
                    <Cell key={r.id}>
                      {r.members ? (
                        <ul className="space-y-1">
                          {r.members.map((m, i) => (
                            <li key={i} className="text-xs text-foreground/80">• {m}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </Cell>
                  ))}
                </CompareRow>

                <tr>
                  <th className="bg-muted/40 p-4" />
                  {rows.map((r) => (
                    <td key={r.id} className="border-l border-border p-4 align-top">
                      <Button asChild size="sm" className="w-full">
                        <Link href={r.href}>Batafsil <ArrowRight /></Link>
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SiteShell>
  );
}

function CompareRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-b border-border last:border-0">
      <th className="bg-muted/40 p-4 text-left align-top text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </th>
      {children}
    </tr>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return <td className="min-w-[220px] border-l border-border p-4 align-top">{children}</td>;
}
