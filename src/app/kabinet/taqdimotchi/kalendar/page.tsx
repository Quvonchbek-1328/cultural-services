"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Phone, Wallet, User, Layers } from "lucide-react";
import { PageBanner } from "@/components/shared/page-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuthStore } from "@/lib/store/auth";
import { useAppStore } from "@/lib/store/app";
import { formatUZS, cn } from "@/lib/utils";
import type { Order } from "@/lib/types";

const UZ_MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
const WEEKDAYS = ["Du", "Se", "Cho", "Pa", "Ju", "Sh", "Ya"];
const REFERENCE_TODAY = new Date("2026-06-16");
const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export default function TaqdimotchiKalendarPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const orders = useAppStore((s) => s.orders);
  const providerId = currentUser?.providerId;

  const calendarOrders = React.useMemo(
    () => orders.filter((o) => o.providerId === providerId && (o.status === "accepted" || o.status === "completed")),
    [orders, providerId],
  );

  const byDate = React.useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const o of calendarOrders) {
      const key = o.eventDate.slice(0, 10);
      const arr = map.get(key) ?? [];
      arr.push(o);
      map.set(key, arr);
    }
    return map;
  }, [calendarOrders]);

  const [year, setYear] = React.useState(REFERENCE_TODAY.getUTCFullYear());
  const [month, setMonth] = React.useState(REFERENCE_TODAY.getUTCMonth());
  const todayKey = ymd(REFERENCE_TODAY.getUTCFullYear(), REFERENCE_TODAY.getUTCMonth(), REFERENCE_TODAY.getUTCDate());
  const [selected, setSelected] = React.useState<string | null>(null);

  const goPrev = () => { setSelected(null); if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
  const goNext = () => { setSelected(null); if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); };

  const firstDay = new Date(year, month, 1);
  const leadingBlanks = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(leadingBlanks).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedOrders = selected ? byDate.get(selected) ?? [] : [];

  return (
    <div>
      <PageBanner
        variant="card"
        eyebrow="Jadval"
        title="Kalendar"
        description="Tasdiqlangan va bajarilgan buyurtmalaringiz sanalar bo'yicha."
        icons={["CalendarDays", "CalendarCheck"]}
      />
      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold tracking-tight">{UZ_MONTHS[month]} {year}</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goPrev} aria-label="Oldingi oy"><ChevronLeft /></Button>
              <Button variant="outline" size="icon" onClick={goNext} aria-label="Keyingi oy"><ChevronRight /></Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {WEEKDAYS.map((w) => (
              <div key={w} className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">{w}</div>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <div key={`b-${i}`} className="aspect-square" />;
              const key = ymd(year, month, day);
              const dayOrders = byDate.get(key) ?? [];
              const hasOrders = dayOrders.length > 0;
              const isToday = key === todayKey;
              const isSelected = key === selected;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelected(hasOrders ? (isSelected ? null : key) : key)}
                  className={cn(
                    "relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm transition-all",
                    isSelected ? "border-primary bg-primary text-white shadow-soft" : hasOrders ? "border-primary-200 bg-primary-50 text-primary hover:bg-primary-100" : "border-border bg-surface text-foreground hover:bg-muted",
                    isToday && !isSelected && "ring-2 ring-accent ring-offset-1",
                  )}
                >
                  <span className={cn("font-medium", isToday && "font-bold")}>{day}</span>
                  {hasOrders && (
                    <span className={cn("mt-1 inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-4", isSelected ? "bg-white text-primary" : "bg-primary text-white")}>{dayOrders.length}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2"><span className="inline-block size-3 rounded-md border border-primary-200 bg-primary-50" /> Buyurtma bor</span>
            <span className="inline-flex items-center gap-2"><span className="inline-block size-3 rounded-md bg-primary" /> Tanlangan kun</span>
            <span className="inline-flex items-center gap-2"><span className="inline-block size-3 rounded-md ring-2 ring-accent" /> Bugun</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        {selected ? (
          selectedOrders.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><CalendarDays className="size-4 text-primary" /> {selected} — {selectedOrders.length} ta buyurtma</div>
              {selectedOrders.map((o) => (
                <Card key={o.id}>
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-semibold text-foreground">{o.serviceTitle}{o.kind === "package" && <Badge variant="accent"><Layers className="mr-1 size-3" /> Jamlanma</Badge>}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><User className="size-3.5" /> {o.customerName}</span>
                        <span className="inline-flex items-center gap-1"><Phone className="size-3.5" /> {o.customerPhone}</span>
                        <span className="inline-flex items-center gap-1 font-medium text-foreground"><Wallet className="size-3.5" /> {o.negotiated ? "Kelishiladi" : formatUZS(o.amount)}</span>
                      </div>
                    </div>
                    <OrderStatusBadge status={o.status} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState icon={CalendarDays} title="Bu kunda buyurtma yo'q" description={`${selected} sanasida tasdiqlangan buyurtmalar mavjud emas.`} />
          )
        ) : (
          <p className="text-center text-sm text-muted-foreground">Buyurtmalarni ko'rish uchun kalendardan kun tanlang.</p>
        )}
      </div>
    </div>
  );
}
