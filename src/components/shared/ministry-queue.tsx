"use client";
import * as React from "react";
import { Landmark, CheckCircle2, XCircle, CalendarDays, MapPin, Layers, Building2 } from "lucide-react";
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
import { useAudit } from "@/lib/store/audit";
import { useHydrated } from "@/lib/store/hydrated";
import { formatDate } from "@/lib/utils";
import type { Role, Service, ServicePackage } from "@/lib/types";

type Kind = "service" | "package";
type TabKey = "pending" | "approved" | "rejected";
type Item = Service | ServicePackage;

/** Vazirlik koordinatori navbati — yakuniy ekspertiza (Kelishildi / Rad etildi). */
export function MinistryQueue({ kind }: { kind: Kind }) {
  const hydrated = useHydrated();
  const services = useAppStore((s) => s.services);
  const packages = useAppStore((s) => s.packages);
  const providers = useAppStore((s) => s.providers);
  const approve = useAppStore((s) => (kind === "service" ? s.ministryApproveService : s.ministryApprovePackage));
  const reject = useAppStore((s) => (kind === "service" ? s.ministryRejectService : s.ministryRejectPackage));
  const me = useAuthStore((s) => s.currentUser);
  const auditEntries = useAudit((s) => s.entries);
  const actor = { name: me?.fullName ?? "Vazirlik koordinatori", role: (me?.role ?? "ministry") as Role };

  const items = (kind === "service" ? services : packages) as Item[];
  const [tab, setTab] = React.useState<TabKey>("pending");
  const [rejectTarget, setRejectTarget] = React.useState<Item | null>(null);
  const [reason, setReason] = React.useState("");

  const pending = items.filter((i) => i.status === "PENDING_MINISTRY_APPROVAL");
  const approved = items.filter((i) => i.status === "PUBLISHED");
  const rejected = items.filter((i) => i.status === "MINISTRY_REJECTED");
  const current = tab === "pending" ? pending : tab === "approved" ? approved : rejected;

  const tabs = [
    { value: "pending", label: "Kutilmoqda", badge: <Badge variant="warning">{pending.length}</Badge> },
    { value: "approved", label: "Kelishildi", badge: <Badge variant="success">{approved.length}</Badge> },
    { value: "rejected", label: "Rad etildi", badge: <Badge variant="danger">{rejected.length}</Badge> },
  ];

  const providerName = (pid: string) => providers.find((p) => p.id === pid)?.name ?? "Noma'lum";
  const auditDate = (id: string, role: Role | "provider", action: string) =>
    auditEntries.find((e) => e.entityId === id && e.actorRole === role && e.action === action)?.createdAt;

  const noun = kind === "service" ? "xizmat" : "jamlanma";

  const submitReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectTarget && reason.trim()) {
      reject(rejectTarget.id, reason.trim(), actor);
      setRejectTarget(null);
      setReason("");
    }
  };

  const empty: Record<TabKey, string> = {
    pending: `Kelishuvga yuborilgan ${noun} yo'q`,
    approved: `Kelishilgan ${noun} yo'q`,
    rejected: `Rad etilgan ${noun} yo'q`,
  };

  if (!hydrated) return null;

  return (
    <div>
      <PageHeader
        eyebrow="Vazirlik"
        icons={kind === "service" ? ["ShieldCheck", "LayoutGrid", "CheckCircle2"] : ["ShieldCheck", "Layers", "CheckCircle2"]}
        title={kind === "service" ? "Kelishuvga yuborilgan xizmatlar" : "Kelishuvga yuborilgan jamlanmalar"}
        description="Yakuniy ekspertiza. «Kelishildi» bosilgandan keyingina portalda e'lon qilinadi."
      />

      <div className="mb-5 overflow-x-auto">
        <Tabs tabs={tabs} value={tab} onValueChange={(v) => setTab(v as TabKey)} />
      </div>

      {current.length === 0 ? (
        <EmptyState icon={tab === "approved" ? CheckCircle2 : tab === "rejected" ? XCircle : Landmark} title={empty[tab]} description="" />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {current.map((it) => {
            const isService = kind === "service";
            const submittedAt = auditDate(it.id, "provider", "Tasdiqlashga yubordi") ?? it.createdAt;
            const adminAt = auditDate(it.id, "admin", "Tasdiqladi");
            return (
              <div key={it.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
                <div className="relative h-40 w-full bg-muted">
                  {it.images[0] ? (
                    <img src={it.images[0]} alt={it.title} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-primary"><Layers className="size-9" /></div>
                  )}
                  <div className="absolute left-3 top-3"><ServiceStatusBadge status={it.status} /></div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-display text-lg font-semibold leading-tight text-foreground">{it.title}</h3>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-medium text-foreground">
                      <Building2 className="size-3.5" /> {providerName(it.providerId)}
                    </span>
                    {isService ? (
                      <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {(it as Service).region}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1"><Layers className="size-3.5" /> {(it as ServicePackage).serviceIds.length} ta xizmat</span>
                    )}
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-2.5 text-xs">
                    <div>
                      <div className="text-muted-foreground">Yuborilgan sana</div>
                      <div className="inline-flex items-center gap-1 font-medium text-foreground"><CalendarDays className="size-3.5" /> {formatDate(submittedAt)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Admin tasdiqlagan</div>
                      <div className="font-medium text-foreground">{adminAt ? formatDate(adminAt) : "—"}</div>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{it.description}</p>

                  <AuditTimeline entityType={kind} entityId={it.id} className="mt-3" />

                  {it.status === "PENDING_MINISTRY_APPROVAL" && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                      <Button size="sm" onClick={() => approve(it.id, actor)}>
                        <CheckCircle2 /> Kelishildi
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setRejectTarget(it); setReason(""); }}>
                        <XCircle /> Rad etildi
                      </Button>
                    </div>
                  )}
                  {it.status === "PUBLISHED" && (
                    <Badge variant="success" className="mt-4 self-start"><CheckCircle2 /> Portalda e&apos;lon qilingan</Badge>
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
        title={`${kind === "service" ? "Xizmatni" : "Jamlanmani"} rad etish`}
        description={rejectTarget ? `"${rejectTarget.title}" uchun rad etish sababini kiriting.` : undefined}
      >
        <form onSubmit={submitReject} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="m-reject-reason">Rad etish sababi</Label>
            <Textarea
              id="m-reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Yakuniy ekspertiza izohini kiriting…"
              required
              maxLength={400}
            />
            <p className="text-xs text-muted-foreground">Bu sabab xizmat egasiga bildirishnoma orqali yuboriladi.</p>
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
