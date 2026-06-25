"use client";
import * as React from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  Layers,
  LayoutGrid,
  ClipboardCheck,
  ShoppingBag,
  Wallet,
  ArrowRight,
  CheckCircle2,
  XCircle,
  MapPin,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Textarea, Label } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuthStore } from "@/lib/store/auth";
import { useAppStore } from "@/lib/store/app";
import { DIRECTION_MAP } from "@/lib/constants";
import { fromPrice } from "@/lib/pricing";
import { isPublic, isRejected } from "@/lib/status";
import { formatUZS, formatDate } from "@/lib/utils";
import type { Service, Role } from "@/lib/types";

const PIE_COLORS = {
  pending: "#fbbf24",
  approved: "#34d399",
  rejected: "#f87171",
};

export default function AdminDashboardPage() {
  const accounts = useAuthStore((s) => s.accounts);
  const me = useAuthStore((s) => s.currentUser);
  const actor = { name: me?.fullName ?? "Administrator", role: (me?.role ?? "admin") as Role };
  const providers = useAppStore((s) => s.providers);
  const services = useAppStore((s) => s.services);
  const packages = useAppStore((s) => s.packages);
  const orders = useAppStore((s) => s.orders);
  const categories = useAppStore((s) => s.categories);
  const adminApproveService = useAppStore((s) => s.adminApproveService);
  const adminRejectService = useAppStore((s) => s.adminRejectService);

  const pendingServices = services.filter((s) => s.status === "PENDING_ADMIN_REVIEW");
  const approvedServices = services.filter((s) => isPublic(s.status));
  const rejectedServices = services.filter((s) => isRejected(s.status));
  const pendingPackages = packages.filter((p) => p.status === "PENDING_ADMIN_REVIEW");

  const revenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.amount, 0);

  /* --- Kategoriyalar bo'yicha tasdiqlangan xizmatlar (BarChart) --- */
  const byCategory = categories
    .map((c) => ({
      name: c.name,
      soni: approvedServices.filter((s) => DIRECTION_MAP[s.directionId]?.categoryId === c.id).length,
    }))
    .filter((d) => d.soni > 0);

  /* --- Holat bo'yicha (PieChart) --- */
  const statusData = [
    { key: "pending", name: "Kutilmoqda", value: pendingServices.length, color: PIE_COLORS.pending },
    { key: "approved", name: "Tasdiqlangan", value: approvedServices.length, color: PIE_COLORS.approved },
    { key: "rejected", name: "Rad etilgan", value: rejectedServices.length, color: PIE_COLORS.rejected },
  ].filter((d) => d.value > 0);

  /* --- Rad etish dialogi --- */
  const [rejectTarget, setRejectTarget] = React.useState<Service | null>(null);
  const [reason, setReason] = React.useState("");

  const ownerName = (s: Service): { name: string; isOrg: boolean } => {
    const p = providers.find((p) => p.id === s.providerId);
    return { name: p?.name ?? "Noma'lum", isOrg: p?.type === "organization" };
  };

  const submitReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectTarget && reason.trim()) {
      adminRejectService(rejectTarget.id, reason.trim(), actor);
      setRejectTarget(null);
      setReason("");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Administrator"
        icons={["BarChart3", "ShoppingBag", "Users"]}
        title="Boshqaruv paneli"
        description="Platforma faoliyatining umumiy ko'rinishi va tasdiqlash navbati."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/xizmatlar">
              <ClipboardCheck /> Tasdiqlash navbati
            </Link>
          </Button>
        }
      />

      {/* KPI kartochkalari */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Foydalanuvchilar" value={accounts.length} icon={Users} accent="primary" index={0} />
        <StatCard label="Taqdimotchilar" value={providers.length} icon={Briefcase} accent="secondary" index={1} />
        <StatCard label="Jamlanmalar" value={packages.length} icon={Layers} accent="secondary" index={2} />
        <StatCard label="Xizmatlar" value={services.length} icon={LayoutGrid} accent="primary" index={3} />
        <StatCard
          label="Tasdiq kutayotgan"
          value={pendingServices.length}
          icon={ClipboardCheck}
          accent="accent"
          hint={`${pendingPackages.length} ta jamlanma ham kutilmoqda`}
          index={4}
        />
        <StatCard label="Buyurtmalar" value={orders.length} icon={ShoppingBag} accent="secondary" index={5} />
        <StatCard
          label="Umumiy aylanma"
          value={formatUZS(revenue, { compact: true })}
          icon={Wallet}
          accent="success"
          index={6}
        />
      </div>

      {/* Diagrammalar */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kategoriyalar bo'yicha xizmatlar</CardTitle>
          </CardHeader>
          <CardContent>
            {byCategory.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Tasdiqlangan xizmatlar yo'q.
              </p>
            ) : (
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={byCategory} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={56}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                    <Tooltip
                      cursor={{ fill: "rgba(16,185,129,0.10)" }}
                      contentStyle={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", fontSize: 13, background: "#0f172a", color: "#e5e7eb" }}
                    />
                    <Bar dataKey="soni" name="Xizmatlar" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Xizmatlar holati</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Ma'lumot yo'q.</p>
            ) : (
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div style={{ width: "100%", height: 240 }} className="sm:w-1/2">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={52}
                        outerRadius={84}
                        paddingAngle={2}
                      >
                        {statusData.map((d) => (
                          <Cell key={d.key} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", fontSize: 13, background: "#0f172a", color: "#e5e7eb" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid w-full gap-2 sm:w-1/2">
                  {statusData.map((d) => (
                    <div key={d.key} className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
                      <span className="inline-flex items-center gap-2 text-sm font-medium">
                        <span className="size-3 rounded-full" style={{ background: d.color }} />
                        {d.name}
                      </span>
                      <span className="font-display text-base font-bold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tasdiq kutayotgan xizmatlar */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold tracking-tight">
            Tasdiq kutayotgan xizmatlar
            {pendingServices.length > 0 && (
              <Badge variant="warning" className="ml-2 align-middle">
                {pendingServices.length}
              </Badge>
            )}
          </h2>
          <Button asChild variant="link" size="sm">
            <Link href="/admin/xizmatlar">
              Barchasi <ArrowRight />
            </Link>
          </Button>
        </div>

        {pendingServices.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Navbat bo'sh"
            description="Hozircha tasdiqlanishi kutilayotgan xizmatlar yo'q. Hammasi ko'rib chiqilgan."
          />
        ) : (
          <div className="space-y-3">
            {pendingServices.slice(0, 6).map((s) => {
              const owner = ownerName(s);
              const dir = DIRECTION_MAP[s.directionId];
              return (
                <Card key={s.id}>
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <img
                      src={s.images[0]}
                      alt={s.title}
                      className="h-24 w-full rounded-xl object-cover sm:h-16 sm:w-24"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-foreground">{s.title}</h3>
                        {dir && <Badge variant="outline">{dir.name}</Badge>}
                        {owner.isOrg && <Badge variant="secondary">Tashkilot</Badge>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{owner.name}</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" /> {s.region}
                        </span>
                        <span className="font-semibold text-primary">{s.priceType === "negotiable" ? "Kelishuv" : `${formatUZS(fromPrice(s.regionPrices))} dan`}</span>
                        <span>{formatDate(s.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" onClick={() => adminApproveService(s.id, actor)}>
                        <CheckCircle2 /> Tasdiqlash
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRejectTarget(s);
                          setReason("");
                        }}
                      >
                        <XCircle /> Rad etish
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Rad etish dialogi */}
      <Dialog
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Xizmatni rad etish"
        description={rejectTarget ? `"${rejectTarget.title}" xizmati rad etilsinmi?` : undefined}
      >
        <form onSubmit={submitReject} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reason">Rad etish sababi</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Egasiga ko'rsatiladigan sababni yozing…"
              required
              maxLength={400}
            />
            <p className="text-xs text-muted-foreground">Bu sabab xizmat egasiga ko'rsatiladi.</p>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setRejectTarget(null)}>
              Bekor qilish
            </Button>
            <Button type="submit" variant="danger" disabled={!reason.trim()}>
              Rad etish
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
