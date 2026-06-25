"use client";
import * as React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  CalendarDays,
  MapPin,
  Wallet,
  StickyNote,
  Eye,
  Hash,
} from "lucide-react";
import { PageBanner } from "@/components/shared/page-banner";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/store/auth";
import { useAppStore } from "@/lib/store/app";
import { formatDate, formatDateTime, formatUZS } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

type FilterKey = "all" | OrderStatus;

const TAB_DEFS: { value: FilterKey; label: string }[] = [
  { value: "all", label: "Hammasi" },
  { value: "pending", label: "Kutilmoqda" },
  { value: "accepted", label: "Qabul qilingan" },
  { value: "completed", label: "Bajarilgan" },
  { value: "cancelled", label: "Bekor qilingan" },
];

export default function BuyurtmalarPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const orders = useAppStore((s) => s.orders);
  const setOrderStatus = useAppStore((s) => s.setOrderStatus);

  const [tab, setTab] = React.useState<FilterKey>("all");
  const [detail, setDetail] = React.useState<Order | null>(null);

  const myOrders = React.useMemo(
    () =>
      orders
        .filter((o) => o.customerId === currentUser?.id)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [orders, currentUser?.id],
  );

  if (!currentUser) return null;

  const countOf = (key: FilterKey) =>
    key === "all"
      ? myOrders.length
      : myOrders.filter((o) => o.status === key).length;

  const filtered =
    tab === "all" ? myOrders : myOrders.filter((o) => o.status === tab);

  const tabs = TAB_DEFS.map((t) => ({
    value: t.value,
    label: t.label,
    badge: (
      <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">
        {countOf(t.value)}
      </span>
    ),
  }));

  return (
    <>
      <PageBanner
        variant="card"
        eyebrow="Buyurtmalar"
        title="Buyurtmalarim"
        description="Bergan buyurtmalaringiz holatini kuzating, ijrochi bilan bog'laning va tadbirni rejalashtiring."
        icons={["ShoppingBag", "Phone", "CalendarCheck"]}
      />

      <div className="mb-6">
        <Tabs
          tabs={tabs}
          value={tab}
          onValueChange={(v) => setTab(v as FilterKey)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Buyurtmalar topilmadi"
          description={
            tab === "all"
              ? "Siz hali biror xizmatga buyurtma bermagansiz. Xizmatlarni ko'rib chiqing va birinchi buyurtmangizni bering."
              : "Ushbu holatda buyurtmalar yo'q."
          }
          action={
            tab === "all" ? (
              <Button asChild variant="primary">
                <Link href="/xizmatlar">Xizmatlarni ko'rish</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              onDetail={() => setDetail(order)}
              onCancel={() => setOrderStatus(order.id, "cancelled")}
            />
          ))}
        </div>
      )}

      <OrderDetailDialog order={detail} onClose={() => setDetail(null)} />
    </>
  );
}

function OrderRow({
  order,
  onDetail,
  onCancel,
}: {
  order: Order;
  onDetail: () => void;
  onCancel: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Link
              href={`/xizmatlar/${order.serviceId}`}
              className="font-semibold text-foreground transition-colors hover:text-primary"
            >
              {order.serviceTitle}
            </Link>
            <div className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4 shrink-0" />
                {formatDate(order.eventDate)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0" />
                {order.region}
                {order.address ? `, ${order.address}` : ""}
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                <Wallet className="size-4 shrink-0 text-muted-foreground" />
                {formatUZS(order.amount)}
              </span>
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {order.note && (
          <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            <StickyNote className="mt-0.5 size-4 shrink-0" />
            <span>{order.note}</span>
          </p>
        )}

        {order.status === "rejected" && order.rejectionReason && (
          <p className="mt-3 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
            <span className="font-semibold">Rad etish sababi:</span>{" "}
            {order.rejectionReason}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" size="sm" onClick={onDetail}>
            <Eye className="size-4" /> Batafsil
          </Button>
          {order.status === "pending" && (
            <Button variant="danger" size="sm" onClick={onCancel}>
              Bekor qilish
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function OrderDetailDialog({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={!!order}
      onClose={onClose}
      title={order?.serviceTitle ?? "Buyurtma"}
      description="Buyurtma tafsilotlari."
    >
      {order && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Hash className="size-3.5" /> {order.id}
            </span>
            <OrderStatusBadge status={order.status} />
          </div>

          <dl className="divide-y divide-border rounded-xl border border-border">
            <DetailRow label="Tadbir sanasi" value={formatDate(order.eventDate)} />
            <DetailRow
              label="Hudud"
              value={
                order.region + (order.address ? `, ${order.address}` : "")
              }
            />
            <DetailRow label="Summa" value={formatUZS(order.amount)} />
            <DetailRow label="Mijoz" value={order.customerName} />
            <DetailRow label="Telefon" value={order.customerPhone} />
            <DetailRow
              label="Yaratilgan"
              value={formatDateTime(order.createdAt)}
            />
          </dl>

          {order.note && (
            <div>
              <div className="mb-1.5 text-sm font-medium text-foreground">
                Izoh
              </div>
              <p className="rounded-xl bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
                {order.note}
              </p>
            </div>
          )}

          {order.status === "rejected" && order.rejectionReason && (
            <div>
              <Badge variant="danger">Rad etilgan</Badge>
              <p className="mt-2 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] px-3 py-2.5 text-sm text-[var(--color-danger)]">
                {order.rejectionReason}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button asChild variant="outline">
              <Link href={`/xizmatlar/${order.serviceId}`}>Xizmatni ochish</Link>
            </Button>
            <Button variant="primary" onClick={onClose}>
              Yopish
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-3.5 py-2.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
