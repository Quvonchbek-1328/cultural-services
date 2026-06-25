"use client";
import * as React from "react";
import { History } from "lucide-react";
import { useAudit } from "@/lib/store/audit";
import { useHydrated } from "@/lib/store/hydrated";
import { ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AuditEntityType } from "@/lib/types";

/** "15.06.2026 10:25" ko'rinishi (spec audit misoliga mos). */
function fmt(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Obyekt (xizmat/jamlanma) bo'yicha tasdiqlash jarayoni tarixi — kim/qachon/rol/qaror. */
export function AuditTimeline({
  entityType,
  entityId,
  className,
}: {
  entityType: AuditEntityType;
  entityId: string;
  className?: string;
}) {
  const hydrated = useHydrated();
  const entries = useAudit((s) => s.entries);
  if (!hydrated) return null;

  const list = entries
    .filter((e) => e.entityType === entityType && e.entityId === entityId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (!list.length) return null;

  return (
    <div className={cn("rounded-xl border border-border bg-muted/30 p-3", className)}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <History className="size-3.5" /> Jarayon tarixi
      </div>
      <ol className="mt-2 space-y-2">
        {list.map((e) => (
          <li key={e.id} className="flex items-start gap-2 text-xs">
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
            <div className="min-w-0">
              <span className="font-semibold text-foreground">{e.actorName}</span>
              <span className="text-muted-foreground">
                {" · "}
                {e.actorRole === "system" ? "Tizim" : ROLE_LABELS[e.actorRole]}
              </span>
              <div className="text-muted-foreground">
                {e.action}
                {e.note ? `: ${e.note}` : ""} · {fmt(e.createdAt)}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
