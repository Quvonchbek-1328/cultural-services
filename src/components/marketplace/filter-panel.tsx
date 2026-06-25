"use client";
import * as React from "react";
import { RotateCcw, Star } from "lucide-react";
import { Label, Select } from "@/components/ui/input";
import { Slider } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  DIRECTIONS_BY_CATEGORY,
  REGIONS,
  DISTRICTS,
  PRICE_MAX,
  RATING_OPTIONS,
} from "@/lib/constants";
import { formatUZS, cn } from "@/lib/utils";

export interface Filters {
  q: string;
  region: string;
  district: string;
  directions: string[];
  maxPrice: number;
  minRating: number;
  sort: string;
}

export const DEFAULT_FILTERS: Filters = {
  q: "",
  region: "",
  district: "",
  directions: [],
  maxPrice: PRICE_MAX,
  minRating: 0,
  sort: "tavsiya",
};

export function FilterPanel({
  value,
  onChange,
  onReset,
}: {
  value: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}) {
  const districts = value.region ? DISTRICTS[value.region] ?? [] : [];

  function toggleDirection(id: string) {
    onChange({
      directions: value.directions.includes(id)
        ? value.directions.filter((d) => d !== id)
        : [...value.directions, id],
    });
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filtrlar</h3>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3.5" /> Tozalash
        </button>
      </div>

      {/* Viloyat */}
      <div className="space-y-1.5">
        <Label>Viloyat</Label>
        <Select
          value={value.region}
          onChange={(e) => onChange({ region: e.target.value, district: "" })}
        >
          <option value="">Barcha viloyatlar</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </Select>
      </div>

      {/* Tuman */}
      <div className="space-y-1.5">
        <Label>Tuman</Label>
        <Select
          value={value.district}
          onChange={(e) => onChange({ district: e.target.value })}
          disabled={!value.region}
        >
          <option value="">Barcha tumanlar</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Select>
      </div>

      {/* Kategoriya → Yo'nalish */}
      <div className="space-y-3">
        <Label>Kategoriya va yo'nalish</Label>
        {CATEGORIES.map((c) => (
          <div key={c.id}>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {c.name}
            </div>
            <div className="mt-1.5 space-y-1">
              {(DIRECTIONS_BY_CATEGORY[c.id] ?? []).map((d) => {
                const checked = value.directions.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggleDirection(d.id)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1 text-left text-sm hover:bg-muted"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                        checked ? "border-primary bg-primary text-white" : "border-input bg-surface",
                      )}
                    >
                      {checked && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </span>
                    <span>{d.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Narx oralig'i */}
      <div className="space-y-2">
        <Label>Maksimal narx</Label>
        <Slider
          value={value.maxPrice}
          min={0}
          max={PRICE_MAX}
          step={500_000}
          onChange={(v) => onChange({ maxPrice: v })}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span className="font-medium text-foreground">{formatUZS(value.maxPrice, { compact: true })}</span>
        </div>
      </div>

      {/* Reyting */}
      <div className="space-y-2">
        <Label>Reyting</Label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange({ minRating: 0 })}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              value.minRating === 0 ? "border-primary bg-primary-50 text-primary" : "border-border hover:bg-muted",
            )}
          >
            Barchasi
          </button>
          {RATING_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChange({ minRating: r })}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                value.minRating === r ? "border-primary bg-primary-50 text-primary" : "border-border hover:bg-muted",
              )}
            >
              <Star className="size-3 fill-accent text-accent" /> {r}+
            </button>
          ))}
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={onReset}>
        Filtrlarni tozalash
      </Button>
    </div>
  );
}
