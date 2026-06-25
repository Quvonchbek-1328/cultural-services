"use client";
import * as React from "react";
import { Eye, EyeOff, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tabs } from "@/components/ui/tabs";
import { Stars } from "@/components/shared/rating-badge";
import { ReviewStatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useAppStore } from "@/lib/store/app";
import { formatDate } from "@/lib/utils";
import type { ReviewStatus } from "@/lib/types";

type ReviewFilter = "all" | ReviewStatus;

export default function AdminReviewsPage() {
  const reviews = useAppStore((s) => s.reviews);
  const services = useAppStore((s) => s.services);
  const setReviewStatus = useAppStore((s) => s.setReviewStatus);

  const [filter, setFilter] = React.useState<ReviewFilter>("all");
  const [query, setQuery] = React.useState("");

  const serviceTitle = (id: string) =>
    services.find((s) => s.id === id)?.title ?? "Noma'lum xizmat";

  const sorted = React.useMemo(
    () => [...reviews].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [reviews],
  );

  const filtered = React.useMemo(() => {
    let rows = sorted;
    if (filter !== "all") rows = rows.filter((r) => r.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.authorName.toLowerCase().includes(q) ||
          r.text.toLowerCase().includes(q) ||
          serviceTitle(r.serviceId).toLowerCase().includes(q),
      );
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted, filter, query]);

  const count = (f: ReviewFilter) =>
    f === "all" ? reviews.length : reviews.filter((r) => r.status === f).length;

  const tabs = [
    { value: "all", label: "Hammasi", badge: <Badge variant="neutral">{count("all")}</Badge> },
    { value: "visible", label: "Ko'rinadigan", badge: <Badge variant="success">{count("visible")}</Badge> },
    { value: "hidden", label: "Yashirilgan", badge: <Badge variant="neutral">{count("hidden")}</Badge> },
  ];

  return (
    <div>
      <PageHeader
        title="Sharhlar moderatsiyasi"
        description="Foydalanuvchi sharhlarini ko'rib chiqing — nomaqbul sharhlarni yashiring."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="overflow-x-auto">
          <Tabs tabs={tabs} value={filter} onValueChange={(v) => setFilter(v as ReviewFilter)} />
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Muallif yoki matn bo'yicha qidirish…"
          className="h-10 w-full rounded-xl border border-input bg-surface px-3.5 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring sm:w-72"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Sharhlar topilmadi"
          description="Tanlangan filtr bo'yicha sharhlar mavjud emas."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-soft sm:flex-row sm:items-start"
            >
              <Avatar src={r.authorAvatar} name={r.authorName} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground">{r.authorName}</span>
                  <Stars rating={r.rating} />
                  <ReviewStatusBadge status={r.status} />
                  <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Xizmat: <span className="font-medium text-foreground">{serviceTitle(r.serviceId)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{r.text}</p>
              </div>
              <div className="shrink-0">
                {r.status === "visible" ? (
                  <Button size="sm" variant="outline" onClick={() => setReviewStatus(r.id, "hidden")}>
                    <EyeOff /> Yashirish
                  </Button>
                ) : (
                  <Button size="sm" variant="soft" onClick={() => setReviewStatus(r.id, "visible")}>
                    <Eye /> Ko'rsatish
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
