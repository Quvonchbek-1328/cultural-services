"use client";
import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Layers,
  ShieldCheck,
  Building2,
  Star,
  PackageSearch,
  GitCompare,
  Handshake,
  Check,
  ChevronRight,
} from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { RatingBadge } from "@/components/shared/rating-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useAppStore } from "@/lib/store/app";
import { useAuthStore } from "@/lib/store/auth";
import { useCompare } from "@/lib/store/compare";
import { useHydrated } from "@/lib/store/hydrated";
import { DIRECTION_MAP } from "@/lib/constants";
import {
  packageRegions,
  packagePriceInRegion,
  packageFromPrice,
  packageFinalFromPrice,
  packageDiscountConfig,
  packagePriceType,
  fromPrice,
} from "@/lib/pricing";
import { applyDiscount } from "@/lib/discount";
import { isPublic } from "@/lib/status";
import { formatUZS, cn } from "@/lib/utils";

export default function PackageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const packages = useAppStore((s) => s.packages);
  const services = useAppStore((s) => s.services);
  const providers = useAppStore((s) => s.providers);
  const currentUser = useAuthStore((s) => s.currentUser);
  const compare = useCompare();
  const hydrated = useHydrated();

  const getService = React.useCallback(
    (sid: string) => services.find((s) => s.id === sid),
    [services],
  );

  const pkg = packages.find((p) => p.id === id);

  if (!pkg || !isPublic(pkg.status)) {
    return (
      <SiteShell>
        <div className="container-page py-20">
          <EmptyState
            icon={PackageSearch}
            title="Jamlanma topilmadi"
            description="Bu jamlanma mavjud emas yoki hali administrator tomonidan tasdiqlanmagan."
            action={<Button asChild><Link href="/jamlanmalar">Barcha jamlanmalar</Link></Button>}
          />
        </div>
      </SiteShell>
    );
  }

  const owner = providers.find((p) => p.id === pkg.providerId);
  const isOrg = owner?.type === "organization";
  const members = pkg.serviceIds.map(getService).filter(Boolean) as NonNullable<ReturnType<typeof getService>>[];
  const regions = packageRegions(pkg.serviceIds, getService);
  const negotiable = packagePriceType(pkg.serviceIds, getService) === "negotiable";
  const min = packageFromPrice(pkg.serviceIds, getService);
  const cfg = packageDiscountConfig(pkg);
  const finalMin = packageFinalFromPrice(pkg.serviceIds, getService, cfg);
  const hasDiscount = !negotiable && cfg.type !== "NONE" && finalMin < min;
  const savedMin = min - finalMin;
  const compared = hydrated && compare.has("package", pkg.id);
  const image = pkg.images[0] ?? members[0]?.images[0];

  function book() {
    const href = `/buyurtma/${pkg!.id}?kind=package`;
    if (hydrated && currentUser?.role === "user") router.push(href);
    else router.push(`/kirish?keyin=${encodeURIComponent(href)}`);
  }

  return (
    <SiteShell>
      <div className="container-page py-6">
        <Link href="/jamlanmalar" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Jamlanmalarga qaytish
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Chap ustun */}
          <div>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                {image ? (
                  <img src={image} alt={pkg.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-primary">
                    <Layers className="size-12" />
                  </div>
                )}
                <Badge className="absolute left-4 top-4 bg-accent text-accent-foreground" variant="accent">
                  <Layers className="mr-1 size-3.5" /> Jamlanma
                </Badge>
              </div>
            </div>

            <div className="mt-6">
              <h1 className="font-display text-3xl font-bold tracking-tight">{pkg.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Layers className="size-4" /> {members.length} ta xizmat</span>
                <RatingBadge rating={pkg.rating || 0} reviewCount={pkg.reviewCount} />
              </div>
              <p className="mt-3 leading-relaxed text-foreground/80">{pkg.description}</p>
            </div>

            {/* Tarkibiy xizmatlar */}
            <section className="mt-8">
              <h2 className="font-display text-xl font-semibold">To'plam tarkibi</h2>
              <div className="mt-3 space-y-3">
                {members.map((m) => {
                  const dir = DIRECTION_MAP[m.directionId];
                  const mNegotiable = m.priceType === "negotiable";
                  return (
                    <Link
                      key={m.id}
                      href={`/xizmatlar/${m.id}`}
                      className="card-hover flex items-center gap-4 rounded-2xl border border-border bg-surface p-3 shadow-soft"
                    >
                      <img src={m.images[0]} alt={m.title} className="size-16 shrink-0 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">{dir?.name ?? "Xizmat"}</Badge>
                        </div>
                        <h3 className="mt-1 line-clamp-1 font-semibold text-foreground">{m.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {mNegotiable ? "Kelishuv asosida" : `${formatUZS(fromPrice(m.regionPrices))} dan`}
                        </p>
                      </div>
                      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Hudud bo'yicha to'plam narxi */}
            <section className="mt-8">
              <h2 className="font-display text-xl font-semibold">Hudud bo'yicha to'plam narxi</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                To'plam narxi tarkibidagi xizmatlar yig'indisidan iborat. To'plam barcha
                xizmatlar mavjud bo'lgan hududlardagina buyurtma qilinadi.
              </p>
              {regions.length === 0 ? (
                <p className="mt-3 rounded-2xl border border-dashed border-border bg-surface/60 p-6 text-center text-sm text-muted-foreground">
                  Hozircha umumiy hudud yo'q — tarkibiy xizmatlar turli hududlarda.
                </p>
              ) : negotiable ? (
                <div className="mt-3 flex items-start gap-3 rounded-2xl border border-border bg-surface p-5 shadow-soft">
                  <Handshake className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Narx kelishuv asosida</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {regions.map((r) => (
                        <span key={r} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-2.5 font-semibold">Hudud</th>
                        <th className="px-4 py-2.5 text-right font-semibold">To'plam narxi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regions
                        .map((r) => ({ r, bd: applyDiscount(packagePriceInRegion(pkg.serviceIds, getService, r) ?? 0, cfg) }))
                        .sort((a, b) => a.bd.final - b.bd.final)
                        .map(({ r, bd }) => (
                          <tr key={r} className="border-b border-border last:border-0">
                            <td className="px-4 py-2.5">{r}</td>
                            <td className="px-4 py-2.5 text-right">
                              {bd.discount > 0 ? (
                                <span className="inline-flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground line-through">{formatUZS(bd.original)}</span>
                                  <span className="font-display font-semibold text-success">{formatUZS(bd.final)}</span>
                                </span>
                              ) : (
                                <span className="font-display font-semibold text-primary">{formatUZS(bd.final)}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          {/* O'ng sticky panel */}
          <aside>
            <div className="space-y-4 lg:sticky lg:top-20">
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
                <div className="text-sm text-muted-foreground">To'plam narxi</div>
                {negotiable ? (
                  <div className="font-display text-3xl font-bold text-primary">Kelishuv asosida</div>
                ) : hasDiscount ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base text-muted-foreground line-through">{formatUZS(min)}</span>
                      <span className="rounded-md bg-success-bg px-2 py-0.5 text-xs font-bold text-success">
                        {cfg.type === "PERCENTAGE" ? `−${cfg.value}%` : "Chegirma"}
                      </span>
                    </div>
                    <div className="font-display text-3xl font-bold text-success">{formatUZS(finalMin)} dan</div>
                    <div className="text-xs font-semibold text-success">{formatUZS(savedMin)} tejaysiz</div>
                  </div>
                ) : (
                  <div className="font-display text-3xl font-bold text-primary">{formatUZS(min)} dan</div>
                )}
                <ul className="mt-3 space-y-1.5">
                  {members.map((m) => (
                    <li key={m.id} className="flex items-center gap-2 text-sm text-foreground/80">
                      <Check className="size-4 shrink-0 text-primary" /> {m.title}
                    </li>
                  ))}
                </ul>
                <Button onClick={book} size="lg" className="mt-4 w-full" disabled={regions.length === 0}>
                  Jamlanmani buyurtma qilish
                </Button>
                <button
                  onClick={() => compare.toggle("package", pkg.id)}
                  className={cn(
                    "mt-2 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors",
                    compared ? "border-primary bg-primary-50 text-primary" : "border-border hover:bg-muted",
                  )}
                >
                  <GitCompare className="size-4" /> {compared ? "Solishtirishda" : "Solishtirish"}
                </button>
              </div>

              {owner && (
                <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {isOrg ? "Tashkilot" : "Taqdimotchi"}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Avatar src={owner.avatar} name={owner.name} size={48} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-semibold">{owner.name}</span>
                        {owner.verified && <ShieldCheck className="size-4 shrink-0 text-secondary" />}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {isOrg ? <Building2 className="size-3.5" /> : <Star className="size-3.5 fill-accent text-accent" />}
                        {owner.rating.toFixed(1)} reyting
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}
