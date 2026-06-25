"use client";
import * as React from "react";
import Link from "next/link";
import { Search, PackageSearch, LayoutGrid } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { PageBanner } from "@/components/shared/page-banner";
import { PackageCard } from "@/components/shared/package-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/app";
import { REGIONS } from "@/lib/constants";
import { packageRegions, packageFromPrice } from "@/lib/pricing";
import { isPublic } from "@/lib/status";
import type { ServicePackage } from "@/lib/types";

export default function PackagesPage() {
  const packages = useAppStore((s) => s.packages);
  const services = useAppStore((s) => s.services);
  const providers = useAppStore((s) => s.providers);

  const [q, setQ] = React.useState("");
  const [region, setRegion] = React.useState("");

  const getService = React.useCallback(
    (id: string) => services.find((s) => s.id === id),
    [services],
  );
  const providerName = (id: string) => providers.find((p) => p.id === id)?.name;

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    return packages.filter((p: ServicePackage) => {
      if (!isPublic(p.status)) return false;
      if (query && !p.title.toLowerCase().includes(query)) return false;
      if (region && !packageRegions(p.serviceIds, getService).includes(region)) return false;
      return true;
    });
  }, [packages, q, region, getService]);

  const sorted = React.useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          packageFromPrice(a.serviceIds, getService) - packageFromPrice(b.serviceIds, getService),
      ),
    [filtered, getService],
  );

  return (
    <SiteShell>
      <PageBanner
        eyebrow="Tayyor to'plamlar"
        title="Jamlanmalar"
        description="Bir nechta xizmat yagona paketda — karnay, ovoz uskunalari, oshpaz va boshqalar birga."
        icons={["Layers", "Mic", "Music", "ChefHat"]}
      />
      <div className="container-page py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground">
            {sorted.length} ta tayyor to'plam — bir nechta xizmat yagona paketda
          </p>
          <Button asChild variant="outline">
            <Link href="/xizmatlar"><LayoutGrid /> Xizmatlar</Link>
          </Button>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Jamlanma nomi bo'yicha qidirish…"
              className="h-11 w-full rounded-xl border border-input bg-surface pl-10 pr-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Select value={region} onChange={(e) => setRegion(e.target.value)} className="w-56">
            <option value="">Barcha viloyatlar</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
        </div>

        {sorted.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="Jamlanma topilmadi"
            description="Hozircha mos jamlanmalar yo'q. Qidiruv yoki hududni o'zgartirib ko'ring."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sorted.map((p, i) => (
              <PackageCard key={p.id} pkg={p} index={i} providerName={providerName(p.providerId)} />
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
