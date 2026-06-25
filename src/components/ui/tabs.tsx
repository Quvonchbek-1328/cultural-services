"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface Tab {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export function Tabs({
  tabs,
  value,
  onValueChange,
  className,
  variant = "pill",
}: {
  tabs: Tab[];
  value: string;
  onValueChange: (v: string) => void;
  className?: string;
  variant?: "pill" | "underline";
}) {
  if (variant === "underline") {
    return (
      <div className={cn("flex gap-1 overflow-x-auto border-b border-border scrollbar-none", className)}>
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => onValueChange(t.value)}
            className={cn(
              "relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
              value === t.value
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.icon}
            {t.label}
            {t.badge}
            {value === t.value && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl bg-muted p-1 overflow-x-auto scrollbar-none",
        className,
      )}
    >
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onValueChange(t.value)}
          className={cn(
            "flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-all",
            value === t.value
              ? "bg-surface text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t.icon}
          {t.label}
          {t.badge}
        </button>
      ))}
    </div>
  );
}
