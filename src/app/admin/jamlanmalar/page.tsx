"use client";
import * as React from "react";
import { CheckCircle2, XCircle, Layers, AlertTriangle, Check, CalendarDays, Landmark } from "lucide-react";
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
import { packageRegions, packageFromPrice, packagePriceType } from "@/lib/pricing";
import { isRejected } from "@/lib/status";
import { formatUZS, formatDate } from "@/lib/utils";
import type { ServicePackage, Role } from "@/lib/types";

type TabKey = "pending" | "forwarded" | "rejected";

export default function AdminPackagesPage() {
  const packages = useAppStore((s) => s.packages);
  const services = useAppStore((s) => s.services);
  const providers = useAppStore((s) => s.providers);
  const adminApprove = useAppStore((s) => s.adminApprovePackage);
  const adminReject = useAppStore((s) => s.adminRejectPackage);
  const me = useAuthStore((s) => s.currentUser);
  const actor = { name: me?.fullName ?? "Administrator", role: (me?.role ?? "admin") as Role };

  const getService = React.useCallback((id: string) => services.find((s) => s.id === id), [services]);
  const ownerName = (id: string) => providers.find((p) => p.id === id)?.name ?? "Noma'lum";

  const [tab, setTab] = React.useState<TabKey>("pending");
  const [rejectTarget, setRejectTarget] = React.useState<ServicePackage | null>(null);
  const [reason, setReason] = React.useState("");

  const pending = packages.filter((p) => p.status === "PENDING_ADMIN_REVIEW");
  const forwarded = packages.filter((p) => p.status === "PENDING_MINISTRY_APPROVAL");
  const rejected = packages.filter((p) => p.status === "ADMIN_REJECTED");
  const current = tab === "pending" ? pending : tab === "forwarded" ? forwarded : rejected;

  const tabs = [
    { value: "pending", label: "Kutilmoqda", badge: <Badge variant="warning">{pending.length}</Badge> },
    { value: "forwarded", label: "Vazirlik kelishuvida", badge: <Badge variant="info">{forwarded.length}</Badge> },
    { value: "rejected", label: "Rad etilgan", badge: <Badge variant="danger">{rejected.length}</Badge> },
  ];

  const openReject = (p: ServicePackage) => {
    setRejectTarget(p);
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
      title: "Navbat bo'sh",
      description: "Hozircha ko'rib chiqilishi kerak bo'lgan jamlanmalar yo'q.",
    },
    forwarded: {
      title: "Kelishuvda jamlanma yo'q",
      description: "Siz tasdiqlab vazirlik koordinatoriga yuborgan jamlanmalar shu yerda ko'rinadi.",
    },
    rejected: {
      title: "Rad etilgan jamlanmalar yo'q",
      description: "Siz rad etgan jamlanmalar va sabablari shu yerda ko'rinadi.",
    },
  };

  return (
    <div>
      <PageHeader
        title="Jamlanmalarni tasdiqlash"
        description="Tasdiqlangan jamlanma avtomatik vazirlik koordinatori kelishuviga yuboriladi. Saytda faqat kelishilgandan keyin chiqadi."
      />

      <div className="mb-5 overflow-x-auto">
        <Tabs tabs={tabs} value={tab} onValueChange={(v) => setTab(v as TabKey)} />
      </div>

      {current.length === 0 ? (
        <EmptyState
          icon={tab === "pending" ? Layers : tab === "forwarded" ? Landmark : XCircle}
          title={emptyByTab[tab].title}
          description={emptyByTab[tab].description}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {current.map((p) => {
            const negotiable = packagePriceType(p.serviceIds, getService) === "negotiable";
            const regions = packageRegions(p.serviceIds, getService);
            return (
              <div key={p.id} className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="accent"><Layers className="mr-1 size-3.5" /> Jamlanma</Badge>
                    <h3 className="mt-2 font-display text-lg font-semibold leading-tight text-foreground">{p.title}</h3>
                  </div>
                  <ServiceStatusBadge status={p.status} />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{ownerName(p.providerId)}</span>
                  <span>{regions.length} hudud</span>
                  <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" /> {formatDate(p.createdAt)}</span>
                </div>

                <ul className="mt-3 space-y-1.5 rounded-xl bg-muted/40 p-3">
                  {p.serviceIds.map((sid) => (
                    <li key={sid} className="flex items-center gap-2 text-sm text-foreground/80">
                      <Check className="size-4 shrink-0 text-primary" /> {getService(sid)?.title ?? "Xizmat (o'chirilgan)"}
                    </li>
                  ))}
                </ul>

                <div className="mt-3 text-sm">
                  <span className="text-muted-foreground">To'plam narxi: </span>
                  <span className="font-display font-bold text-primary">
                    {negotiable ? "Kelishuv asosida" : `${formatUZS(packageFromPrice(p.serviceIds, getService))} dan`}
                  </span>
                </div>

                {isRejected(p.status) && p.rejectionReason && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] p-3 text-sm">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--color-danger)]" />
                    <div><div className="font-semibold text-[var(--color-danger)]">Rad etish sababi</div><p className="mt-0.5 text-foreground">{p.rejectionReason}</p></div>
                  </div>
                )}

                <AuditTimeline entityType="package" entityId={p.id} className="mt-3" />

                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                  {p.status === "PENDING_ADMIN_REVIEW" && (
                    <>
                      <Button size="sm" onClick={() => adminApprove(p.id, actor)}><CheckCircle2 /> Tasdiqlash</Button>
                      <Button size="sm" variant="outline" onClick={() => openReject(p)}><XCircle /> Rad etish</Button>
                    </>
                  )}
                  {p.status === "PENDING_MINISTRY_APPROVAL" && (
                    <Badge variant="info" className="self-center">
                      <Landmark /> Vazirlik kelishuvida
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Jamlanmani rad etish"
        description={rejectTarget ? `"${rejectTarget.title}" uchun rad etish sababini kiriting.` : undefined}
      >
        <form onSubmit={submitReject} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason">Rad etish sababi</Label>
            <Textarea id="reject-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Masalan: to'plam tarkibi yoki narxi noaniq…" required maxLength={400} />
            <p className="text-xs text-muted-foreground">Bu sabab jamlanma egasiga bildirishnoma orqali yuboriladi.</p>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setRejectTarget(null)}>Bekor qilish</Button>
            <Button type="submit" variant="danger" disabled={!reason.trim()}><XCircle /> Rad etish</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
