"use client";
import * as React from "react";
import { Wallet, Tag, MapPin, Star } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/lib/store/app";
import { ORDER_STATUS_LABELS, DIRECTION_MAP } from "@/lib/constants";
import { fromPrice } from "@/lib/pricing";
import { isPublic } from "@/lib/status";
import { formatUZS } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const TOOLTIP_STYLE = { borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", fontSize: 13, background: "#0f172a", color: "#e5e7eb" };

const ORDER_COLORS: Record<OrderStatus, string> = {
  pending: "#fbbf24",
  accepted: "#38bdf8",
  rejected: "#f87171",
  completed: "#34d399",
  cancelled: "#94a3b8",
};

const UZ_MONTHS_FULL = [
  "Yan", "Fev", "Mar", "Apr", "May", "Iyn",
  "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek",
];

export default function AdminStatsPage() {
  const services = useAppStore((s) => s.services);
  const orders = useAppStore((s) => s.orders);
  const categories = useAppStore((s) => s.categories);

  const approved = services.filter((s) => isPublic(s.status));

  /* --- Xizmatlar kategoriyalar bo'yicha --- */
  const byCategory = categories
    .map((c) => ({
      name: c.name,
      soni: services.filter((s) => DIRECTION_MAP[s.directionId]?.categoryId === c.id).length,
    }))
    .filter((d) => d.soni > 0)
    .sort((a, b) => b.soni - a.soni);

  /* --- Buyurtmalar holat bo'yicha --- */
  const byStatus = (Object.keys(ORDER_STATUS_LABELS) as OrderStatus[])
    .map((st) => ({
      key: st,
      name: ORDER_STATUS_LABELS[st],
      value: orders.filter((o) => o.status === st).length,
      color: ORDER_COLORS[st],
    }))
    .filter((d) => d.value > 0);

  /* --- Oylar bo'yicha buyurtma va aylanma --- */
  const monthly = React.useMemo(() => {
    const map = new Map<string, { label: string; sort: number; buyurtmalar: number; aylanma: number }>();
    for (const o of orders) {
      const d = new Date(o.createdAt);
      const sort = d.getUTCFullYear() * 12 + d.getUTCMonth();
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
      const label = `${UZ_MONTHS_FULL[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`;
      const row = map.get(key) ?? { label, sort, buyurtmalar: 0, aylanma: 0 };
      row.buyurtmalar += 1;
      if (o.status === "completed") row.aylanma += o.amount;
      map.set(key, row);
    }
    return [...map.values()]
      .sort((a, b) => a.sort - b.sort)
      .slice(-8)
      .map((r) => ({ ...r, aylanmaMln: Math.round((r.aylanma / 1_000_000) * 10) / 10 }));
  }, [orders]);

  /* --- Viloyatlar bo'yicha xizmatlar (top 8) --- */
  const byRegion = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const s of approved) map.set(s.region, (map.get(s.region) ?? 0) + 1);
    return [...map.entries()]
      .map(([name, soni]) => ({ name, soni }))
      .sort((a, b) => b.soni - a.soni)
      .slice(0, 8);
  }, [approved]);

  /* --- Xulosa ko'rsatkichlari --- */
  const revenue = orders.filter((o) => o.status === "completed").reduce((s, o) => s + o.amount, 0);
  const fixedApproved = approved.filter((s) => s.priceType === "fixed" && s.regionPrices.length > 0);
  const avgPrice = fixedApproved.length
    ? Math.round(fixedApproved.reduce((s, x) => s + fromPrice(x.regionPrices), 0) / fixedApproved.length)
    : 0;
  const topRegion = byRegion[0]?.name ?? "—";
  const rated = services.filter((s) => s.reviewCount > 0);
  const avgRating = rated.length
    ? (rated.reduce((s, x) => s + x.rating, 0) / rated.length).toFixed(1)
    : "0.0";

  return (
    <div>
      <PageHeader
        title="Statistika"
        description="Platforma bo'yicha kengaytirilgan tahlil va ko'rsatkichlar."
      />

      {/* Xulosa kartochkalari */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Umumiy aylanma"
          value={formatUZS(revenue, { compact: true })}
          icon={Wallet}
          accent="success"
          index={0}
        />
        <StatCard
          label="O'rtacha xizmat narxi"
          value={formatUZS(avgPrice, { compact: true })}
          icon={Tag}
          accent="primary"
          index={1}
        />
        <StatCard label="Eng faol viloyat" value={topRegion} icon={MapPin} accent="secondary" index={2} />
        <StatCard
          label="O'rtacha reyting"
          value={avgRating}
          icon={Star}
          accent="accent"
          hint={`${rated.length} ta baholangan xizmat`}
          index={3}
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
              <p className="py-12 text-center text-sm text-muted-foreground">Ma'lumot yo'q.</p>
            ) : (
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={byCategory} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} interval={0} angle={-20} textAnchor="end" height={56} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                    <Tooltip cursor={{ fill: "rgba(16,185,129,0.10)" }} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="soni" name="Xizmatlar" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Buyurtmalar holati bo'yicha</CardTitle>
          </CardHeader>
          <CardContent>
            {byStatus.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Ma'lumot yo'q.</p>
            ) : (
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={96} label>
                      {byStatus.map((d) => (
                        <Cell key={d.key} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oylar bo'yicha buyurtmalar va aylanma</CardTitle>
          </CardHeader>
          <CardContent>
            {monthly.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Ma'lumot yo'q.</p>
            ) : (
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={monthly} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value, name) =>
                        name === "Aylanma (mln)"
                          ? [`${value} mln so'm`, name]
                          : [value, name]
                      }
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                    <Line type="monotone" dataKey="buyurtmalar" name="Buyurtmalar" stroke="#2dd4bf" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="aylanmaMln" name="Aylanma (mln)" stroke="#fbbf24" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Viloyatlar bo'yicha xizmatlar</CardTitle>
          </CardHeader>
          <CardContent>
            {byRegion.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Ma'lumot yo'q.</p>
            ) : (
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={byRegion}
                    layout="vertical"
                    margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} width={110} />
                    <Tooltip cursor={{ fill: "rgba(16,185,129,0.10)" }} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="soni" name="Xizmatlar" fill="#14b8a6" radius={[0, 6, 6, 0]} maxBarSize={26} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
