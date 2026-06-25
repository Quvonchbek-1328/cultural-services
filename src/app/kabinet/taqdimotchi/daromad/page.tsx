"use client";
import * as React from "react";
import { Wallet, ClipboardCheck, TrendingUp, CalendarRange } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PageBanner } from "@/components/shared/page-banner";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/auth";
import { useAppStore } from "@/lib/store/app";
import { formatUZS, formatDate } from "@/lib/utils";
import type { Order } from "@/lib/types";

const UZ_MONTHS_SHORT = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];
const REFERENCE_TODAY = new Date("2026-06-16");

export default function TaqdimotchiDaromadPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const orders = useAppStore((s) => s.orders);
  const providerId = currentUser?.providerId;

  const completed = React.useMemo(
    () =>
      orders
        .filter((o) => o.providerId === providerId && o.status === "completed")
        .slice()
        .sort((a, b) => (a.eventDate < b.eventDate ? 1 : -1)),
    [orders, providerId],
  );

  const totalIncome = completed.reduce((sum, o) => sum + o.amount, 0);
  const completedCount = completed.length;
  const avgOrder = completedCount ? Math.round(totalIncome / completedCount) : 0;

  const thisMonthIncome = completed
    .filter((o) => {
      const d = new Date(o.eventDate);
      return d.getUTCFullYear() === REFERENCE_TODAY.getUTCFullYear() && d.getUTCMonth() === REFERENCE_TODAY.getUTCMonth();
    })
    .reduce((sum, o) => sum + o.amount, 0);

  const chartData = React.useMemo(() => {
    const buckets: { key: string; label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(REFERENCE_TODAY.getUTCFullYear(), REFERENCE_TODAY.getUTCMonth() - i, 1));
      buckets.push({ key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`, label: UZ_MONTHS_SHORT[d.getUTCMonth()], total: 0 });
    }
    const idx = new Map(buckets.map((b, i) => [b.key, i]));
    for (const o of completed) {
      const d = new Date(o.eventDate);
      const i = idx.get(`${d.getUTCFullYear()}-${d.getUTCMonth()}`);
      if (i !== undefined) buckets[i].total += o.amount;
    }
    return buckets;
  }, [completed]);

  const columns: Column<Order>[] = [
    { key: "serviceTitle", header: "Xizmat", render: (o) => (
      <span className="flex items-center gap-2 font-medium text-foreground">
        {o.serviceTitle}
        {o.kind === "package" && <Badge variant="accent">Jamlanma</Badge>}
      </span>
    ) },
    { key: "customerName", header: "Mijoz", render: (o) => <span className="text-muted-foreground">{o.customerName}</span> },
    { key: "eventDate", header: "Sana", sortValue: (o) => o.eventDate, render: (o) => <span className="text-muted-foreground">{formatDate(o.eventDate)}</span> },
    { key: "amount", header: "Summa", align: "right", sortValue: (o) => o.amount, render: (o) => <span className="font-display font-semibold text-primary">{o.negotiated ? "Kelishildi" : formatUZS(o.amount)}</span> },
  ];

  const hasIncome = completedCount > 0;

  return (
    <div>
      <PageBanner
        variant="card"
        eyebrow="Moliya"
        title="Daromad"
        description="Bajarilgan buyurtmalardan tushgan daromadingiz."
        icons={["Wallet", "BarChart3"]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Jami daromad" value={formatUZS(totalIncome, { compact: true })} icon={Wallet} accent="success" index={0} />
        <StatCard label="Bajarilgan buyurtmalar" value={completedCount} icon={ClipboardCheck} accent="primary" index={1} />
        <StatCard label="O'rtacha summa" value={formatUZS(avgOrder, { compact: true })} icon={TrendingUp} accent="secondary" index={2} />
        <StatCard label="Shu oydagi daromad" value={formatUZS(thisMonthIncome, { compact: true })} icon={CalendarRange} accent="accent" index={3} />
      </div>

      {hasIncome ? (
        <>
          <Card className="mt-6">
            <CardHeader><CardTitle>Oylik daromad</CardTitle></CardHeader>
            <CardContent>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                    <YAxis tickLine={false} axisLine={false} width={70} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v: number) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)} mln` : String(v))} />
                    <Tooltip cursor={{ fill: "rgba(16,185,129,0.10)" }} formatter={(v) => [formatUZS(Number(v)), "Daromad"] as [string, string]} contentStyle={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", fontSize: 13, background: "#0f172a", color: "#e5e7eb" }} />
                    <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={56} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader><CardTitle>Bajarilgan buyurtmalar</CardTitle></CardHeader>
            <CardContent>
              <DataTable columns={columns} data={completed} searchable searchKeys={(o) => `${o.serviceTitle} ${o.customerName}`} pageSize={8} emptyLabel="Buyurtmalar topilmadi" />
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="mt-6">
          <EmptyState icon={Wallet} title="Hali daromad yo'q" description="Buyurtmalar bajarilgandan so'ng daromadingiz shu yerda ko'rinadi." />
        </div>
      )}
    </div>
  );
}
