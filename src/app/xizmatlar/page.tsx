"use client";
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Search, X, PackageSearch, Layers } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { PageBanner } from "@/components/shared/page-banner";
import { FilterPanel, DEFAULT_FILTERS, type Filters } from "@/components/marketplace/filter-panel";
import { ServiceCard } from "@/components/shared/service-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/app";
import { DIRECTION_MAP, DIRECTIONS_BY_CATEGORY } from "@/lib/constants";
import { fromPrice, serviceRegions } from "@/lib/pricing";
import { isPublic } from "@/lib/status";
import type { Service } from "@/lib/types";

const SORTS = [
  { value: "tavsiya", label: "Tavsiya etilgan" },
  { value: "reyting", label: "Reyting bo'yicha" },
  { value: "arzon", label: "Avval arzon" },
  { value: "qimmat", label: "Avval qimmat" },
  { value: "yangi", label: "Eng yangi" },
];

/** Narx solishtirish uchun: kelishuv asosidagilar oxiriga. */
const priceKey = (s: Service) =>
  s.priceType === "negotiable" ? Number.POSITIVE_INFINITY : fromPrice(s.regionPrices);

function sortServices(list: Service[], sort: string): Service[] {
  const arr = [...list];
  switch (sort) {
    case "reyting":
      return arr.sort((a, b) => b.rating - a.rating);
    case "arzon":
      return arr.sort((a, b) => priceKey(a) - priceKey(b));
    case "qimmat":
      return arr.sort((a, b) => {
        const pa = priceKey(a) === Infinity ? -1 : priceKey(a);
        const pb = priceKey(b) === Infinity ? -1 : priceKey(b);
        return pb - pa;
      });
    case "yangi":
      return arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    default:
      return arr.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
  }
}

function ServicesInner() {
  const params = useSearchParams();
  const services = useAppStore((s) => s.services);
  const providers = useAppStore((s) => s.providers);
  const [mobileFilters, setMobileFilters] = React.useState(false);

  const [filters, setFilters] = React.useState<Filters>(() => {
    const cat = params.get("kategoriya");
    const dir = params.get("yonalish");
    const dirsFromCat = cat ? (DIRECTIONS_BY_CATEGORY[cat] ?? []).map((d) => d.id) : [];
    return {
      ...DEFAULT_FILTERS,
      q: params.get("q") ?? "",
      region: params.get("viloyat") ?? "",
      directions: dir ? [dir] : dirsFromCat,
    };
  });

  const patch = (p: Partial<Filters>) => setFilters((f) => ({ ...f, ...p }));
  const reset = () => setFilters({ ...DEFAULT_FILTERS });

  const ownerOf = (s: Service) => {
    const p = providers.find((pr) => pr.id === s.providerId);
    if (!p) return {};
    return p.type === "organization" ? { orgName: p.name } : { providerName: p.name };
  };

  const filtered = React.useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const list = services.filter((s) => {
      if (!isPublic(s.status)) return false;
      if (q) {
        const dir = DIRECTION_MAP[s.directionId]?.name.toLowerCase() ?? "";
        if (!`${s.title} ${dir} ${s.region}`.toLowerCase().includes(q)) return false;
      }
      if (filters.region) {
        // hudud tanlangan bo'lsa: shu hududda mavjud bo'lishi kerak
        if (!serviceRegions(s.regionPrices).includes(filters.region)) return false;
      }
      if (filters.district && s.district !== filters.district) return false;
      if (filters.directions.length && !filters.directions.includes(s.directionId)) return false;
      // narx filtri faqat belgilangan narxlarga
      if (s.priceType === "fixed" && fromPrice(s.regionPrices) > filters.maxPrice) return false;
      if (filters.minRating && s.rating < filters.minRating) return false;
      return true;
    });
    return sortServices(list, filters.sort);
  }, [services, filters]);

  const activeChips: { label: string; clear: () => void }[] = [];
  if (filters.q) activeChips.push({ label: `"${filters.q}"`, clear: () => patch({ q: "" }) });
  if (filters.region) activeChips.push({ label: filters.region, clear: () => patch({ region: "", district: "" }) });
  if (filters.district) activeChips.push({ label: filters.district, clear: () => patch({ district: "" }) });
  filters.directions.forEach((d) =>
    activeChips.push({
      label: DIRECTION_MAP[d]?.name ?? d,
      clear: () => patch({ directions: filters.directions.filter((x) => x !== d) }),
    }),
  );
  if (filters.minRating) activeChips.push({ label: `${filters.minRating}+ reyting`, clear: () => patch({ minRating: 0 }) });

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground">{filtered.length} ta xizmat topildi</p>
        <Button asChild variant="outline">
          <Link href="/jamlanmalar"><Layers /> Jamlanmalar</Link>
        </Button>
      </div>

      {/* Qidiruv + saralash */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={filters.q}
            onChange={(e) => patch({ q: e.target.value })}
            placeholder="Xizmat nomi yoki yo'nalish bo'yicha qidirish…"
            className="h-11 w-full rounded-xl border border-input bg-surface pl-10 pr-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="lg:hidden" onClick={() => setMobileFilters((v) => !v)}>
            <SlidersHorizontal /> Filtrlar
          </Button>
          <Select value={filters.sort} onChange={(e) => patch({ sort: e.target.value })} className="w-48">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Faol filtr chiplari */}
      {activeChips.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {activeChips.map((chip, i) => (
            <button
              key={i}
              onClick={chip.clear}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary-100"
            >
              {chip.label} <X className="size-3.5" />
            </button>
          ))}
          <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground">
            Hammasini tozalash
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className={mobileFilters ? "block" : "hidden lg:block"}>
          <div className="lg:sticky lg:top-20">
            <FilterPanel value={filters} onChange={patch} onReset={reset} />
          </div>
        </aside>

        <div>
          {filtered.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="Xizmat topilmadi"
              description="Filtrlarni o'zgartirib ko'ring yoki tozalang."
              action={<Button onClick={reset}>Filtrlarni tozalash</Button>}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((s, i) => (
                <ServiceCard key={s.id} service={s} index={i} {...ownerOf(s)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <SiteShell>
      <PageBanner
        eyebrow="Marketplace"
        title="Xizmatlar"
        description="Mikrofon, kamera, sahna va artistlar — tadbiringiz uchun professional ijrochilarni toping."
        icons={["Mic", "Camera", "Theater", "Star"]}
      />
      <React.Suspense fallback={<div className="container-page py-16 text-center text-muted-foreground">Yuklanmoqda…</div>}>
        <ServicesInner />
      </React.Suspense>
    </SiteShell>
  );
}
