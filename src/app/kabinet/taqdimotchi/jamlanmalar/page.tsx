"use client";
import * as React from "react";
import { Plus, Pencil, Trash2, Layers, AlertTriangle, Check, Info, Send } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PageBanner } from "@/components/shared/page-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input, Textarea, Label } from "@/components/ui/input";
import { ServiceStatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuthStore } from "@/lib/store/auth";
import { useAppStore } from "@/lib/store/app";
import { DIRECTION_MAP } from "@/lib/constants";
import { packageRegions, packageFromPrice, packageFinalFromPrice, packageDiscountConfig, packagePriceType, fromPrice } from "@/lib/pricing";
import { applyDiscount, DISCOUNT_TYPE_LABEL, type DiscountType } from "@/lib/discount";
import { isPublic, isRejected, isEditable } from "@/lib/status";
import { formatUZS, cn } from "@/lib/utils";
import type { ServicePackage, Role } from "@/lib/types";
import { AuditTimeline } from "@/components/shared/audit-timeline";

interface FormState {
  title: string;
  description: string;
  serviceIds: string[];
  discountType: DiscountType;
  discountValue: number;
}

const EMPTY: FormState = { title: "", description: "", serviceIds: [], discountType: "NONE", discountValue: 0 };

export default function TaqdimotchiJamlanmalarPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const providers = useAppStore((s) => s.providers);
  const services = useAppStore((s) => s.services);
  const packages = useAppStore((s) => s.packages);
  const addPackage = useAppStore((s) => s.addPackage);
  const updatePackage = useAppStore((s) => s.updatePackage);
  const deletePackage = useAppStore((s) => s.deletePackage);

  const submitPackage = useAppStore((s) => s.submitPackage);
  const me = providers.find((p) => p.id === currentUser?.providerId);
  const actor = { name: currentUser?.fullName ?? "", role: (currentUser?.role ?? "provider") as Role };
  const getService = React.useCallback((id: string) => services.find((s) => s.id === id), [services]);

  const myPackages = React.useMemo(() => (me ? packages.filter((p) => p.providerId === me.id) : []), [packages, me]);
  const myApprovedServices = React.useMemo(
    () => (me ? services.filter((s) => s.providerId === me.id && isPublic(s.status)) : []),
    [services, me],
  );

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<ServicePackage | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ServicePackage | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY);

  if (!currentUser || !me) {
    return (
      <>
        <PageBanner
          variant="card"
          eyebrow="To'plamlar"
          title="Jamlanmalar"
          description="Bir nechta xizmatni yagona paketga birlashtiring va boshqaring."
          icons={["Layers", "Mic", "Music"]}
        />
        <EmptyState icon={Layers} title="Profil topilmadi" description="Hisobingizga bog'langan taqdimotchi profili mavjud emas." />
      </>
    );
  }

  const openCreate = () => { setForm(EMPTY); setCreateOpen(true); };
  const openEdit = (pkg: ServicePackage) => {
    setForm({
      title: pkg.title,
      description: pkg.description,
      serviceIds: [...pkg.serviceIds],
      discountType: pkg.discountType ?? "NONE",
      discountValue: pkg.discountValue ?? 0,
    });
    setEditTarget(pkg);
  };

  const toggleService = (id: string) =>
    setForm((f) => ({
      ...f,
      serviceIds: f.serviceIds.includes(id) ? f.serviceIds.filter((x) => x !== id) : [...f.serviceIds, id],
    }));

  // Jonli ko'rinish
  const previewRegions = packageRegions(form.serviceIds, getService);
  const previewNegotiable = packagePriceType(form.serviceIds, getService) === "negotiable";
  const previewMin = packageFromPrice(form.serviceIds, getService);
  // Kelishuv asosidagi xizmat tanlansa narx hisoblanmaydi — chegirma o'chiriladi.
  const discountAllowed = !previewNegotiable && form.serviceIds.length >= 2 && previewRegions.length > 0;
  const effectiveDiscount = discountAllowed
    ? { type: form.discountType, value: form.discountValue }
    : { type: "NONE" as DiscountType, value: 0 };
  // Eng arzon hudud yig'indisiga chegirma — real-time taqsimot.
  const breakdown = applyDiscount(previewMin, effectiveDiscount);
  const discountValid =
    !discountAllowed ||
    form.discountType === "NONE" ||
    (form.discountType === "PERCENTAGE" && form.discountValue >= 1 && form.discountValue <= 100) ||
    (form.discountType === "FIXED_AMOUNT" && form.discountValue > 0 && form.discountValue <= previewMin);
  const formValid =
    form.title.trim().length > 0 && form.serviceIds.length >= 2 && previewRegions.length > 0 && discountValid;

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;
    addPackage({
      title: form.title.trim(),
      providerId: me.id,
      performerId: me.type === "individual" ? me.id : undefined,
      serviceIds: form.serviceIds,
      description: form.description.trim(),
      images: getService(form.serviceIds[0])?.images.slice(0, 1) ?? [],
      discountType: effectiveDiscount.type,
      discountValue: effectiveDiscount.value,
    });
    setCreateOpen(false);
  };
  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !formValid) return;
    updatePackage(editTarget.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      serviceIds: form.serviceIds,
      discountType: effectiveDiscount.type,
      discountValue: effectiveDiscount.value,
    });
    setEditTarget(null);
  };

  const renderBuilder = (onSubmit: (e: React.FormEvent) => void) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="pkg-title">Jamlanma nomi</Label>
        <Input id="pkg-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Masalan: Premium To'y to'plami" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pkg-desc">Tavsif</Label>
        <Textarea id="pkg-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="To'plam haqida qisqacha…" maxLength={400} />
      </div>

      <div className="space-y-1.5">
        <Label>Xizmatlarni tanlang (kamida 2 ta)</Label>
        {myApprovedServices.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
            Jamlanma tuzish uchun avval tasdiqlangan xizmatlaringiz bo'lishi kerak.
          </p>
        ) : (
          <div className="max-h-60 space-y-2 overflow-y-auto rounded-xl border border-border p-2">
            {myApprovedServices.map((s) => {
              const picked = form.serviceIds.includes(s.id);
              const dir = DIRECTION_MAP[s.directionId];
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleService(s.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all",
                    picked ? "border-primary bg-primary-50 ring-1 ring-primary" : "border-border hover:bg-muted",
                  )}
                >
                  <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-md border", picked ? "border-primary bg-primary text-white" : "border-input bg-surface")}>
                    {picked && <Check className="size-3.5" />}
                  </span>
                  <img src={s.images[0]} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{s.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {dir?.name} · {s.priceType === "negotiable" ? "Kelishuv asosida" : `${formatUZS(fromPrice(s.regionPrices))} dan`}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Chegirma sozlamalari — tanlangan xizmatlarga qo'llanadi */}
      <div className="space-y-2">
        <Label>Chegirma</Label>
        <div className="grid grid-cols-3 gap-2">
          {(["NONE", "PERCENTAGE", "FIXED_AMOUNT"] as DiscountType[]).map((t) => {
            const disabled = !discountAllowed && t !== "NONE";
            return (
              <button
                key={t}
                type="button"
                disabled={disabled}
                onClick={() => setForm((f) => ({ ...f, discountType: t, discountValue: 0 }))}
                className={cn(
                  "rounded-xl border px-3 py-2 text-xs font-semibold transition-all sm:text-sm",
                  form.discountType === t
                    ? "border-primary bg-primary-50 text-primary ring-1 ring-primary"
                    : "border-border hover:bg-muted",
                  disabled && "cursor-not-allowed opacity-40",
                )}
              >
                {DISCOUNT_TYPE_LABEL[t]}
              </button>
            );
          })}
        </div>

        {discountAllowed && form.discountType === "PERCENTAGE" && (
          <div className="space-y-1.5">
            <Label htmlFor="disc-pct">Chegirma foizi (%)</Label>
            <Input
              id="disc-pct"
              type="number"
              min={1}
              max={100}
              value={form.discountValue || ""}
              onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))}
              placeholder="Masalan: 10"
            />
            {form.discountValue > 0 && (form.discountValue < 1 || form.discountValue > 100) && (
              <p className="text-xs text-danger">Foiz 1% dan 100% gacha bo'lishi kerak.</p>
            )}
          </div>
        )}

        {discountAllowed && form.discountType === "FIXED_AMOUNT" && (
          <div className="space-y-1.5">
            <Label htmlFor="disc-amt">Chegirma summasi (so'm)</Label>
            <Input
              id="disc-amt"
              type="number"
              min={0}
              value={form.discountValue || ""}
              onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))}
              placeholder="Masalan: 500000"
            />
            {form.discountValue > previewMin && previewMin > 0 && (
              <p className="text-xs text-danger">
                Chegirma jami narxdan ({formatUZS(previewMin)}) oshmasligi kerak.
              </p>
            )}
          </div>
        )}

        {previewNegotiable && form.serviceIds.length >= 2 && (
          <p className="text-xs text-muted-foreground">
            Kelishuv asosidagi xizmat tanlangani uchun chegirma qo&apos;llanmaydi.
          </p>
        )}
      </div>

      {/* Real-time narx bloki */}
      <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
        <div className="font-medium text-foreground">{form.serviceIds.length} ta xizmat tanlandi</div>
        {form.serviceIds.length < 2 ? (
          <p className="mt-1 text-xs text-muted-foreground">Kamida 2 ta xizmat tanlang.</p>
        ) : previewRegions.length === 0 ? (
          <p className="mt-1 text-xs text-danger">Tanlangan xizmatlarda umumiy hudud yo&apos;q — to&apos;plam tuzib bo&apos;lmaydi.</p>
        ) : previewNegotiable ? (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-muted-foreground">Yakuniy narx</span>
            <span className="font-display font-bold text-primary">Kelishuv asosida</span>
          </div>
        ) : (
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Jami narx</span>
              <span className={cn("font-display font-semibold text-foreground", breakdown.discount > 0 && "text-muted-foreground")}>
                {formatUZS(breakdown.original)}
              </span>
            </div>
            {breakdown.discount > 0 && (
              <div className="flex items-center justify-between font-medium text-danger">
                <span>Chegirma{form.discountType === "PERCENTAGE" ? ` (${form.discountValue}%)` : ""}</span>
                <span className="font-display">&minus;{formatUZS(breakdown.discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="font-semibold text-foreground">Yakuniy narx</span>
              <span className="font-display text-lg font-bold text-success">{formatUZS(breakdown.final)}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Eng arzon hudud bo&apos;yicha. Mavjud hududlar: {previewRegions.slice(0, 5).join(", ")}
              {previewRegions.length > 5 ? "…" : ""}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-[var(--color-info-bg)]/60 p-3 text-sm text-[var(--color-info)]">
        <Info className="mt-0.5 size-4 shrink-0" />
        <span>Jamlanma narxi tanlangan xizmatlar yig'indisidan avtomatik hisoblanadi va administrator tasdig'idan keyin ko'rinadi.</span>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={() => { setCreateOpen(false); setEditTarget(null); }}>Bekor qilish</Button>
        <Button type="submit" disabled={!formValid}>Saqlash</Button>
      </div>
    </form>
  );

  return (
    <div>
      <PageHeader
        title="Jamlanmalar"
        description="Bir nechta xizmatni yagona to'plamga birlashtiring."
        actions={<Button onClick={openCreate} disabled={myApprovedServices.length < 2}><Plus /> Yangi jamlanma</Button>}
      />

      {myApprovedServices.length < 2 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] p-4">
          <AlertTriangle className="size-5 shrink-0 text-[var(--color-warning)]" />
          <p className="text-sm text-foreground/90">Jamlanma tuzish uchun kamida 2 ta tasdiqlangan xizmatingiz bo'lishi kerak.</p>
        </div>
      )}

      {myPackages.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Hali jamlanmalaringiz yo'q"
          description="Tasdiqlangan xizmatlaringizdan tayyor to'plam tuzing — mijozlar uchun qulayroq."
          action={myApprovedServices.length >= 2 ? <Button onClick={openCreate}><Plus /> Yangi jamlanma</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {myPackages.map((pkg) => {
            const regions = packageRegions(pkg.serviceIds, getService);
            const negotiable = packagePriceType(pkg.serviceIds, getService) === "negotiable";
            const cfg = packageDiscountConfig(pkg);
            const origFrom = packageFromPrice(pkg.serviceIds, getService);
            const finalFrom = packageFinalFromPrice(pkg.serviceIds, getService, cfg);
            const hasDiscount = !negotiable && cfg.type !== "NONE" && finalFrom < origFrom;
            return (
              <Card key={pkg.id} className="flex flex-col">
                <CardContent className="flex flex-1 flex-col space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="accent"><Layers className="mr-1 size-3.5" /> Jamlanma</Badge>
                    <ServiceStatusBadge status={pkg.status} />
                  </div>
                  <h3 className="line-clamp-1 font-semibold text-foreground">{pkg.title}</h3>
                  <ul className="space-y-1">
                    {pkg.serviceIds.map((sid) => (
                      <li key={sid} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Check className="size-3.5 shrink-0 text-primary" /> {getService(sid)?.title ?? "Xizmat"}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto border-t border-border pt-3">
                    <div className="text-[11px] text-muted-foreground">To'plam narxi · {regions.length} hudud</div>
                    {negotiable ? (
                      <div className="font-display font-bold text-primary">Kelishuv asosida</div>
                    ) : hasDiscount ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-muted-foreground line-through">{formatUZS(origFrom)}</span>
                        <span className="font-display font-bold text-success">{formatUZS(finalFrom)} dan</span>
                        <span className="rounded-md bg-success-bg px-1.5 py-0.5 text-[10px] font-bold text-success">
                          {cfg.type === "PERCENTAGE" ? `−${cfg.value}%` : "chegirma"}
                        </span>
                      </div>
                    ) : (
                      <div className="font-display font-bold text-primary">{formatUZS(origFrom)} dan</div>
                    )}
                  </div>
                  {isRejected(pkg.status) && pkg.rejectionReason && (
                    <div className="flex items-start gap-2 rounded-xl bg-[var(--color-danger-bg)]/60 p-3 text-sm text-[var(--color-danger)]">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                      <p>{pkg.rejectionReason}</p>
                    </div>
                  )}
                  <AuditTimeline entityType="package" entityId={pkg.id} />
                  {isEditable(pkg.status) && (
                    <Button size="sm" className="w-full" onClick={() => submitPackage(pkg.id, actor)}>
                      <Send /> Tasdiqlashga yuborish
                    </Button>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(pkg)}><Pencil /> Tahrirlash</Button>
                    <Button variant="ghost" size="sm" className="text-danger hover:bg-[var(--color-danger-bg)]" onClick={() => setDeleteTarget(pkg)}><Trash2 /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Yangi jamlanma" description="Xizmatlarni tanlang — narx avtomatik hisoblanadi.">
        {renderBuilder(submitCreate)}
      </Dialog>
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} title="Jamlanmani tahrirlash" description="Tarkibni o'zgartiring.">
        {renderBuilder(submitEdit)}
      </Dialog>
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Jamlanmani o'chirish">
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground"><strong className="text-foreground">{deleteTarget?.title}</strong> jamlanmasini o'chirmoqchimisiz?</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Bekor qilish</Button>
            <Button variant="danger" onClick={() => { if (deleteTarget) deletePackage(deleteTarget.id); setDeleteTarget(null); }}><Trash2 /> O'chirish</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
