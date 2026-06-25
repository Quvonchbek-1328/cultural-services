"use client";
import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  CheckCircle2,
  PackageSearch,
  ShieldCheck,
  Loader2,
  Layers,
  Handshake,
  Check,
} from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { useAppStore } from "@/lib/store/app";
import { useAuthStore } from "@/lib/store/auth";
import { useHydrated } from "@/lib/store/hydrated";
import { packageRegions, packagePriceInRegion, packagePriceType, packageDiscountConfig } from "@/lib/pricing";
import { applyDiscount, NO_DISCOUNT } from "@/lib/discount";
import { isPublic } from "@/lib/status";
import { formatUZS, formatDate, cn } from "@/lib/utils";
import type { ItemKind } from "@/lib/types";

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const kindParam = params.get("kind");
  const addParam = params.get("add");
  const regionParam = params.get("region");
  const router = useRouter();
  const hydrated = useHydrated();
  const currentUser = useAuthStore((s) => s.currentUser);
  const services = useAppStore((s) => s.services);
  const packages = useAppStore((s) => s.packages);
  const providers = useAppStore((s) => s.providers);
  const createOrder = useAppStore((s) => s.createOrder);

  const getService = React.useCallback((sid: string) => services.find((s) => s.id === sid), [services]);

  const isPackage = kindParam === "package";
  const pkg = isPackage ? packages.find((p) => p.id === id) : undefined;
  const baseService = !isPackage ? services.find((s) => s.id === id) : undefined;

  const addIds = React.useMemo(
    () =>
      !isPackage && addParam
        ? addParam.split(",").filter((aid) => services.some((s) => s.id === aid && isPublic(s.status)))
        : [],
    [isPackage, addParam, services],
  );

  // Birlashtirilgan a'zo ro'yxati (xizmat / jamlanma / mijoz-jamlanmasi uchun bir xil)
  const memberIds = React.useMemo<string[]>(() => {
    if (isPackage) return pkg?.serviceIds ?? [];
    if (baseService) return [baseService.id, ...addIds];
    return [];
  }, [isPackage, pkg, baseService, addIds]);

  const isBundle = !isPackage && addIds.length > 0;
  const itemKind: ItemKind = isPackage || isBundle ? "package" : "service";

  const [region, setRegion] = React.useState("");
  const [eventDate, setEventDate] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [note, setNote] = React.useState("");
  const [done, setDone] = React.useState(false);

  const available = React.useMemo(() => packageRegions(memberIds, getService), [memberIds, getService]);
  const negotiable = memberIds.length > 0 && packagePriceType(memberIds, getService) === "negotiable";
  // Tasdiqlangan jamlanma chegirmasi buyurtma summasiga ham qo'llanadi
  // (mijoz tuzgan bundle/yakka xizmatga chegirma yo'q → NONE).
  const orderDiscount = pkg ? packageDiscountConfig(pkg) : NO_DISCOUNT;
  const priceFor = (r: string) => {
    const sum = packagePriceInRegion(memberIds, getService, r);
    return sum === undefined ? undefined : applyDiscount(sum, orderDiscount).final;
  };

  const item = isPackage ? pkg : baseService;
  const itemTitle = isPackage
    ? pkg?.title ?? ""
    : isBundle
      ? `${baseService?.title} + ${addIds.length} xizmat`
      : baseService?.title ?? "";
  const itemImage = (isPackage ? pkg?.images[0] : baseService?.images[0]) ?? getService(memberIds[0])?.images[0];
  const ownerId = (isPackage ? pkg?.providerId : baseService?.providerId) ?? "";
  const owner = providers.find((p) => p.id === ownerId);

  React.useEffect(() => {
    if (!region && available.length) {
      const pref = regionParam && available.includes(regionParam) ? regionParam : undefined;
      const home = currentUser && available.includes(currentUser.region) ? currentUser.region : undefined;
      setRegion(pref ?? home ?? available[0]);
    }
  }, [available, region, currentUser, regionParam]);

  React.useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) router.replace(`/kirish?keyin=${encodeURIComponent(`/buyurtma/${id}?${params.toString()}`)}`);
  }, [hydrated, currentUser, id, params, router]);

  if (!hydrated) {
    return (
      <SiteShell>
        <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </SiteShell>
    );
  }

  const itemOk = item && isPublic(item.status) && available.length > 0;
  if (!itemOk) {
    return (
      <SiteShell>
        <div className="container-page py-20">
          <EmptyState
            icon={PackageSearch}
            title={isPackage ? "Jamlanma topilmadi" : "Xizmat topilmadi"}
            description="Bunga buyurtma berib bo'lmaydi yoki umumiy hududlar mavjud emas."
            action={<Button asChild><Link href={isPackage ? "/jamlanmalar" : "/xizmatlar"}>Orqaga</Link></Button>}
          />
        </div>
      </SiteShell>
    );
  }

  if (currentUser && currentUser.role !== "user") {
    return (
      <SiteShell>
        <div className="container-page py-20">
          <EmptyState
            icon={ShieldCheck}
            title="Buyurtma faqat foydalanuvchilar uchun"
            description="Buyurtma berish uchun oddiy foydalanuvchi sifatida tizimga kiring."
            action={<Button asChild><Link href="/kirish">Foydalanuvchi sifatida kirish</Link></Button>}
          />
        </div>
      </SiteShell>
    );
  }

  const amount = negotiable ? 0 : priceFor(region) ?? 0;
  const valid = !!region && !!eventDate && address.trim().length > 3;
  const backHref = isPackage ? `/jamlanmalar/${id}` : `/xizmatlar/${id}`;
  const memberServices = memberIds.map(getService).filter(Boolean) as NonNullable<ReturnType<typeof getService>>[];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || !currentUser) return;
    createOrder({
      kind: itemKind,
      serviceId: id,
      serviceTitle: itemTitle,
      packageId: isPackage ? id : undefined,
      bundleServiceIds: isBundle ? memberIds : undefined,
      customerId: currentUser.id,
      customerName: currentUser.fullName,
      customerPhone: currentUser.phone,
      providerId: ownerId,
      eventDate,
      region,
      address: address.trim(),
      note: note.trim(),
      amount,
      priceType: negotiable ? "negotiable" : "fixed",
      negotiated: negotiable,
    });
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <SiteShell>
        <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
          <div className="w-full max-w-md rounded-2xl border border-border glass-strong p-8 text-center shadow-card">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[var(--color-success-bg)] text-success">
              <CheckCircle2 className="size-9" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold">So'rov yuborildi!</h1>
            <p className="mt-2 text-muted-foreground">
              So'rovingiz <span className="font-medium text-foreground">{owner?.name}</span> ga yuborildi.
              Tasdiqlangach sizga xabar beriladi. Holati: <span className="font-semibold text-warning">Kutilmoqda</span>.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild><Link href="/kabinet/foydalanuvchi/buyurtmalar">Buyurtmalarim</Link></Button>
              <Button asChild variant="outline"><Link href="/xizmatlar">Boshqa xizmatlar</Link></Button>
            </div>
          </div>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="container-page py-6">
        <Link href={backHref} className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Orqaga
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight">Mavjudligini so'rash</h1>
        <p className="mt-1 text-muted-foreground">Hudud va tadbir ma'lumotlarini to'ldiring.</p>

        <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {/* Hudud */}
            <section className="rounded-2xl border border-border bg-surface/60 p-5 shadow-soft backdrop-blur">
              <h2 className="font-semibold">Hududni tanlang</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {negotiable ? "Narx ijrochi bilan kelishiladi." : "Narx tanlangan hududga qarab belgilanadi."}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {available.map((r) => {
                  const p = priceFor(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRegion(r)}
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-3 text-left transition-all",
                        region === r ? "border-primary bg-primary-50 ring-1 ring-primary/40" : "border-border hover:bg-muted",
                      )}
                    >
                      <span className="text-sm font-medium">{r}</span>
                      <span className="font-display text-sm font-bold text-primary">{negotiable ? "—" : formatUZS(p ?? 0)}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Tadbir */}
            <section className="space-y-4 rounded-2xl border border-border bg-surface/60 p-5 shadow-soft backdrop-blur">
              <h2 className="font-semibold">Tadbir ma'lumotlari</h2>
              <div className="space-y-1.5">
                <Label htmlFor="date">Tadbir sanasi</Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Manzil</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Tuman, mahalla, ko'cha, uy" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="note">Izoh (ixtiyoriy)</Label>
                <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tadbir tafsilotlari, qo'shimcha talablar…" />
              </div>
            </section>
          </div>

          {/* Xulosa */}
          <aside>
            <div className="space-y-4 lg:sticky lg:top-20">
              <div className="rounded-2xl border border-border glass-strong p-5 shadow-card">
                <h2 className="font-semibold">Buyurtma xulosasi</h2>
                <div className="mt-4 flex items-center gap-3">
                  {itemImage ? (
                    <img src={itemImage} alt="" className="size-16 rounded-xl object-cover" />
                  ) : (
                    <div className="flex size-16 items-center justify-center rounded-xl bg-primary-50 text-primary"><Layers className="size-6" /></div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate font-medium">{itemTitle}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {itemKind === "package" ? (<><Layers className="size-3.5" /> Jamlanma</>) : "Xizmat"}
                    </div>
                  </div>
                </div>

                {memberServices.length > 1 && (
                  <ul className="mt-3 space-y-1 rounded-xl bg-white/[0.03] p-3">
                    {memberServices.map((m) => (
                      <li key={m.id} className="flex items-center gap-2 text-xs text-foreground/80">
                        <Check className="size-3.5 shrink-0 text-primary" /> {m.title}
                      </li>
                    ))}
                  </ul>
                )}

                {owner && (
                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
                    <Avatar src={owner.avatar} name={owner.name} size={36} />
                    <div className="text-sm">
                      <div className="font-medium">{owner.name}</div>
                      <div className="text-xs text-muted-foreground">{owner.type === "organization" ? "Tashkilot" : "Ijrochi"}</div>
                    </div>
                  </div>
                )}

                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Sana</dt>
                    <dd className="font-medium">{eventDate ? formatDate(eventDate) : "—"}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-muted-foreground">Hudud</dt>
                    <dd className="text-right font-medium"><span className="flex items-center justify-end gap-1"><MapPin className="size-3.5" /> {region || "—"}</span></dd>
                  </div>
                </dl>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-muted-foreground">Jami</span>
                  {negotiable ? (
                    <span className="flex items-center gap-1.5 font-display text-base font-bold text-foreground"><Handshake className="size-4 text-primary" /> Kelishiladi</span>
                  ) : (
                    <span className="font-display text-xl font-bold text-primary">{formatUZS(amount)}</span>
                  )}
                </div>

                <Button type="submit" size="lg" className="mt-4 w-full" disabled={!valid}>So'rovni yuborish</Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">So'rov taqdimotchiga yuboriladi.</p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </SiteShell>
  );
}
