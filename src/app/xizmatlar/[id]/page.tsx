"use client";
import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import {
  MapPin,
  Heart,
  ShieldCheck,
  ArrowLeft,
  Star,
  Building2,
  User,
  PackageSearch,
  GitCompare,
  Handshake,
  Tag,
  CalendarCheck,
  Check,
  Wallet,
  Percent,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { RatingBadge, Stars } from "@/components/shared/rating-badge";
import { ReviewCard } from "@/components/shared/review-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PackageBuilder } from "@/components/shared/package-builder";
import { useAppStore } from "@/lib/store/app";
import { useAuthStore } from "@/lib/store/auth";
import { useFavorites } from "@/lib/store/favorites";
import { useCompare } from "@/lib/store/compare";
import { useHydrated } from "@/lib/store/hydrated";
import { DIRECTION_MAP, DIRECTIONS, PRICE_TYPE_LABELS } from "@/lib/constants";
import { serviceRegions, priceInRegion, bundleDiscount } from "@/lib/pricing";
import { isPublic } from "@/lib/status";
import { formatUZS, cn } from "@/lib/utils";

/** Narxni eski qiymatdan yangisiga animatsiya bilan sanaydi (Price Count Animation). */
function CountUp({ value, className }: { value: number; className?: string }) {
  const count = useMotionValue(value);
  const text = useTransform(count, (v) => formatUZS(Math.round(v)));
  React.useEffect(() => {
    const controls = animate(count, value, { duration: 0.6, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);
  return <motion.span className={className}>{text}</motion.span>;
}

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const services = useAppStore((s) => s.services);
  const providers = useAppStore((s) => s.providers);
  const reviews = useAppStore((s) => s.reviews);
  const currentUser = useAuthStore((s) => s.currentUser);
  const { ids, toggle } = useFavorites();
  const compare = useCompare();
  const hydrated = useHydrated();

  const service = services.find((s) => s.id === id);
  const [activeImg, setActiveImg] = React.useState(0);
  const [region, setRegion] = React.useState("");
  // Jamlanma tanlovi: yo'nalish id -> tanlangan xizmat id. Asosiy yo'nalish doimo bor.
  const [selection, setSelection] = React.useState<Record<string, string>>({});

  // Xizmat o'zgarganda jamlanmani asosiy yo'nalish bilan tiklash
  React.useEffect(() => {
    setActiveImg(0);
    setRegion("");
    setSelection(service ? { [service.directionId]: service.id } : {});
  }, [id, service?.directionId]);

  const availableRegions = React.useMemo(
    () => (service ? serviceRegions(service.regionPrices) : []),
    [service],
  );

  React.useEffect(() => {
    if (!region && availableRegions.length) {
      const home = currentUser && availableRegions.includes(currentUser.region) ? currentUser.region : availableRegions[0];
      setRegion(home);
    }
  }, [availableRegions, region, currentUser]);

  // Hudud o'zgarsa, shu hududda mavjud bo'lmagan qo'shimcha tanlovlarni olib tashlash (asosiy saqlanadi)
  React.useEffect(() => {
    if (!service || !region) return;
    setSelection((cur) => {
      let changed = false;
      const next = { ...cur };
      for (const [dirId, sid] of Object.entries(cur)) {
        if (dirId === service.directionId) continue;
        const s = services.find((x) => x.id === sid);
        if (s && s.priceType !== "negotiable" && priceInRegion(s.regionPrices, region) === undefined) {
          delete next[dirId];
          changed = true;
        }
      }
      return changed ? next : cur;
    });
  }, [region, service, services]);

  if (!service || !isPublic(service.status)) {
    return (
      <SiteShell>
        <div className="container-page py-20">
          <EmptyState
            icon={PackageSearch}
            title="Xizmat topilmadi"
            description="Bu xizmat mavjud emas yoki hali administrator tomonidan tasdiqlanmagan."
            action={<Button asChild><Link href="/xizmatlar">Barcha xizmatlar</Link></Button>}
          />
        </div>
      </SiteShell>
    );
  }

  const dir = DIRECTION_MAP[service.directionId];
  const owner = providers.find((p) => p.id === service.providerId);
  const isOrg = owner?.type === "organization";
  const serviceReviews = reviews.filter((r) => r.serviceId === service.id && r.status === "visible");
  const avgRating =
    serviceReviews.length > 0
      ? serviceReviews.reduce((a, r) => a + r.rating, 0) / serviceReviews.length
      : service.rating;
  const fav = hydrated && ids.includes(service.id);
  const compared = hydrated && compare.has("service", service.id);
  const negotiable = service.priceType === "negotiable";

  const ownerServiceCount = services.filter((s) => s.providerId === service.providerId && isPublic(s.status)).length;

  // Konstruktor ma'lumotlari: tasdiqlangan xizmatlarni yo'nalish bo'yicha guruhlash
  const approved = services.filter((s) => isPublic(s.status));
  const byId: Record<string, typeof services[number]> = Object.fromEntries(approved.map((s) => [s.id, s]));
  const providersById = Object.fromEntries(providers.map((p) => [p.id, p]));
  const servicesByDirection: Record<string, typeof services> = {};
  for (const s of approved) (servicesByDirection[s.directionId] ??= []).push(s);
  // Har yo'nalish ichida: yuqori reytingli avval, asosiy xizmat birinchi
  for (const list of Object.values(servicesByDirection)) {
    list.sort((a, b) => (a.id === service.id ? -1 : b.id === service.id ? 1 : b.rating - a.rating));
  }
  const baseDirId = service.directionId;
  const directionOrder = [
    baseDirId,
    ...DIRECTIONS.map((d) => d.id).filter((dId) => dId !== baseDirId && (servicesByDirection[dId]?.length ?? 0) > 0),
  ];

  // Jonli jami narx tanlangan hudud bo'yicha
  const selectedServices = Object.values(selection)
    .map((sid) => byId[sid])
    .filter(Boolean) as typeof services;
  const total = selectedServices.reduce(
    (sum, s) => (s.priceType === "negotiable" ? sum : sum + (priceInRegion(s.regionPrices, region) ?? 0)),
    0,
  );
  const hasNegotiableSelected = selectedServices.some((s) => s.priceType === "negotiable");
  const pricedCount = selectedServices.filter((s) => s.priceType !== "negotiable").length;
  const discount = bundleDiscount(total, pricedCount);

  function selectService(dirId: string, serviceId: string | null) {
    setSelection((cur) => {
      const next = { ...cur };
      if (serviceId === null) {
        if (dirId !== baseDirId) delete next[dirId];
      } else {
        next[dirId] = serviceId;
      }
      return next;
    });
  }

  function requestAvailability() {
    const primaryId = selection[baseDirId] ?? service!.id;
    const others = selectedServices.filter((s) => s.id !== primaryId).map((s) => s.id);
    const q = new URLSearchParams();
    if (region) q.set("region", region);
    if (others.length) {
      q.set("kind", "bundle");
      q.set("add", others.join(","));
    }
    const href = `/buyurtma/${primaryId}?${q.toString()}`;
    if (hydrated && currentUser?.role === "user") router.push(href);
    else router.push(`/kirish?keyin=${encodeURIComponent(href)}`);
  }

  return (
    <SiteShell>
      <div className="container-page py-6">
        <Link href="/xizmatlar" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Xizmatlarga qaytish
        </Link>

        {/* ===== Sarlavha ===== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary-50/40 px-3 py-1 text-xs font-semibold text-secondary">
            <PartyPopper className="size-3.5" /> Tadbir paketi konstruktori
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            Konsert va Tomoshalar Buyurtmasi
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Kerakli xizmatlarni tanlang va o&apos;zingizning tadbir paketingizni yarating. Narxlar tanlangan hududga qarab avtomatik yangilanadi.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* ===== LEFT — Tadbir paketi konstruktori (sahifaning asosiy elementi) ===== */}
          <div className="min-w-0 space-y-8 lg:col-start-1 lg:row-start-1">
            <PackageBuilder
              baseDirId={baseDirId}
              directionOrder={directionOrder}
              servicesByDirection={servicesByDirection}
              providersById={providersById}
              region={region}
              regionOptions={availableRegions}
              onRegionChange={setRegion}
              selection={selection}
              onSelect={selectService}
              discount={discount}
              selectedCount={selectedServices.length}
            />

            {/* Tanlangan asosiy xizmat tafsilotlari (ikkilamchi) */}
            <section className="space-y-6 rounded-3xl border border-border bg-surface/40 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Sparkles className="size-4 text-secondary" /> Tanlangan asosiy xizmat
              </div>
            {/* Galereya */}
            <div className="overflow-hidden rounded-3xl border border-border bg-surface/60 shadow-card backdrop-blur">
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img src={service.images[activeImg]} alt={service.title} className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <button
                  onClick={() => toggle(service.id)}
                  className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full glass-strong text-foreground transition-colors hover:text-danger"
                  aria-label="Sevimlilar"
                >
                  <Heart className={cn("size-5", fav && "fill-danger text-danger")} />
                </button>
              </div>
              {service.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-3 scrollbar-none">
                  {service.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={cn(
                        "h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                        activeImg === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100",
                      )}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sarlavha + meta */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">{dir?.name}</Badge>
                <Badge variant={negotiable ? "neutral" : "secondary"}>
                  {negotiable ? <Handshake className="mr-1 size-3.5" /> : <Tag className="mr-1 size-3.5" />}
                  {PRICE_TYPE_LABELS[service.priceType]}
                </Badge>
                {service.featured && <Badge variant="accent">Tavsiya etilgan</Badge>}
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{service.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="size-4" /> {service.region}{service.district ? `, ${service.district}` : ""}</span>
                <RatingBadge rating={avgRating} reviewCount={serviceReviews.length} />
              </div>
            </div>

            {/* Taqdimotchi profili */}
            {owner && (
              <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface/60 p-5 shadow-soft backdrop-blur sm:flex-row sm:items-center">
                <Avatar src={owner.avatar} name={owner.name} size={64} ring />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg font-semibold text-foreground">{owner.name}</span>
                    {owner.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary-50 px-2 py-0.5 text-xs font-semibold text-secondary">
                        <ShieldCheck className="size-3.5" /> Tasdiqlangan
                      </span>
                    )}
                    <Badge variant={isOrg ? "secondary" : "default"}>
                      {isOrg ? <Building2 className="mr-1 size-3" /> : <User className="mr-1 size-3" />}
                      {isOrg ? "Tashkilot" : "Individual ijrochi"}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                      <Star className="size-4 fill-accent text-accent" /> {owner.rating.toFixed(1)}
                    </span>
                    <span>{ownerServiceCount} ta xizmat</span>
                    {isOrg && owner.responsiblePerson && <span>Mas'ul: {owner.responsiblePerson}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Tavsif */}
            <section>
              <h2 className="font-display text-xl font-semibold">Tavsif</h2>
              <p className="mt-3 leading-relaxed text-foreground/80">{service.description}</p>
            </section>


            {/* Sharhlar */}
            <section>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">Sharhlar ({serviceReviews.length})</h2>
                {serviceReviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Stars rating={avgRating} />
                    <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              {serviceReviews.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-dashed border-border bg-surface/40 p-6 text-center text-sm text-muted-foreground">
                  Hozircha sharhlar yo'q. Birinchi bo'lib sharh qoldiring!
                </p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {serviceReviews.map((r) => (
                    <ReviewCard key={r.id} review={r} />
                  ))}
                </div>
              )}
            </section>
            </section>
          </div>

          {/* ===== RIGHT — Sticky paket xulosasi (Summary) ===== */}
          <aside className="lg:col-start-2 lg:row-start-1">
            <div className="lg:sticky lg:top-20">
              <motion.div layout className="overflow-hidden rounded-3xl border border-border glass-strong shadow-card card-hover">
                <div className="border-b border-border bg-gradient-to-br from-secondary-50/50 to-transparent p-5">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-secondary/15 text-secondary"><Wallet className="size-4" /></span>
                    Sizning paketingiz
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  {/* Tanlangan hudud */}
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Tanlangan hudud</div>
                    <div className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1 text-sm font-semibold text-foreground">
                      <MapPin className="size-4 text-secondary" /> {region || "—"}
                    </div>
                  </div>

                  {/* Tanlangan xizmatlar — checklist */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      <span>Tanlangan xizmatlar</span>
                      <span>{selectedServices.length} ta</span>
                    </div>
                    <ul className="mt-2 space-y-1.5">
                      <AnimatePresence initial={false}>
                        {selectedServices.map((s) => {
                          const p = s.priceType === "negotiable" ? undefined : priceInRegion(s.regionPrices, region);
                          return (
                            <motion.li
                              key={s.id}
                              layout
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center justify-between gap-2 text-sm"
                            >
                              <span className="inline-flex min-w-0 items-center gap-2">
                                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-secondary text-white"><Check className="size-2.5" /></span>
                                <span className="truncate text-foreground">{DIRECTION_MAP[s.directionId]?.name ?? s.title}</span>
                              </span>
                              <span className="shrink-0 text-xs font-medium text-muted-foreground">{p === undefined ? "Kelishiladi" : formatUZS(p)}</span>
                            </motion.li>
                          );
                        })}
                      </AnimatePresence>
                    </ul>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Narx taqsimoti */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Alohida narxlar yig&apos;indisi</span>
                      <CountUp value={discount.original} className="font-semibold text-foreground" />
                    </div>
                    <AnimatePresence initial={false}>
                      {discount.qualifies && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="flex items-center justify-between overflow-hidden text-secondary"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <Percent className="size-3.5" /> Jamlanma chegirmasi
                            <span className="rounded-full bg-secondary-50 px-1.5 py-0.5 text-[11px] font-bold">{Math.round(discount.rate * 100)}%</span>
                          </span>
                          <span className="font-semibold">−{formatUZS(discount.saved)}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Yakuniy narx */}
                  <div className="flex items-end justify-between">
                    <span className="text-sm text-muted-foreground">Yakuniy narx</span>
                    <CountUp value={discount.final} className="font-display text-2xl font-bold text-primary" />
                  </div>
                  {hasNegotiableSelected && (
                    <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Handshake className="size-3.5" /> Ba&apos;zi xizmatlar narxi kelishiladi
                    </p>
                  )}

                  {/* Siz tejaysiz */}
                  <AnimatePresence initial={false}>
                    {discount.qualifies && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden rounded-xl border border-secondary/30 bg-secondary-50/30 p-3"
                      >
                        <div className="flex items-center justify-between text-sm font-bold text-secondary">
                          <span className="inline-flex items-center gap-1.5"><PartyPopper className="size-4" /> Siz tejaysiz</span>
                          <span>{formatUZS(discount.saved)}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button onClick={requestAvailability} size="lg" className="w-full">
                    <CalendarCheck /> Bandlikni so&apos;rash
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => toggle(service.id)} className="flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium transition-colors hover:bg-muted">
                      <Heart className={cn("size-4", fav && "fill-danger text-danger")} /> {fav ? "Saqlangan" : "Saqlash"}
                    </button>
                    <button onClick={() => compare.toggle("service", service.id)} className={cn("flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors", compared ? "border-primary bg-primary-50 text-primary" : "border-border hover:bg-muted")}>
                      <GitCompare className="size-4" /> {compared ? "Qo'shildi" : "Solishtirish"}
                    </button>
                  </div>

                  <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="size-3.5 text-primary" /> Tasdiqlangan xizmat · xavfsiz buyurtma
                  </p>
                </div>
              </motion.div>
            </div>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}
