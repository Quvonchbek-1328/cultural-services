"use client";
import * as React from "react";
import { ChevronUp, ChevronDown, Search, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  align?: "left" | "right" | "center";
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  searchable = true,
  searchKeys,
  pageSize = 8,
  onRowClick,
  emptyLabel = "Ma'lumot topilmadi",
}: {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchKeys?: (row: T) => string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyLabel?: string;
}) {
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [page, setPage] = React.useState(0);

  const filtered = React.useMemo(() => {
    let rows = data;
    if (query && searchKeys) {
      const q = query.toLowerCase();
      rows = rows.filter((r) => searchKeys(r).toLowerCase().includes(q));
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col?.sortValue) {
        rows = [...rows].sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          const cmp = typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv));
          return sortDir === "asc" ? cmp : -cmp;
        });
      }
    }
    return rows;
  }, [data, query, sortKey, sortDir, columns, searchKeys]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const paged = filtered.slice(current * pageSize, current * pageSize + pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
      {searchable && (
        <div className="border-b border-border p-3">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Qidirish…"
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.sortValue && "cursor-pointer select-none hover:text-foreground",
                  )}
                  onClick={() => col.sortValue && toggleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {sortKey === col.key &&
                      (sortDir === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-border transition-colors last:border-0",
                  onRowClick && "cursor-pointer hover:bg-muted/40",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3 align-middle",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.className,
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <Inbox className="mx-auto mb-2 size-8 text-muted-foreground/60" />
                  <p className="text-sm text-muted-foreground">{emptyLabel}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            {current * pageSize + 1}–{Math.min((current + 1) * pageSize, filtered.length)} /{" "}
            {filtered.length} ta
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={current === 0}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-40 enabled:hover:bg-muted"
            >
              Oldingi
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={current >= pageCount - 1}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-40 enabled:hover:bg-muted"
            >
              Keyingi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
