"use client";
import * as React from "react";
import { UserCog, Hash, LayoutGrid, BadgeCheck, ShieldX, Eye, MapPin, Phone, Mail, Layers } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Dialog } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/misc";
import { DataTable, type Column } from "@/components/shared/data-table";
import { VerifiedBadge } from "@/components/shared/status-badge";
import { useAppStore } from "@/lib/store/app";
import { PROVIDER_TYPE_LABELS, DIRECTION_MAP } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Provider } from "@/lib/types";

export default function AdminProvidersPage() {
  const providers = useAppStore((s) => s.providers);
  const services = useAppStore((s) => s.services);
  const packages = useAppStore((s) => s.packages);
  const updateProvider = useAppStore((s) => s.updateProvider);

  const [detail, setDetail] = React.useState<Provider | null>(null);

  const servicesOf = (id: string) => services.filter((s) => s.providerId === id).length;
  const packagesOf = (id: string) => packages.filter((p) => p.providerId === id).length;

  const columns: Column<Provider>[] = [
    {
      key: "name",
      header: "Taqdimotchi",
      sortValue: (p) => p.name,
      render: (p) => (
        <div className="flex items-center gap-3">
          <Avatar src={p.avatar} name={p.name} size={38} />
          <div className="min-w-0">
            <div className="truncate font-semibold text-foreground">{p.name}</div>
            <div className="truncate text-xs text-muted-foreground">{p.email || p.phone || "—"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Turi",
      sortValue: (p) => PROVIDER_TYPE_LABELS[p.type],
      render: (p) => <Badge variant={p.type === "organization" ? "secondary" : "outline"}>{PROVIDER_TYPE_LABELS[p.type]}</Badge>,
    },
    {
      key: "region",
      header: "Viloyat",
      sortValue: (p) => p.region,
      render: (p) => <span className="text-muted-foreground">{p.region}</span>,
    },
    {
      key: "packages",
      header: "Jamlanmalar",
      align: "center",
      sortValue: (p) => packagesOf(p.id),
      render: (p) => <span className="font-semibold">{packagesOf(p.id)}</span>,
    },
    {
      key: "services",
      header: "Xizmatlar",
      align: "center",
      sortValue: (p) => servicesOf(p.id),
      render: (p) => <span className="font-semibold">{servicesOf(p.id)}</span>,
    },
    {
      key: "status",
      header: "Holat",
      sortValue: (p) => (p.verified ? 1 : 0),
      render: (p) => (p.verified ? <VerifiedBadge /> : <Badge variant="neutral">Tekshirilmagan</Badge>),
    },
    {
      key: "actions",
      header: "Amallar",
      align: "right",
      render: (p) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setDetail(p)}><Eye /> Batafsil</Button>
          {p.verified ? (
            <Button size="sm" variant="outline" onClick={() => updateProvider(p.id, { verified: false })}><ShieldX /> Bekor</Button>
          ) : (
            <Button size="sm" onClick={() => updateProvider(p.id, { verified: true })}><BadgeCheck /> Tasdiqlash</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Taqdimotchilar"
        description="Individual ijrochilar va tashkilotlarni boshqaring va tasdiqlang."
      />

      <DataTable
        columns={columns}
        data={providers}
        searchKeys={(p) => `${p.name} ${p.region} ${p.email ?? ""}`}
        pageSize={10}
        emptyLabel="Taqdimotchi topilmadi"
      />

      <Dialog open={!!detail} onClose={() => setDetail(null)} title={detail?.name}>
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar src={detail.avatar} name={detail.name} size={56} ring />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground">{detail.name}</span>
                  {detail.verified ? <VerifiedBadge /> : <Badge variant="neutral">Tekshirilmagan</Badge>}
                </div>
                <div className="mt-0.5 text-sm text-muted-foreground">
                  {PROVIDER_TYPE_LABELS[detail.type]} · {DIRECTION_MAP[detail.directionId]?.name ?? ""} · A'zo: {formatDate(detail.memberSince)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-primary" /> {detail.region}{detail.district ? `, ${detail.district}` : ""}</span>
              {detail.phone && <span className="inline-flex items-center gap-1.5"><Phone className="size-4 text-primary" /> {detail.phone}</span>}
              {detail.email && <span className="inline-flex items-center gap-1.5"><Mail className="size-4 text-primary" /> {detail.email}</span>}
              {detail.type === "organization" && detail.responsiblePerson && (
                <span className="inline-flex items-center gap-1.5"><UserCog className="size-4 text-primary" /> Mas'ul: {detail.responsiblePerson}</span>
              )}
              {detail.type === "organization" && detail.taxId && (
                <span className="inline-flex items-center gap-1.5"><Hash className="size-4 text-primary" /> STIR: {detail.taxId}</span>
              )}
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tavsif</div>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground">{detail.bio?.trim() || "Tavsif kiritilmagan."}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border p-4 text-center">
                <LayoutGrid className="mx-auto mb-1 size-5 text-secondary" />
                <div className="font-display text-xl font-bold">{servicesOf(detail.id)}</div>
                <div className="text-xs text-muted-foreground">Xizmatlar</div>
              </div>
              <div className="rounded-xl border border-border p-4 text-center">
                <Layers className="mx-auto mb-1 size-5 text-accent-600" />
                <div className="font-display text-xl font-bold">{packagesOf(detail.id)}</div>
                <div className="text-xs text-muted-foreground">Jamlanmalar</div>
              </div>
            </div>

            <Separator />
            <div className="flex justify-end gap-2">
              {detail.verified ? (
                <Button variant="outline" onClick={() => { updateProvider(detail.id, { verified: false }); setDetail({ ...detail, verified: false }); }}><ShieldX /> Tasdiqni bekor qilish</Button>
              ) : (
                <Button onClick={() => { updateProvider(detail.id, { verified: true }); setDetail({ ...detail, verified: true }); }}><BadgeCheck /> Tasdiqlash</Button>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
