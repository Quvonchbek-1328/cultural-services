"use client";
import * as React from "react";
import {
  Check, X, CheckCircle2, Phone, MapPin, CalendarDays, Wallet, StickyNote, Inbox, User, Layers, Handshake,
} from "lucide-react";
import { PageBanner } from "@/components/shared/page-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Label, Textarea } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/misc";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuthStore } from "@/lib/store/auth";
import { useAppStore } from "@/lib/store/app";
import { formatUZS, formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

type FilterTab = "all" | OrderStatus;

export default function TaqdimotchiBuyurtmalarPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const orders = useAppStore((s) => s.orders);
  const setOrderStatus = useAppStore((s) => s.setOrderStatus);

  const providerId = currentUser?.providerId;
  const myOrders = React.useMemo(
    () => orders.filter((o) => o.providerId === providerId),
    [orders, providerId],
  );

  const [tab, setTab] = React.useState<FilterTab>("all");
  const [rejectTarget, setRejectTarget] = React.useState<Order | null>(null);
  const [reason, setReason] = React.useState("");

  const counts = {
    all: myOrders.length,
    pending: myOrders.filter((o) => o.status === "pending").length,
    accepted: myOrders.filter((o) => o.status === "accepted").length,
    completed: myOrders.filter((o) => o.status === "completed").length,
    rejected: myOrders.filter((o) => o.status === "rejected").length,
  };

  const tabs = [
    { value: "all", label: "Hammasi", badge: <Badge variant="neutral">{counts.all}</Badge> },
    { value: "pending", label: "Kutilmoqda", badge: <Badge variant="warning">{counts.pending}</Badge> },
    { value: "accepted", label: "Qabul qilindi", badge: <Badge variant="info">{counts.accepted}</Badge> },
    { value: "completed", label: "Bajarildi", badge: <Badge variant="success">{counts.completed}</Badge> },
    { value: "rejected", label: "Rad etildi", badge: <Badge variant="danger">{counts.rejected}</Badge> },
  ];

  const filtered = (tab === "all" ? myOrders : myOrders.filter((o) => o.status === tab))
    .slice()
    .sort((a, b) => (a.eventDate < b.eventDate ? -1 : 1));

  const confirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;
    setOrderStatus(rejectTarget.id, "rejected", reason.trim() || "Sabab ko'rsatilmagan.");
    setRejectTarget(null);
    setReason("");
  };

  return (
    <div>
      <PageBanner
        variant="card"
        eyebrow="Boshqaruv"
        title="Buyurtmalar"
        description="Sizga kelgan buyurtmalarni qabul qiling, mijoz bilan bog'laning va tadbirni rejalashtiring."
        icons={["Inbox", "Phone", "CalendarCheck"]}
      />
      <Tabs tabs={tabs} value={tab} onValueChange={(v) => setTab(v as FilterTab)} className="mb-6" />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={tab === "all" ? "Hali buyurtmalar yo'q" : "Bu holatda buyurtma yo'q"}
          description={tab === "all" ? "Yangi buyurtmalar kelganda shu yerda paydo bo'ladi." : "Boshqa holatdagi buyurtmalarni ko'rish uchun yorliqlarni tanlang."}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((o) => (
            <Card key={o.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="line-clamp-1 font-semibold text-foreground">{o.serviceTitle}</h3>
                      {o.kind === "package" && <Badge variant="accent"><Layers className="mr-1 size-3" /> Jamlanma</Badge>}
                    </div>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground"><User className="size-3.5" /> {o.customerName}</p>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 text-sm sm:grid-cols-2">
                  <InfoRow icon={Phone} label="Telefon" value={o.customerPhone} />
                  <InfoRow icon={CalendarDays} label="Tadbir sanasi" value={formatDate(o.eventDate)} />
                  <InfoRow icon={MapPin} label="Manzil" value={`${o.region}${o.address ? `, ${o.address}` : ""}`} />
                  <InfoRow icon={Wallet} label="Summa" value={o.negotiated ? "Kelishiladi" : formatUZS(o.amount)} strong />
                </div>

                {o.note && (
                  <div className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
                    <StickyNote className="mt-0.5 size-4 shrink-0" /><span>{o.note}</span>
                  </div>
                )}

                {o.negotiated && o.status !== "rejected" && o.status !== "cancelled" && (
                  <div className="flex items-start gap-2 rounded-xl bg-primary-50 p-3 text-sm text-primary">
                    <Handshake className="mt-0.5 size-4 shrink-0" /><span>Narx kelishuv asosida — mijoz bilan bog'laning.</span>
                  </div>
                )}

                {o.status === "rejected" && o.rejectionReason && (
                  <div className="rounded-xl bg-[var(--color-danger-bg)]/60 p-3 text-sm text-[var(--color-danger)]">
                    <span className="font-semibold">Rad etish sababi: </span>{o.rejectionReason}
                  </div>
                )}

                {o.status === "pending" && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" className="flex-1" onClick={() => setOrderStatus(o.id, "accepted")}><Check /> Qabul qilish</Button>
                    <Button size="sm" variant="outline" className="text-danger hover:bg-[var(--color-danger-bg)]" onClick={() => { setReason(""); setRejectTarget(o); }}><X /> Rad etish</Button>
                  </div>
                )}
                {o.status === "accepted" && (
                  <div className="pt-1">
                    <Button size="sm" variant="secondary" className="w-full" onClick={() => setOrderStatus(o.id, "completed")}><CheckCircle2 /> Bajarildi deb belgilash</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Buyurtmani rad etish" description="Mijozga ko'rsatiladigan sababni kiriting.">
        <form onSubmit={confirmReject} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reason">Rad etish sababi</Label>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Masalan: Belgilangan sanada band, boshqa kunni taklif qilamiz." maxLength={300} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setRejectTarget(null)}>Bekor qilish</Button>
            <Button type="submit" variant="danger"><X /> Rad etish</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, strong }: { icon: typeof Phone; label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className={strong ? "font-display font-semibold text-foreground" : "text-foreground"}>{value}</div>
      </div>
    </div>
  );
}
