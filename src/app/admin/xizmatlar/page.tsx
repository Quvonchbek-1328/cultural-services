"use client";
import * as React from "react";
import {
  CheckCircle2,
  XCircle,
  MapPin,
  CalendarDays,
  ClipboardCheck,
  AlertTriangle,
  Landmark,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { Textarea, Label } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { ServiceStatusBadge } from "@/components/shared/status-badge";
import { AuditTimeline } from "@/components/shared/audit-timeline";
import { useAppStore } from "@/lib/store/app";
import { useAuthStore } from "@/lib/store/auth";
import { DIRECTION_MAP } from "@/lib/constants";
import { fromPrice } from "@/lib/pricing";
import { isRejected } from "@/lib/status";
import { formatUZS, formatDate } from "@/lib/utils";
import type { Service, Role } from "@/lib/types";

type TabKey = "pending" | "forwarded" | "rejected";

export default function AdminServicesPage() {
  const services = useAppStore((s) => s.services);
  const providers = useAppStore((s) => s.providers);
  const adminApprove = useAppStore((s) => s.adminApproveService);
  const adminReject = useAppStore((s) => s.adminRejectService);
  const me = useAuthStore((s) => s.currentUser);
  const actor = { name: me?.fullName ?? "Administrator", role: (me?.role ?? "admin") as Role };

  const [tab, setTab] = React.useState<TabKey>("pending");
  const [rejectTarget, setRejectTarget] = React.useState<Service | null>(null);
  const [reason, setReason] = React.useState("");

  const pending = services.filter((s) => s.status === "PENDING_ADMIN_REVIEW");
  const forwarded = services.filter((s) => s.status === "PENDING_MINISTRY_APPROVAL");
  const rejected = services.filter((s) => s.status === "ADMIN_REJECTED");

  const current = tab === "pending" ? pending : tab === "forwarded" ? forwarded : rejected;

  const tabs = [
    { value: "pending", label: "Kutilmoqda", badge: <Badge variant="warning">{pending.length}</Badge> },
    { value: "forwarded", label: "Vazirlik kelishuvida", badge: <Badge variant="info">{forwarded.length}</Badge> },
    { value: "rejected", label: "Rad etilgan", badge: <Badge variant="danger">{rejected.length}</Badge> },
  ];

  const ownerOf = (s: Service): { name: string; isOrg: boolean } => {
    const p = providers.find((p) => p.id === s.providerId);
    return { name: p?.name ?? "Noma'lum", isOrg: p?.type === "organization" };
  };

  const openReject = (s: Service) => {
    setRejectTarget(s);
    setReason("");
  };

  const submitReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectTarget && reason.trim()) {
      adminReject(rejectTarget.id, reason.trim(), actor);
      setRejectTarget(null);
      setReason("");
    }
  };

  const emptyByTab: Record<TabKey, { title: string; description: string }> = {
    pending: {
      title: "Tasdiqlash navbati bo'sh",
      description: "Hozircha ko'rib chiqilishi kerak bo'lgan yangi xizmatlar yo'q.",
    },
    forwarded: {
      title: "Kelishuvda xizmat yo'q",
      description: "Siz tasdiqlab vazirlik koordinatoriga yuborgan xizmatlar shu yerda ko'rinadi.",
    },
    rejected: {
      title: "Rad etilgan xizmatlar yo'q",
      description: "Siz rad etgan xizmatlar va sabablari shu yerda ko'rinadi.",
    },
  };

  return (
    <div>
      <PageHeader
        title="Xizmatlarni tasdiqlash"
        description="Tasdiqlangan xizmat avtomatik vazirlik koordinatori kelishuviga yuboriladi. Saytda faqat kelishilgandan keyin chiqadi."
      />

      <div className="mb-5 overflow-x-auto">
        <Tabs tabs={tabs} value={tab} onValueChange={(v) => setTab(v as TabKey)} />
      </div>

      {current.length === 0 ? (
        <EmptyState
          icon={tab === "pending" ? ClipboardCheck : tab === "forwarded" ? Landmark : XCircle}
          title={emptyByTab[tab].title}
          description={emptyByTab[tab].description}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {current.map((s) => {
            const owner = ownerOf(s);
            const dir = DIRECTION_MAP[s.directionId];
            return (
              <div key={s.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
                <div className="relative h-44 w-full bg-muted">
                  <img src={s.images[0]} alt={s.title} className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute left-3 top-3">
                    <ServiceStatusBadge status={s.status} />
                  </div>
                  {dir && (
                    <div className="absolute right-3 top-3">
                      <Badge variant="default">{dir.name}</Badge>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold leading-tight text-foreground">{s.title}</h3>
                    <span className="shrink-0 font-display text-base font-bold text-primary">
                      {s.priceType === "negotiable" ? "Kelishuv" : `${formatUZS(fromPrice(s.regionPrices))} dan`}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-medium text-foreground">
                      {owner.name}
                      {owner.isOrg && <Badge variant="secondary" className="ml-1">Tashkilot</Badge>}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" /> {s.region}
                      {s.district ? `, ${s.district}` : ""}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" /> {formatDate(s.createdAt)}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>

                  {isRejected(s.status) && s.rejectionReason && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] p-3 text-sm">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--color-danger)]" />
                      <div>
                        <div className="font-semibold text-[var(--color-danger)]">Rad etish sababi</div>
                        <p className="mt-0.5 text-foreground">{s.rejectionReason}</p>
                      </div>
                    </div>
                  )}

                  <AuditTimeline entityType="service" entityId={s.id} className="mt-3" />

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                    {s.status === "PENDING_ADMIN_REVIEW" && (
                      <>
                        <Button size="sm" onClick={() => adminApprove(s.id, actor)}>
                          <CheckCircle2 /> Tasdiqlash
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openReject(s)}>
                          <XCircle /> Rad etish
                        </Button>
                      </>
                    )}
                    {s.status === "PENDING_MINISTRY_APPROVAL" && (
                      <Badge variant="info" className="self-center">
                        <Landmark /> Vazirlik kelishuvida
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Xizmatni rad etish"
        description={rejectTarget ? `"${rejectTarget.title}" uchun rad etish sababini kiriting.` : undefined}
      >
        <form onSubmit={submitReject} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason">Rad etish sababi</Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Masalan: rasm sifati past, narx noaniq, tavsif yetarli emas…"
              required
              maxLength={400}
            />
            <p className="text-xs text-muted-foreground">Bu sabab xizmat egasiga bildirishnoma orqali yuboriladi.</p>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setRejectTarget(null)}>Bekor qilish</Button>
            <Button type="submit" variant="danger" disabled={!reason.trim()}>
              <XCircle /> Rad etish
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
