"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REGIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SearchBar({ className, big }: { className?: string; big?: boolean }) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [region, setRegion] = React.useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (region) params.set("viloyat", region);
    router.push(`/xizmatlar${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "flex flex-col gap-2 rounded-2xl border border-border bg-surface p-2 shadow-card sm:flex-row sm:items-center",
        className,
      )}
    >
      <div className="flex flex-1 items-center gap-2 px-3">
        <Search className="size-5 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Xizmat qidiring: xonanda, fotograf, raqs jamoasi…"
          className={cn(
            "w-full bg-transparent outline-none placeholder:text-muted-foreground",
            big ? "h-12 text-base" : "h-10 text-sm",
          )}
        />
      </div>
      <div className="flex items-center gap-2 border-t border-border px-3 sm:border-l sm:border-t-0">
        <MapPin className="size-5 shrink-0 text-muted-foreground" />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className={cn(
            "w-full bg-transparent outline-none sm:w-40",
            big ? "h-12 text-base" : "h-10 text-sm",
          )}
        >
          <option value="">Barcha viloyatlar</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" size={big ? "lg" : "md"} className="sm:px-8">
        <Search /> Qidirish
      </Button>
    </form>
  );
}
