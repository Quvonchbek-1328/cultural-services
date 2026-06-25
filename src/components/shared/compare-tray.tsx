"use client";
import Link from "next/link";
import { GitCompare, X } from "lucide-react";
import { useCompare } from "@/lib/store/compare";
import { useHydrated } from "@/lib/store/hydrated";

/** Sahifaning pastida suzuvchi solishtirish paneli. */
export function CompareTray() {
  const { items, clear } = useCompare();
  const hydrated = useHydrated();
  if (!hydrated || items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-2.5 shadow-card">
        <span className="flex items-center gap-2 text-sm font-medium">
          <GitCompare className="size-5 text-primary" />
          {items.length} ta tanlandi
        </span>
        <Link
          href="/solishtirish"
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          Solishtirish
        </Link>
        <button
          onClick={clear}
          aria-label="Tozalash"
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
