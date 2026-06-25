"use client";
import * as React from "react";
import { Plus, Pencil, Trash2, MapPin, Info, AlertTriangle, LayoutGrid, Handshake, Tag, Send } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PageBanner } from "@/components/shared/page-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input, Textarea, Label, Select } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { ServiceStatusBadge } from "@/components/shared/status-badge";
import { AuditTimeline } from "@/components/shared/audit-timeline";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuthStore } from "@/lib/store/auth";
import { useAppStore } from "@/lib/store/app";
import { DIRECTIONS, DIRECTION_MAP, REGIONS, PRICE_TYPE_LABELS } from "@/lib/constants";
import { fromPrice } from "@/lib/pricing";
import { isRejected, isEditable } from "@/lib/status";
import { formatUZS, cn } from "@/lib/utils";
import type { PriceType, Role, Service } from "@/lib/types";

type FilterTab = "all" | "draft" | "review" | "published" | "rejected";

interface FormState {
  title: string;
  directionId: string;
  description: string;
  priceType: PriceType;
  regions: Record<string, string>; // region -> price text (mavjud = kalit bor)
}

const emptyForm = (): FormState => ({
  title: "",
  directionId: DIRECTIONS[0].id,
  description: "",
  priceType: "fixed",
  regions: {},
});

export default function TaqdimotchiXizmatlarPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const providers = useAppStore((s) => s.providers);
  const services = useAppStore((s) => s.services);
  const addService = useAppStore((s) => s.addService);
  const updateService = useAppStore((s) => s.updateService);
  const deleteService = useAppStore((s) => s.deleteService);
  const submitService = useAppStore((s) => s.submitService);

  const me = providers.find((p) => p.id === currentUser?.providerId);
  const actor = { name: currentUser?.fullName ?? "", role: (currentUser?.role ?? "provider") as Role };

  const myServices = React.useMemo(
    () => (me ? services.filter((s) => s.providerId === me.id) : []),
    [services, me],
  );

  const [tab, setTab] = React.useState<FilterTab>("all");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Service | null>(null);
  const [form, setForm] = React.useState<FormState>(emptyForm());

  if (!currentUser || !me) {
    return (
      <>
        <PageBanner
          variant="card"
          eyebrow="Katalog"
          title="Xizmatlar"
          description="Xizmatlaringizni joylashtiring, tahrirlang va holatini kuzating."
          icons={["LayoutGrid", "Mic", "Camera"]}
        />
        <EmptyState icon={LayoutGrid} title="Profil topilmadi" description="Hisobingizga bog'langan taqdimotchi profili mavjud emas." />
      </>
    );
  }

  const inReview = (s: Service) =>
    s.status === "PENDING_ADMIN_REVIEW" || s.status === "PENDING_MINISTRY_APPROVAL";
  const counts = {
    all: myServices.length,
    draft: myServices.filter((s) => s.status === "DRAFT").length,
    review: myServices.filter(inReview).length,
    published: myServices.filter((s) => s.status === "PUBLISHED").length,
    rejected: myServices.filter((s) => isRejected(s.status)).length,
  };
  const matchTab = (s: Service) =>
    tab === "all"
      ? true
      : tab === "draft"
        ? s.status === "DRAFT"
        : tab === "review"
          ? inReview(s)
          : tab === "published"
            ? s.status === "PUBLISHED"
            : isRejected(s.status);
  const filtered = myServices.filter(matchTab);

  const tabs = [
    { value: "all", label: "Hammasi", badge: <Badge variant="neutral">{counts.all}</Badge> },
    { value: "draft", label: "Qoralama", badge: <Badge variant="neutral">{counts.draft}</Badge> },
    { value: "review", label: "Ko'rib chiqilmoqda", badge: <Badge variant="warning">{counts.review}</Badge> },
    { value: "published", label: "E'lon qilingan", badge: <Badge variant="success">{counts.published}</Badge> },
    { value: "rejected", label: "Rad etilgan", badge: <Badge variant="danger">{counts.rejected}</Badge> },
  ];

  const openCreate = () => {
    setForm(emptyForm());
    setCreateOpen(true);
  };

  const openEdit = (svc: Service) => {
    setForm({
      title: svc.title,
      directionId: svc.directionId,
      description: svc.description,
      priceType: svc.priceType,
      regions: Object.fromEntries(svc.regionPrices.map((rp) => [rp.region, String(rp.price)])),
    });
    setEditTarget(svc);
  };

  const buildRegionPrices = () =>
    Object.entries(form.regions).map(([region, price]) => ({
      region,
      price: form.priceType === "negotiable" ? Number(price) || 0 : Number(price) || 0,
    }));

  const formValid =
    form.title.trim().length > 0 &&
    Object.keys(form.regions).length > 0 &&
    (form.priceType === "negotiable" ||
      Object.values(form.regions).every((v) => Number(v) > 0));

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;
    addService({
      title: form.title.trim(),
      directionId: form.directionId,
      region: me.region,
      district: me.district,
      description: form.description.trim(),
      regionPrices: buildRegionPrices(),
      priceType: form.priceType,
      providerId: me.id,
      performerId: me.id,
    });
    setCreateOpen(false);
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !formValid) return;
    updateService(editTarget.id, {
      title: form.title.trim(),
      directionId: form.directionId,
      performerId: me.id,
      description: form.description.trim(),
      regionPrices: buildRegionPrices(),
      priceType: form.priceType,
    });
    setEditTarget(null);
  };

  const toggleRegion = (r: string) =>
    setForm((f) => {
      const next = { ...f.regions };
      if (r in next) delete next[r];
      else next[r] = "";
      return { ...f, regions: next };
    });

  const renderForm = (onSubmit: (e: React.FormEvent) => void) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Xizmat nomi</Label>
        <Input id="title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Masalan: To'y marosimi uchun xonanda" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="direction">Yo'nalish</Label>
        <Select id="direction" value={form.directionId} onChange={(e) => setForm((f) => ({ ...f, directionId: e.target.value }))}>
          {DIRECTIONS.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Narx turi</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["fixed", "negotiable"] as PriceType[]).map((pt) => (
            <button
              key={pt}
              type="button"
              onClick={() => setForm((f) => ({ ...f, priceType: pt }))}
              className={cn(
                "flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition-all",
                form.priceType === pt ? "border-primary bg-primary-50 ring-1 ring-primary" : "border-border hover:bg-muted",
              )}
            >
              {pt === "fixed" ? <Tag className="size-4 text-primary" /> : <Handshake className="size-4 text-primary" />}
              <span className="font-medium">{PRICE_TYPE_LABELS[pt]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Hudud bo'yicha narxlar</Label>
        <p className="text-xs text-muted-foreground">
          {form.priceType === "negotiable"
            ? "Xizmat mavjud hududlarni belgilang (narx kelishuv asosida)."
            : "Hududni belgilang va narxini kiriting. Belgilanmagan hududda xizmat ko'rsatilmaydi."}
        </p>
        <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-xl border border-border p-2">
          {REGIONS.map((r) => {
            const selected = r in form.regions;
            return (
              <div key={r} className="flex items-center gap-2">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={selected}
                  onClick={() => toggleRegion(r)}
                  className="flex flex-1 items-center gap-2.5 rounded-lg px-1 py-1 text-left text-sm hover:bg-muted"
                >
                  <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-md border", selected ? "border-primary bg-primary text-white" : "border-input bg-surface")}>
                    {selected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                    )}
                  </span>
                  <span>{r}</span>
                </button>
                {selected && form.priceType === "fixed" && (
                  <Input
                    type="number"
                    min={0}
                    step={100000}
                    value={form.regions[r]}
                    onChange={(e) => setForm((f) => ({ ...f, regions: { ...f.regions, [r]: e.target.value } }))}
                    placeholder="narx"
                    className="h-9 w-36"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Tavsif</Label>
        <Textarea id="description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Xizmatingiz haqida batafsil…" maxLength={600} />
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-[var(--color-info-bg)]/60 p-3 text-sm text-[var(--color-info)]">
        <Info className="mt-0.5 size-4 shrink-0" />
        <span>Yangi xizmat <strong>“Qoralama”</strong> holatida saqlanadi. <strong>“Tasdiqlashga yuborish”</strong> dan so'ng avval administrator, keyin vazirlik koordinatori kelishuvidan o'tib portalda e'lon qilinadi.</span>
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
        title="Xizmatlar"
        description="Xizmatlaringizni qo'shing, tahrirlang va holatini kuzating."
        actions={<Button onClick={openCreate}><Plus /> Yangi xizmat</Button>}
      />

      <Tabs tabs={tabs} value={tab} onValueChange={(v) => setTab(v as FilterTab)} className="mb-6" />

      {filtered.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title={tab === "all" ? "Hali xizmatlaringiz yo'q" : "Bu holatda xizmat yo'q"}
          description={tab === "all" ? "Birinchi xizmatingizni qo'shing — tasdiqlangach mijozlarga ko'rinadi." : "Boshqa holatdagi xizmatlarni ko'rish uchun yorliqlarni tanlang."}
          action={tab === "all" ? <Button onClick={openCreate}><Plus /> Yangi xizmat</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((svc) => {
            const dir = DIRECTION_MAP[svc.directionId];
            const negotiable = svc.priceType === "negotiable";
            return (
              <Card key={svc.id} className="overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img src={svc.images[0]} alt={svc.title} className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute right-3 top-3"><ServiceStatusBadge status={svc.status} /></div>
                </div>
                <CardContent className="space-y-3 p-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{dir?.name ?? "Xizmat"}</Badge>
                      <Badge variant="neutral">{svc.regionPrices.length} hudud</Badge>
                    </div>
                    <h3 className="mt-2 line-clamp-1 font-semibold text-foreground">{svc.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-3.5" /> {svc.region}</p>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="text-[11px] text-muted-foreground">{negotiable ? "Narx" : "Boshlang'ich narx"}</div>
                    <div className="font-display font-bold text-primary">{negotiable ? "Kelishuv asosida" : `${formatUZS(fromPrice(svc.regionPrices))} dan`}</div>
                  </div>
                  {isRejected(svc.status) && svc.rejectionReason && (
                    <div className="flex items-start gap-2 rounded-xl bg-[var(--color-danger-bg)]/60 p-3 text-sm text-[var(--color-danger)]">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                      <div><div className="font-semibold">Rad etish sababi</div><p className="mt-0.5">{svc.rejectionReason}</p></div>
                    </div>
                  )}
                  <AuditTimeline entityType="service" entityId={svc.id} />
                  {isEditable(svc.status) && (
                    <Button size="sm" className="w-full" onClick={() => submitService(svc.id, actor)}>
                      <Send /> Tasdiqlashga yuborish
                    </Button>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(svc)}><Pencil /> Tahrirlash</Button>
                    <Button variant="ghost" size="sm" className="text-danger hover:bg-[var(--color-danger-bg)]" onClick={() => setDeleteTarget(svc)}><Trash2 /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Yangi xizmat qo'shish" description="Xizmat ma'lumotlarini to'ldiring.">
        {renderForm(submitCreate)}
      </Dialog>
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} title="Xizmatni tahrirlash" description="O'zgartirishlarni saqlang.">
        {renderForm(submitEdit)}
      </Dialog>
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Xizmatni o'chirish">
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{deleteTarget?.title}</strong> xizmatini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Bekor qilish</Button>
            <Button variant="danger" onClick={() => { if (deleteTarget) deleteService(deleteTarget.id); setDeleteTarget(null); }}><Trash2 /> O'chirish</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
